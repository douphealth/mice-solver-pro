import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MiceLeadPayload {
  email: string;
  name?: string;
  severity?: number;
  species?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload: MiceLeadPayload = await req.json();
    const { email, name, severity, species } = payload;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ ok: false, message: "Please provide a valid email address." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 1. Insert/Upsert into the email_subscribers database table
    const sourceTag = species 
      ? `quiz_gate_${species.toLowerCase().replace(/\s+/g, '_')}_${severity ?? 'unknown'}`
      : 'quiz_gate';

    const { data: dbData, error: dbError } = await supabaseClient
      .from("email_subscribers")
      .upsert(
        {
          email: email.trim().toLowerCase(),
          name: name?.trim() || null,
          source: sourceTag,
        },
        { onConflict: "email" }
      )
      .select();

    if (dbError) {
      console.error("Database upsert failed:", dbError);
      // We log but don't fail completely if we want to still send emails, 
      // however a database failure is critical, so let's log it.
    }

    // 2. Generate Email Templates
    const senderEmail = "MiceGoneGuide <no-reply@micegoneguide.com>";
    
    // Dynamic parameters for templates
    const userName = name?.trim() || "";
    const speciesName = species || "Rodent (Unspecified)";
    
    let severityLabel = "Unknown";
    let severityColor = "#5c6b63";
    let severityBg = "#f2efe8";
    let severityDesc = "";

    if (severity !== undefined) {
      if (severity <= 3) {
        severityLabel = "Low Infestation";
        severityColor = "#137333";
        severityBg = "#e6f4ea";
        severityDesc = "A localized, early-stage issue. Highly manageable with prompt DIY containment and exclusion.";
      } else if (severity <= 6) {
        severityLabel = "Moderate Infestation";
        severityColor = "#b06000";
        severityBg = "#fef7e0";
        severityDesc = "Established mouse activity. Requires immediate trapping, strict sanitation, and comprehensive entry-point sealing.";
      } else {
        severityLabel = "Severe Infestation";
        severityColor = "#c5221f";
        severityBg = "#fce8e6";
        severityDesc = "Widespread activity or potential nesting. Demands an aggressive multi-room trapping strategy, sealing, and possible professional support.";
      }
    }

    let speciesAdvice = "Be careful when dealing with nesting sites and droppings.";
    if (speciesName.toLowerCase().includes("deer")) {
      speciesAdvice = "Deer Mice are major carriers of Hantavirus. Exercise extreme caution. Never dry sweep or vacuum droppings. Always wear gloves and use a disinfectant spray.";
    } else if (speciesName.toLowerCase().includes("house")) {
      speciesAdvice = "House Mice reproduce rapidly, with a single female having up to 10 litters a year. Speed is key to prevent an exponential population boom.";
    }

    // Helper to generate layout
    const getEmailLayout = (title: string, bodyHtml: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f7f5f0;
      color: #17261f;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f7f5f0;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(23, 38, 31, 0.05);
      border: 1px solid #e1ded7;
    }
    .header {
      background-color: #133d26;
      padding: 32px 40px;
      text-align: center;
    }
    .header h1 {
      color: #f7f5f0;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .header p {
      color: rgba(247, 245, 240, 0.7);
      margin: 8px 0 0 0;
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .content {
      padding: 40px;
    }
    .footer {
      background-color: #f2efe8;
      padding: 24px 40px;
      text-align: center;
      font-size: 12px;
      color: #5c6b63;
      border-top: 1px solid #e1ded7;
    }
    .footer p {
      margin: 4px 0;
    }
    .footer a {
      color: #133d26;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>MiceGoneGuide</h1>
        <p>${title}</p>
      </div>
      <div class="content">
        ${bodyHtml}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} MiceGoneGuide. All rights reserved.</p>
        <p>You received this email because you took our diagnostic quiz.</p>
        <p>MiceGoneGuide, for informational purposes only.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Email 0: Welcome / Immediate Blueprint
    const email0Html = getEmailLayout(
      "Personalized Diagnostic Blueprint",
      `
      <p style="font-size: 16px; line-height: 1.6; color: #17261f; margin-bottom: 24px;">
        Hi ${userName || "there"},
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #17261f; margin-bottom: 24px;">
        Your personalized mouse infestation diagnosis is complete. Based on your quiz responses, we've compiled your customized elimination blueprint to help you take back control of your home starting tonight.
      </p>

      <!-- Diagnosis Card -->
      <div style="background-color: #fcfbfa; border: 1px solid #e1ded7; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
        <h3 style="margin-top: 0; color: #133d26; font-size: 18px; font-weight: 600; margin-bottom: 16px;">Infestation Summary</h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
          <tr>
            <td style="padding: 6px 0; color: #5c6b63; width: 40%;">Severity Score:</td>
            <td style="padding: 6px 0; font-weight: 600;">
              <span style="display: inline-block; padding: 3px 10px; border-radius: 20px; font-weight: 700; font-size: 12px; background-color: ${severityBg}; color: ${severityColor};">
                ${severity !== undefined ? `${severity}/10` : "N/A"} - ${severityLabel}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #5c6b63;">Identified Species:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #17261f;">${speciesName}</td>
          </tr>
        </table>
        
        <p style="margin: 16px 0 0 0; font-size: 14px; line-height: 1.5; color: #5c6b63; font-style: italic;">
          <strong>Note:</strong> ${severityDesc} ${speciesAdvice}
        </p>
      </div>

      <!-- Action Steps -->
      <h3 style="color: #133d26; font-size: 18px; font-weight: 600; margin-bottom: 16px; border-bottom: 2px solid #f2efe8; padding-bottom: 8px;">
        Tonight's Top 3 Actions
      </h3>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="width: 32px; vertical-align: top; padding-top: 4px; font-size: 18px;">✅</td>
          <td style="vertical-align: top; padding-bottom: 16px; padding-left: 8px;">
            <strong style="color: #133d26; font-size: 15px;">1. Secure All Food Sources</strong><br/>
            <span style="font-size: 14px; color: #5c6b63; line-height: 1.5; display: inline-block; margin-top: 4px;">
              Mice are attracted to easy meals. Move dry foods, grains, and pet food from bags or cardboard boxes into airtight glass, metal, or heavy plastic containers. Wipe down counters and vacuum crumbs.
            </span>
          </td>
        </tr>
        <tr>
          <td style="width: 32px; vertical-align: top; padding-top: 4px; font-size: 18px;">✅</td>
          <td style="vertical-align: top; padding-bottom: 16px; padding-left: 8px;">
            <strong style="color: #133d26; font-size: 15px;">2. Set First-Line Trapping Routes</strong><br/>
            <span style="font-size: 14px; color: #5c6b63; line-height: 1.5; display: inline-block; margin-top: 4px;">
              Position snap traps along walls where you have seen droppings or signs of activity. Mice navigate by keeping their whiskers against walls, so traps placed perpendicular to the wall are 3x more likely to trigger.
            </span>
          </td>
        </tr>
        <tr>
          <td style="width: 32px; vertical-align: top; padding-top: 4px; font-size: 18px;">✅</td>
          <td style="vertical-align: top; padding-bottom: 16px; padding-left: 8px;">
            <strong style="color: #133d26; font-size: 15px;">3. Clear Ground-Level Clutter</strong><br/>
            <span style="font-size: 14px; color: #5c6b63; line-height: 1.5; display: inline-block; margin-top: 4px;">
              Mice thrive in hiding spots. Declutter floors, especially in closets, pantries, and garages, to remove potential nesting materials and nesting grounds near their active pathways.
            </span>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="margin: 36px 0; text-align: center;">
        <a href="https://elimination.micegoneguide.com/report" style="display: inline-block; background-color: #e5981a; color: #17261f; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(229, 152, 26, 0.25);">
          View Your Full Interactive Report &rarr;
        </a>
      </div>
      
      <p style="font-size: 15px; line-height: 1.6; color: #5c6b63; margin-top: 24px;">
        In 24 hours, we'll send you our professional <strong>Entry-Point Sealing checklist</strong> to help you secure the perimeter of your home and make sure no new mice can get inside.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #17261f; margin-top: 32px; margin-bottom: 0;">
        Stay safe,<br/>
        <strong>The MiceGoneGuide Team</strong>
      </p>
      `
    );

    // Email 1: Day 1 Sealing Checklist
    const email1Html = getEmailLayout(
      "Tonight's Containment Guide",
      `
      <p style="font-size: 16px; line-height: 1.6; color: #17261f; margin-bottom: 24px;">
        Hi ${userName || "there"},
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #17261f; margin-bottom: 24px;">
        Yesterday, we mapped out your initial containment steps. Trapping is crucial to catch active rodents inside, but <strong>exclusion (sealing them out)</strong> is the only way to solve a mouse problem permanently.
      </p>

      <!-- Pro Tip Box -->
      <div style="background-color: #f0f6f2; border: 1px solid #c2dbcd; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h4 style="margin-top: 0; color: #133d26; font-size: 16px; font-weight: 600; margin-bottom: 8px;">💡 Pro Trapping Advice</h4>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #17261f;">
          Most homeowners place too few traps. If you think you have 2 mice, you likely have 10. Set at least 12–15 traps for a moderate infestation. Use a pea-sized amount of peanut butter or hazelnut spread—too much bait lets them lick it off without triggering the snap.
        </p>
      </div>

      <!-- Entry Point Checklist -->
      <h3 style="color: #133d26; font-size: 18px; font-weight: 600; margin-bottom: 16px; border-bottom: 2px solid #f2efe8; padding-bottom: 8px;">
        How to Seal Your Entry Points
      </h3>
      
      <p style="font-size: 15px; line-height: 1.5; color: #17261f; margin-bottom: 16px;">
        A mouse can squeeze through a gap as small as a dime (1/4 inch). Inspect these common zones today:
      </p>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="width: 32px; vertical-align: top; padding-top: 4px; font-size: 18px;">🛡️</td>
          <td style="vertical-align: top; padding-bottom: 16px; padding-left: 8px;">
            <strong style="color: #133d26; font-size: 15px;">Under-Sink Pipe Escutcheons</strong><br/>
            <span style="font-size: 14px; color: #5c6b63; line-height: 1.5; display: inline-block; margin-top: 4px;">
              Look where copper/PVC pipes enter walls under kitchen and bathroom sinks. Pull back loose metal plates (escutcheons) and pack gaps with copper mesh or steel wool, then seal with silicone caulk.
            </span>
          </td>
        </tr>
        <tr>
          <td style="width: 32px; vertical-align: top; padding-top: 4px; font-size: 18px;">🛡️</td>
          <td style="vertical-align: top; padding-bottom: 16px; padding-left: 8px;">
            <strong style="color: #133d26; font-size: 15px;">Garage Door Corners & Thresholds</strong><br/>
            <span style="font-size: 14px; color: #5c6b63; line-height: 1.5; display: inline-block; margin-top: 4px;">
              Mice chew through the soft rubber seals at the bottom corners of garage doors. Install metal guard plates or heavy-duty rodent-proof door sweeps.
            </span>
          </td>
        </tr>
        <tr>
          <td style="width: 32px; vertical-align: top; padding-top: 4px; font-size: 18px;">🛡️</td>
          <td style="vertical-align: top; padding-bottom: 16px; padding-left: 8px;">
            <strong style="color: #133d26; font-size: 15px;">Foundation Vents & Weep Holes</strong><br/>
            <span style="font-size: 14px; color: #5c6b63; line-height: 1.5; display: inline-block; margin-top: 4px;">
              Brick weep holes should be fitted with stainless steel weep hole covers or mesh inserts to allow airflow while keeping rodents out.
            </span>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="margin: 36px 0; text-align: center;">
        <a href="https://elimination.micegoneguide.com/tools/entry-points" style="display: inline-block; background-color: #133d26; color: #f7f5f0; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(19, 61, 38, 0.25);">
          Open Free Entry Point Finder &rarr;
        </a>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #17261f; margin-top: 32px; margin-bottom: 0;">
        Let's keep your home secure,<br/>
        <strong>The MiceGoneGuide Team</strong>
      </p>
      `
    );

    // Email 2: Day 7 Cleanup / CDC Guidelines
    const email2Html = getEmailLayout(
      "CDC Decontamination & Safety",
      `
      <p style="font-size: 16px; line-height: 1.6; color: #17261f; margin-bottom: 24px;">
        Hi ${userName || "there"},
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #17261f; margin-bottom: 24px;">
        It's been a week since your diagnostic quiz. Hopefully, your trapping and sealing efforts have significantly reduced or completely stopped rodent activity. 
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #17261f; margin-bottom: 24px;">
        Now, it is critical to focus on **safe cleanup**. Mouse droppings, urine, and nesting materials harbor pathogens that cause Salmonellosis, Leptospirosis, and Hantavirus.
      </p>

      <!-- DANGER WARNING BOX -->
      <div style="background-color: #fdf2f2; border: 1px solid #f8b4b4; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h4 style="margin-top: 0; color: #c5221f; font-size: 16px; font-weight: 600; margin-bottom: 8px;">⚠️ NEVER Sweep or Vacuum Droppings</h4>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #17261f;">
          Sweeping or vacuuming kicks up dry microscopic viral particles into the air, which you can easily inhale. Always wet-clean using a disinfectant to trap dust and pathogens.
        </p>
      </div>

      <!-- Step-by-Step CDC-Aligned Cleanup -->
      <h3 style="color: #133d26; font-size: 18px; font-weight: 600; margin-bottom: 16px; border-bottom: 2px solid #f2efe8; padding-bottom: 8px;">
        How to Clean Up Safely
      </h3>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; line-height: 1.5; color: #5c6b63;">
        <tr>
          <td style="width: 28px; vertical-align: top; font-weight: bold; color: #133d26; font-size: 16px;">1.</td>
          <td style="vertical-align: top; padding-bottom: 12px; padding-left: 6px;">
            <strong style="color: #17261f;">Spritz and Soak:</strong> Spray droppings and nesting material with a commercial disinfectant or a 1:10 bleach-to-water mixture. Let it sit for 5 minutes to fully saturate and kill pathogens.
          </td>
        </tr>
        <tr>
          <td style="width: 28px; vertical-align: top; font-weight: bold; color: #133d26; font-size: 16px;">2.</td>
          <td style="vertical-align: top; padding-bottom: 12px; padding-left: 6px;">
            <strong style="color: #17261f;">Wipe, Don't Sweep:</strong> Wear rubber or latex gloves. Wipe up the wet droppings using paper towels or disposable cloths.
          </td>
        </tr>
        <tr>
          <td style="width: 28px; vertical-align: top; font-weight: bold; color: #133d26; font-size: 16px;">3.</td>
          <td style="vertical-align: top; padding-bottom: 12px; padding-left: 6px;">
            <strong style="color: #17261f;">Double Bag and Seal:</strong> Place the soiled paper towels and nesting materials in a plastic bag, seal it tightly, place it inside a second plastic bag, seal that one, and throw it in an outdoor trash bin.
          </td>
        </tr>
        <tr>
          <td style="width: 28px; vertical-align: top; font-weight: bold; color: #133d26; font-size: 16px;">4.</td>
          <td style="vertical-align: top; padding-bottom: 12px; padding-left: 6px;">
            <strong style="color: #17261f;">Mop and Sanitize:</strong> Mop the surrounding floors and sanitize any countertops. Wash your gloved hands with soap, remove the gloves, and wash your bare hands thoroughly.
          </td>
        </tr>
      </table>

      <!-- CTA / Pro Report Promotion -->
      <div style="margin: 36px 0; text-align: center; background-color: #fcfbfa; border: 1px dashed #e1ded7; border-radius: 8px; padding: 24px;">
        <p style="margin-top: 0; font-size: 14px; color: #17261f; font-weight: 600;">Need a room-by-room, detailed decontamination protocol?</p>
        <a href="https://elimination.micegoneguide.com/report#pricing" style="display: inline-block; background-color: #e5981a; color: #17261f; font-weight: 700; font-size: 14px; text-decoration: none; padding: 10px 20px; border-radius: 6px; margin-top: 8px;">
          Upgrade to Pro Report
        </a>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #17261f; margin-top: 32px; margin-bottom: 0;">
        Stay safe and clean,<br/>
        <strong>The MiceGoneGuide Team</strong>
      </p>
      `
    );

    // Email 3: Day 30 Prevention
    const email3Html = getEmailLayout(
      "30-Day Check-in & Long-term Prevention",
      `
      <p style="font-size: 16px; line-height: 1.6; color: #17261f; margin-bottom: 24px;">
        Hi ${userName || "there"},
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #17261f; margin-bottom: 24px;">
        It has been exactly 30 days since you performed your initial mouse assessment. In most cases, 30 days of consistent exclusion and trapping is enough to achieve a **completely rodent-free home**.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #17261f; margin-bottom: 24px;">
        Let's run a quick diagnostic check to make sure they are gone for good and won't return.
      </p>

      <!-- Re-assessment checklist -->
      <div style="background-color: #fcfbfa; border: 1px solid #e1ded7; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
        <h3 style="margin-top: 0; color: #133d26; font-size: 18px; font-weight: 600; margin-bottom: 16px;">The 30-Day Re-assessment</h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f2efe8;">
            <td style="padding: 10px 0; width: 30px; font-size: 16px;">❓</td>
            <td style="padding: 10px 0; color: #17261f;">Have you seen any fresh droppings in kitchen cabinets, pantries, or closets in the last 14 days?</td>
          </tr>
          <tr style="border-bottom: 1px solid #f2efe8;">
            <td style="padding: 10px 0; width: 30px; font-size: 16px;">❓</td>
            <td style="padding: 10px 0; color: #17261f;">Have you heard scratching, squeaking, or chewing sounds in walls or ceilings at night?</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; width: 30px; font-size: 16px;">❓</td>
            <td style="padding: 10px 0; color: #17261f;">Have you found any new chew marks on food packaging, cabinets, or baseboards?</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #17261f;">
        If you answered <strong>YES</strong> to any of these questions, you may have a persistent entry point that was missed, or an ongoing nesting issue. We recommend retaking our diagnostic quiz to re-evaluate.
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #17261f;">
        If you answered <strong>NO</strong> to all of them, congratulations! You have successfully reclaimed your home. Now, let's make sure it stays that way.
      </p>

      <!-- Long-term Prevention Guide -->
      <h3 style="color: #133d26; font-size: 18px; font-weight: 600; margin-bottom: 16px; border-bottom: 2px solid #f2efe8; padding-bottom: 8px;">
        Long-Term Prevention Checklist
      </h3>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="width: 32px; vertical-align: top; padding-top: 4px; font-size: 18px;">🛡️</td>
          <td style="vertical-align: top; padding-bottom: 16px; padding-left: 8px;">
            <strong style="color: #133d26; font-size: 15px;">Clear Outdoor Perimeter</strong><br/>
            <span style="font-size: 14px; color: #5c6b63; line-height: 1.5; display: inline-block; margin-top: 4px;">
              Keep bushes, tree limbs, and tall grass trimmed back at least 18 inches away from your foundation. Overhanging branches act as mouse-highways straight to your roof or attic.
            </span>
          </td>
        </tr>
        <tr>
          <td style="width: 32px; vertical-align: top; padding-top: 4px; font-size: 18px;">🛡️</td>
          <td style="vertical-align: top; padding-bottom: 16px; padding-left: 8px;">
            <strong style="color: #133d26; font-size: 15px;">Manage Trash & Compost</strong><br/>
            <span style="font-size: 14px; color: #5c6b63; line-height: 1.5; display: inline-block; margin-top: 4px;">
              Ensure outdoor garbage cans have tightly fitting lids. Never leave pet food bowls outside overnight, as this is a prime attractant for neighborhood rodents.
            </span>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="margin: 36px 0; text-align: center;">
        <a href="https://elimination.micegoneguide.com/quiz" style="display: inline-block; background-color: #133d26; color: #f7f5f0; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(19, 61, 38, 0.25);">
          Retake the Quiz to Re-assess &rarr;
        </a>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #17261f; margin-top: 32px; margin-bottom: 0;">
        Best wishes for a pest-free home,<br/>
        <strong>The MiceGoneGuide Team</strong>
      </p>
      `
    );

    // 3. Send/Schedule the Emails via Resend
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not defined. Simulating email logs instead of sending.");
      console.log(`[MOCK EMAIL 0] To: ${email}, Subject: 📦 Your Mouse Elimination Blueprint: ${severity ?? '?'}/10 Infestation Report`);
      console.log(`[MOCK EMAIL 1] To: ${email}, Subject: 🚨 Action plan check-in: Tonight's containment steps for your ${speciesName} (Scheduled for in 24 hours)`);
      console.log(`[MOCK EMAIL 2] To: ${email}, Subject: 🧹 Clean up safely: The CDC-aligned mouse decontamination guide (Scheduled for in 7 days)`);
      console.log(`[MOCK EMAIL 3] To: ${email}, Subject: 🛡️ 30-Day Check-in: Are they gone for good? (Scheduled for in 30 days)`);
      
      return new Response(
        JSON.stringify({ ok: true, message: "Lead captured. Email sequence simulated successfully." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const sendResendEmail = async (subject: string, htmlContent: string, scheduledAt?: string) => {
      const payload: Record<string, any> = {
        from: senderEmail,
        to: [email],
        subject,
        html: htmlContent,
      };
      
      if (scheduledAt) {
        payload.scheduled_at = scheduledAt;
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend send failed: ${response.status} - ${errorText}`);
      }

      return response.json();
    };

    // Calculate dates for scheduled emails
    const nowMs = Date.now();
    const day1SendTime = new Date(nowMs + 24 * 60 * 60 * 1000).toISOString();
    const day7SendTime = new Date(nowMs + 7 * 24 * 60 * 60 * 1000).toISOString();
    const day30SendTime = new Date(nowMs + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Send Email 0 immediately
    console.log(`Sending immediate Blueprint email to ${email}`);
    await sendResendEmail(
      `📦 Your Mouse Elimination Blueprint: ${severity !== undefined ? `${severity}/10` : ""} Infestation Report`,
      email0Html
    );

    // Schedule Email 1 (+24h)
    console.log(`Scheduling Day 1 Containment email to ${email} for ${day1SendTime}`);
    await sendResendEmail(
      `🚨 Action plan check-in: Tonight's containment steps for your ${speciesName}`,
      email1Html,
      day1SendTime
    );

    // Schedule Email 2 (+7d)
    console.log(`Scheduling Day 7 Cleanup email to ${email} for ${day7SendTime}`);
    await sendResendEmail(
      `🧹 Clean up safely: The CDC-aligned mouse decontamination guide`,
      email2Html,
      day7SendTime
    );

    // Schedule Email 3 (+30d)
    console.log(`Scheduling Day 30 Prevention email to ${email} for ${day30SendTime}`);
    await sendResendEmail(
      `🛡️ 30-Day Check-in: Are they gone for good?`,
      email3Html,
      day30SendTime
    );

    return new Response(
      JSON.stringify({ ok: true, message: "Lead captured and email sequence scheduled successfully." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in mice-elimination-lead function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
