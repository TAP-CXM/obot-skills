import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith("--")) continue;
    const key = part.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function slugify(value) {
  return String(value || "campaign")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "campaign";
}

function asList(value) {
  return Array.isArray(value) ? value : [];
}

function boolToYesNo(value) {
  if (value === null || value === undefined || value === "") return "";
  return value ? "Yes" : "No";
}

function valueOrBlank(value) {
  return value ?? "";
}

function joinLines(items) {
  return asList(items).filter(Boolean).join("\n");
}

function setCell(sheet, address, value) {
  sheet.getRange(address).values = [[valueOrBlank(value)]];
}

function formatDate(value) {
  return valueOrBlank(value);
}

function buildBrdMarkdown(input) {
  const lines = [];
  const overview = input.overview || {};
  const summary = input.summary || {};
  const targeting = input.targeting || {};
  const delivery = input.delivery || {};
  const governance = input.governance || {};

  const section = (title) => {
    lines.push(`## ${title}`, "");
  };

  const bullets = (items) => {
    for (const [label, value] of items) {
      lines.push(`- ${label}: ${valueOrBlank(value)}`);
    }
    lines.push("");
  };

  lines.push("# Business Requirements Document", "");

  section("1. Overview");
  bullets([
    ["Campaign name", overview.campaign_name],
    ["Internal code", overview.internal_campaign_code],
    ["Owner", governance.owner],
    ["Date", governance.document_date],
    ["Version", governance.current_version],
  ]);

  section("2. Business Context");
  bullets([
    ["What is happening", summary.business_context],
    ["Why this campaign is needed now", summary.why_now],
    ["Related initiative", summary.related_initiative],
  ]);

  section("3. Objective and Success Measures");
  bullets([
    ["Primary objective", summary.primary_objective],
    ["Secondary objective", summary.secondary_objective],
    ["KPIs", joinLines(summary.kpis)],
    ["Hypothesis", summary.hypothesis],
  ]);

  section("4. Audience and Eligibility");
  bullets([
    ["Primary audience", targeting.audience_description],
    ["Inclusion criteria", joinLines(targeting.inclusions)],
    ["Exclusion criteria", joinLines(targeting.exclusions)],
    ["Suppression rules", joinLines(targeting.suppressions)],
    ["Control group approach", targeting.control_group?.description],
  ]);

  section("5. Journey and Delivery Logic");
  bullets([
    ["Channels in scope", joinLines(overview.channels)],
    ["Delivery sequence", joinLines(asList(targeting.deliveries).map((item) => `${item.sequence || ""} ${item.label || ""}`.trim()))],
    ["Timing rules", targeting.timing_rules],
    ["Trigger or schedule logic", targeting.trigger_logic],
    ["Quarantine, throttling, or priority rules", targeting.operational_rules],
  ]);

  section("6. Messaging and Offer Strategy");
  bullets([
    ["Core proposition", summary.single_minded_message],
    ["Offer details", summary.offer],
    ["CTA strategy", summary.primary_cta],
    ["Tone and personalization approach", delivery.tone_and_personalization],
  ]);

  section("7. Content and Creative Requirements");
  bullets([
    ["Required modules or content blocks", joinLines(asList(delivery.content_modules).map((item) => item.module))],
    ["Subject line or headline direction", delivery.subject_line],
    ["Asset requirements", joinLines(delivery.asset_requirements)],
    ["Landing-page or destination requirements", joinLines(asList(delivery.content_modules).map((item) => item.link_url).filter(Boolean))],
    ["Localization or variant needs", delivery.localization_notes],
  ]);

  section("8. Data and Personalization Requirements");
  bullets([
    ["Required data fields", joinLines(asList(delivery.personalization_fields).map((item) => item.description))],
    ["Dynamic content logic", joinLines(asList(delivery.content_modules).map((item) => item.rule))],
    ["Default values", joinLines(asList(delivery.personalization_fields).map((item) => item.default_value_or_skip_condition))],
    ["Fallback or skip conditions", joinLines(asList(delivery.personalization_fields).map((item) => item.default_value_or_skip_condition))],
  ]);

  section("9. Testing and QA");
  bullets([
    ["Proof or UAT recipients", joinLines(asList(targeting.proof_list).map((item) => `${item.first_name || ""} ${item.last_name || ""} <${item.email || ""}>`.trim()))],
    ["Variants and test plan", summary.test_plan],
    ["QA checkpoints", joinLines(delivery.qa_checkpoints)],
    ["Dependencies before launch", joinLines(summary.dependencies)],
  ]);

  section("10. Risks, Dependencies, and Approvals");
  bullets([
    ["Risks", joinLines(summary.risks)],
    ["Compliance considerations", joinLines(summary.compliance_considerations)],
    ["Dependencies", joinLines(summary.dependencies)],
    ["Required approvers", joinLines(asList(governance.approvals).map((item) => item.name))],
  ]);

  section("11. Assumptions and Open Questions");
  bullets([
    ["Assumptions", joinLines(summary.assumptions)],
    ["Open questions", joinLines(summary.open_questions)],
  ]);

  return `${lines.join("\n").trim()}\n`;
}

