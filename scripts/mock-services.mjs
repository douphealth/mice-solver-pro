// Local stand-ins for Stripe and Brevo so the full purchase flow can be tested without real accounts or money.
// Session scenarios are chosen by the id's prefix after cs_test_: PAID, UNPAID, REFUNDED, OTHER, NOEXPAND
import http from "node:http";

const PORT = Number(process.env.MOCK_PORT || 9911);
const calls = { stripe: [], brevo: [] };

const session = (id, over = {}) => ({
  object: "checkout.session", id, mode: "payment", status: "complete", payment_status: "paid",
  payment_link: "plink_1UCvLgGCqwm95OGXtz60RBjB", created: 1790000000, livemode: false,
  customer_details: { email: "buyer@example.com" }, ...over,
});
const charge = over => ({ payment_intent: { latest_charge: { refunded: false, amount: 999, amount_refunded: 0, disputed: false, ...over } } });

function scenario(id, expanded) {
  if (id.startsWith("cs_test_PAID")) return session(id, expanded ? charge({}) : {});
  if (id.startsWith("cs_test_UNPAID")) return session(id, { status: "open", payment_status: "unpaid" });
  if (id.startsWith("cs_test_REFUNDED")) return session(id, expanded ? charge({ refunded: true, amount_refunded: 999 }) : {});
  if (id.startsWith("cs_test_OTHER")) return session(id, { payment_link: "plink_some_other_site" });
  if (id.startsWith("cs_test_NOEXPAND")) return session(id, {});
  return null;
}

const send = (res, status, body) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };

http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  let raw = "";
  req.on("data", c => (raw += c));
  req.on("end", () => {
    if (url.pathname === "/__calls") return send(res, 200, calls);
    if (url.pathname === "/__reset") { calls.stripe.length = 0; calls.brevo.length = 0; return send(res, 200, { ok: true }); }

    if (url.pathname.startsWith("/v1/")) {
      calls.stripe.push({ method: req.method, path: url.pathname, query: url.search, auth: Boolean(req.headers.authorization) });
      const m = url.pathname.match(/^\/v1\/checkout\/sessions\/(cs_[A-Za-z0-9_]+)$/);
      if (m) {
        const expanded = url.searchParams.has("expand[]");
        if (expanded && m[1].startsWith("cs_test_NOEXPAND")) return send(res, 403, { error: { message: "The provided key does not have the required permissions" } });
        const s = scenario(m[1], expanded);
        return s ? send(res, 200, s) : send(res, 404, { error: { message: `No such checkout.session: '${m[1]}'` } });
      }
      if (url.pathname === "/v1/checkout/sessions") {
        const email = url.searchParams.get("customer_details[email]");
        return send(res, 200, { data: email === "buyer@example.com" ? [session("cs_test_PAID0000RESTORE", { created: 1790000100 })] : [] });
      }
      return send(res, 404, { error: { message: "not mocked" } });
    }

    if (url.pathname.startsWith("/v3/")) {
      let body = {};
      try { body = JSON.parse(raw || "{}"); } catch { /* ignore */ }
      calls.brevo.push({ path: url.pathname.replace("/v3", ""), body });
      return send(res, 201, { id: calls.brevo.length });
    }
    send(res, 404, { error: "unknown" });
  });
}).listen(PORT, "127.0.0.1", () => console.log(`mock services on http://127.0.0.1:${PORT}`));
