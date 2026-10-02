// Creates .dev.vars with local mock values if it does not exist (CI and fresh checkouts). Never overwrites a real file.
import { existsSync, writeFileSync } from "node:fs";
if (!existsSync(".dev.vars")) {
  writeFileSync(".dev.vars", [
    "STRIPE_SECRET_KEY=sk_test_local_mock_not_a_real_key",
    "STRIPE_API_BASE=http://127.0.0.1:9911",
    "BREVO_API_KEY=local-mock-key",
    "BREVO_API_BASE=http://127.0.0.1:9911/v3",
    "STRIPE_WEBHOOK_SECRET=whsec_local_mock_secret",
    "DISABLE_RATE_LIMIT=1",
    "",
  ].join("\n"));
  console.log("created .dev.vars with local mock values");
}