function ensureReferenceValues(sheet, data) {
  const mainChannels = ["Email", "Direct Mail", "SMS", "Outbound Telemarketing"];
  const deliveryChannels = ["Email", "Direct Mail", "SMS", "Outbound Telemarketing"];
  for (const channel of asList(data.overview?.channels)) {
    if (!mainChannels.includes(channel)) mainChannels.push(channel);
    if (!deliveryChannels.includes(channel)) deliveryChannels.push(channel);
  }
  for (const delivery of asList(data.targeting?.deliveries)) {
    if (delivery.channel && !deliveryChannels.includes(delivery.channel)) {
      deliveryChannels.push(delivery.channel);
    }
  }

  mainChannels.forEach((value, index) => setCell(sheet, `C${3 + index}`, value));
  const deliveryStartRow = 13;
  deliveryChannels.forEach((value, index) => setCell(sheet, `G${deliveryStartRow + index}`, value));
}

async function populateWorkbook(workbookPath, input, outPath) {
  const file = await FileBlob.load(workbookPath);
  const workbook = await SpreadsheetFile.importXlsx(file);
  const summarySheet = workbook.worksheets.getItem("Summary");
  const tdSheet = workbook.worksheets.getItem("Targeting & Delivery");
  const deliverySheet = workbook.worksheets.getItem("Delivery");
  const referenceSheet = workbook.worksheets.getItem("Reference");

  const overview = input.overview || {};
  const summary = input.summary || {};
  const targeting = input.targeting || {};
  const delivery = input.delivery || {};
  const governance = input.governance || {};

  setCell(summarySheet, "M3", overview.campaign_name || "");
  setCell(summarySheet, "E6", overview.campaign_name);
  setCell(summarySheet, "E7", overview.internal_campaign_code);
  setCell(summarySheet, "C8", overview.primary_channel);
  setCell(summarySheet, "D8", overview.secondary_channel);
  setCell(summarySheet, "E8", overview.tertiary_channel);
  setCell(summarySheet, "G8", summary.campaign_plan);
  setCell(summarySheet, "M6", summary.campaign_template);
  setCell(summarySheet, "M7", summary.campaign_nature);
  setCell(summarySheet, "P7", summary.campaign_frequency);
  setCell(summarySheet, "C9", formatDate(summary.start_date));
  setCell(summarySheet, "G9", formatDate(summary.end_date));
  setCell(summarySheet, "M8", summary.program_level_1);
  setCell(summarySheet, "P8", summary.program_level_2);
  setCell(summarySheet, "M9", summary.program_level_3);
  setCell(summarySheet, "P9", summary.program_level_4);
  setCell(summarySheet, "B12", summary.description);
  setCell(summarySheet, "B17", summary.hypothesis);
  setCell(summarySheet, "E17", summary.expected_open_rate);
  setCell(summarySheet, "O17", summary.expected_ctor);
  setCell(summarySheet, "E18", summary.expected_conversion_rate);
  setCell(summarySheet, "O18", summary.expected_ctr_delivered);
  setCell(summarySheet, "E21", governance.delivery_outline_name);
  setCell(summarySheet, "E22", governance.delivery_outline_internal_name);
  setCell(summarySheet, "J21", overview.primary_channel);
  setCell(summarySheet, "J22", summary.description);
  setCell(summarySheet, "P21", governance.estimated_provisional_cost);

  const documents = asList(governance.documents).slice(0, 2);
  while (documents.length < 2) documents.push({});
  [24, 25].forEach((row, index) => {
    const item = documents[index];
    setCell(summarySheet, `B${row}`, item.name);
    setCell(summarySheet, `J${row}`, item.nature);
    setCell(summarySheet, `O${row}`, item.last_modified);
  });

  const versions = asList(governance.version_history).slice(0, 2);
  while (versions.length < 2) versions.push({});
  [29, 30].forEach((row, index) => {
    const item = versions[index];
    setCell(summarySheet, `B${row}`, item.version_no);
    setCell(summarySheet, `D${row}`, item.author);
    setCell(summarySheet, `J${row}`, item.date);
    setCell(summarySheet, `K${row}`, item.comments);
  });

  const approvals = asList(governance.approvals).slice(0, 1);
  while (approvals.length < 1) approvals.push({});
  setCell(summarySheet, "B34", approvals[0].name);
  setCell(summarySheet, "J34", approvals[0].date);
  setCell(summarySheet, "K34", approvals[0].comments);

  setCell(tdSheet, "E6", targeting.workflow_name);
  setCell(tdSheet, "N6", targeting.workflow_internal_name);
  setCell(tdSheet, "B9", targeting.audience_description);
  setCell(tdSheet, "J9", targeting.audience_rules);

  const inclusions = asList(targeting.inclusions).slice(0, 3);
  const exclusions = asList(targeting.exclusions).slice(0, 3);
  for (let i = 0; i < 3; i += 1) {
    setCell(tdSheet, `B${20 + i}`, inclusions[i] || "");
    setCell(tdSheet, `F${20 + i}`, inclusions[i] ? "Yes" : "");
    setCell(tdSheet, `J${20 + i}`, exclusions[i] || "");
    setCell(tdSheet, `N${20 + i}`, exclusions[i] ? "Yes" : "");
  }

  setCell(tdSheet, "F25", boolToYesNo(targeting.control_group?.campaign_enabled));
  setCell(tdSheet, "I25", targeting.control_group?.campaign_size);
  setCell(tdSheet, "F26", boolToYesNo(targeting.control_group?.universal_enabled));

  const deliveries = asList(targeting.deliveries).slice(0, 2);
  while (deliveries.length < 2) deliveries.push({});
  setCell(tdSheet, "D29", deliveries[0].label);
  setCell(tdSheet, "J29", deliveries[0].channel);
  setCell(tdSheet, "P29", deliveries[0].quarantine_period);
  setCell(tdSheet, "D30", deliveries[0].code);
  setCell(tdSheet, "J30", deliveries[0].nature);
  setCell(tdSheet, "P30", deliveries[0].throttle_rate);
  setCell(tdSheet, "D31", deliveries[0].description);
  setCell(tdSheet, "J31", deliveries[0].launch_date);
  setCell(tdSheet, "P31", deliveries[0].send_sequence);

  setCell(tdSheet, "E34", targeting.automated_quarantine_days);
  setCell(tdSheet, "H34", targeting.automated_priority_description);

  const segments = asList(targeting.segments).slice(0, 2);
  while (segments.length < 2) segments.push({});
  [38, 39].forEach((row, index) => {
    const item = segments[index];
    setCell(tdSheet, `B${row}`, item.code || `SEG${index + 1}`);
    setCell(tdSheet, `D${row}`, item.rule);
    setCell(tdSheet, `J${row}`, item.treatment);
    setCell(tdSheet, `O${row}`, item.delivery_label);
  });

  const proofs = asList(targeting.proof_list).slice(0, 3);
  while (proofs.length < 3) proofs.push({});
  [43, 44, 45].forEach((row, index) => {
    const item = proofs[index];
    setCell(tdSheet, `B${row}`, item.first_name);
    setCell(tdSheet, `E${row}`, item.last_name);
    setCell(tdSheet, `H${row}`, item.email);
    setCell(tdSheet, `N${row}`, item.version_to_send);
  });

  setCell(deliverySheet, "D6", delivery.delivery_label);
  setCell(deliverySheet, "M6", delivery.delivery_code);
  setCell(deliverySheet, "B9", joinLines([
    delivery.subject_line,
    delivery.paragraph_1_summary,
    delivery.paragraph_2_summary,
    delivery.paragraph_3_summary,
    delivery.additional_content,
  ].filter(Boolean)));
  setCell(deliverySheet, "O9", delivery.content_summary);
  setCell(deliverySheet, "J10", boolToYesNo(delivery.html_supplied));
  setCell(deliverySheet, "L10", boolToYesNo(delivery.include_offer_space));
  setCell(deliverySheet, "O10", delivery.offer_space_notes);

  const personalizationFields = asList(delivery.personalization_fields).slice(0, 7);
  while (personalizationFields.length < 7) personalizationFields.push({});
  [18, 19, 20, 21, 22, 23, 24].forEach((row, index) => {
    const item = personalizationFields[index];
    setCell(deliverySheet, `B${row}`, item.type);
    setCell(deliverySheet, `C${row}`, item.description);
    setCell(deliverySheet, `H${row}`, item.example_value);
    setCell(deliverySheet, `J${row}`, item.field_name);
    setCell(deliverySheet, `N${row}`, item.default_value_or_skip_condition);
  });

  const modules = asList(delivery.content_modules).slice(0, 9);
  while (modules.length < 9) modules.push({});
  [29, 30, 31, 32, 33, 34, 35, 36, 37].forEach((row, index) => {
    const item = modules[index];
    setCell(deliverySheet, `B${row}`, item.module);
    setCell(deliverySheet, `C${row}`, item.audience);
    setCell(deliverySheet, `E${row}`, item.rule);
    setCell(deliverySheet, `G${row}`, item.image);
    setCell(deliverySheet, `I${row}`, item.copy);
    setCell(deliverySheet, `P${row}`, item.link_url);
    setCell(deliverySheet, `T${row}`, item.link_label);
    setCell(deliverySheet, `W${row}`, item.notes);
  });

  ensureReferenceValues(referenceSheet, input);

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  const exported = await SpreadsheetFile.exportXlsx(workbook);
  await exported.save(outPath);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.outdir) {
    throw new Error("Usage: node generate_campaign_outputs.mjs --input <campaign.json> --outdir <dir> [--template <template.xlsx>]");
  }

  const inputPath = path.resolve(args.input);
  const outDir = path.resolve(args.outdir);
  const raw = await fs.readFile(inputPath, "utf8");
  const input = JSON.parse(raw);
  const slug = slugify(input.overview?.campaign_name || input.overview?.internal_campaign_code || "campaign");
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const templatePath = path.resolve(
    args.template || path.join(scriptDir, "..", "assets", "TAP London - Campaign Brief Template.xlsx"),
  );

  const workbookOut = path.join(outDir, `${slug}-campaign-brief.xlsx`);
  const brdOut = path.join(outDir, `${slug}-brd.md`);
  const brdDocxOut = path.join(outDir, `${slug}-brd.docx`);

  await populateWorkbook(templatePath, input, workbookOut);
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(brdOut, buildBrdMarkdown(input), "utf8");

  const pythonBin = args.python || process.env.BUNDLED_PYTHON || "python";
  const docxScriptPath = path.join(scriptDir, "generate_brd_docx.py");

  await new Promise((resolve, reject) => {
    const child = spawn(
      pythonBin,
      [docxScriptPath, "--input", inputPath, "--output", brdDocxOut],
      { stdio: "inherit" },
    );
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`generate_brd_docx.py exited with code ${code}`));
    });
    child.on("error", reject);
  });

  process.stdout.write(`${workbookOut}\n${brdOut}\n${brdDocxOut}\n`);
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
