import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

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
  if (!sheet) return;
  sheet.xml = setCellXml(sheet.xml, address, valueOrBlank(value));
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
  const workbook = await loadWorkbook(workbookPath);
  const summarySheet = getWorksheet(workbook, "Summary", 1);
  const tdSheet = getWorksheet(workbook, "Targeting & Delivery", 2) || getWorksheet(workbook, "Targeting", 2);
  const deliverySheet = getWorksheet(workbook, "Delivery", 3);
  const referenceSheet = getWorksheet(workbook, "Reference");

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
  await saveWorkbook(workbook, outPath);
}

async function loadWorkbook(workbookPath) {
  const entries = readZipEntries(await fs.readFile(workbookPath));
  const byName = new Map(entries.map((entry) => [entry.name, entry.content]));
  const sheetPaths = discoverWorksheetPaths(byName);
  const worksheets = new Map();
  for (const [name, sheetPath] of Object.entries(sheetPaths.byName)) {
    const content = byName.get(sheetPath);
    if (content) worksheets.set(name, { path: sheetPath, xml: content.toString("utf8") });
  }
  return { entries, byName, worksheets, sheetPaths };
}

function getWorksheet(workbook, name, fallbackIndex) {
  const exact = workbook.worksheets.get(name.toLowerCase());
  if (exact) return exact;
  if (!fallbackIndex) return undefined;
  const fallbackPath = `xl/worksheets/sheet${fallbackIndex}.xml`;
  const content = workbook.byName.get(fallbackPath);
  if (!content) return undefined;
  const fallback = { path: fallbackPath, xml: content.toString("utf8") };
  workbook.worksheets.set(`__fallback_${fallbackIndex}`, fallback);
  return fallback;
}

async function saveWorkbook(workbook, outPath) {
  for (const sheet of workbook.worksheets.values()) {
    workbook.byName.set(sheet.path, Buffer.from(sheet.xml, "utf8"));
  }
  workbook.byName.delete("xl/calcChain.xml");
  const entries = workbook.entries
    .filter((entry) => entry.name !== "xl/calcChain.xml")
    .map((entry) => ({ name: entry.name, content: workbook.byName.get(entry.name) || entry.content }));
  await fs.writeFile(outPath, createZip(entries));
}

function discoverWorksheetPaths(entries) {
  const workbook = entries.get("xl/workbook.xml")?.toString("utf8") || "";
  const rels = entries.get("xl/_rels/workbook.xml.rels")?.toString("utf8") || "";
  const relTargets = new Map();
  for (const match of rels.matchAll(/<Relationship\b[^>]*\bId="([^"]+)"[^>]*\bTarget="([^"]+)"[^>]*>/g)) {
    relTargets.set(match[1], normalizeWorksheetPath(match[2]));
  }

  const byName = {};
  for (const match of workbook.matchAll(/<sheet\b[^>]*\bname="([^"]+)"[^>]*\br:id="([^"]+)"[^>]*>/g)) {
    const target = relTargets.get(match[2]);
    if (target) byName[decodeXml(match[1]).toLowerCase()] = target;
  }
  return { byName };
}

function normalizeWorksheetPath(target) {
  const cleaned = target.replace(/^\/+/, "");
  return cleaned.startsWith("xl/") ? cleaned : `xl/${cleaned}`;
}

function setCellXml(xml, address, value) {
  const rowNumber = address.match(/\d+$/)?.[0];
  if (!rowNumber) return xml;
  const rowPattern = new RegExp(`<row\\b[^>]*\\br="${escapeRegExp(rowNumber)}"[^>]*>[\\s\\S]*?<\\/row>`);
  return xml.replace(rowPattern, (rowXml) => {
    const escapedAddress = escapeRegExp(address);
    const cellPattern = new RegExp(
      `<c\\b([^>]*)\\br="${escapedAddress}"([^>]*)\\/>|<c\\b([^>]*)\\br="${escapedAddress}"([^>]*)>(?:[\\s\\S]*?)<\\/c>`,
    );
    return rowXml.replace(cellPattern, (_match, beforeSelf = "", afterSelf = "", beforeOpen = "", afterOpen = "") => {
      const attrs = `${beforeSelf} ${afterSelf} ${beforeOpen} ${afterOpen}`;
      const style = attrs.match(/\bs="[^"]+"/)?.[0] || "";
      return `<c r="${address}"${style ? ` ${style}` : ""} t="inlineStr"><is><t xml:space="preserve">${escapeXml(String(valueOrBlank(value)))}</t></is></c>`;
    });
  });
}

function campaignInputFromBrief(content) {
  const fields = parseBriefFields(content);
  const title = firstNonEmpty(
    getField(fields, "Campaign name", "Name", "Campaign"),
    firstHeading(content),
    "Outbound campaign",
  );
  const audience = firstNonEmpty(
    getField(fields, "Audience", "Primary audience", "Target audience"),
    sectionText(content, "Audience"),
    "Audience to be confirmed",
  );
  const objective = firstNonEmpty(
    getField(fields, "Objective", "Primary objective", "Campaign goal", "Goal"),
    sectionText(content, "Objective and success metrics", "Objective"),
    "Campaign objective to be confirmed",
  );
  const offer = firstNonEmpty(getField(fields, "Offer", "Value proposition"), sectionText(content, "Offer and CTA"));
  const cta = firstNonEmpty(getField(fields, "CTA", "Primary CTA", "Call to action"), "Primary CTA to be confirmed");
  const message = firstNonEmpty(
    getField(fields, "Message strategy", "Single-minded message", "Key message"),
    sectionText(content, "Message strategy"),
    objective,
  );
  const channelText = firstNonEmpty(
    getField(fields, "Channel", "Channels", "Channel plan"),
    sectionText(content, "Channel plan"),
    content,
  );
  const channels = detectChannels(channelText);
  const primaryChannel = channels[0] || "Email";
  const timing = firstNonEmpty(getField(fields, "Timing", "Timeline", "Send logic"), sectionText(content, "Timeline or send logic"));
  const metrics = splitList(firstNonEmpty(getField(fields, "Success", "Success metrics", "KPI", "KPIs"), sectionText(content, "Objective and success metrics")));
  const assumptions = splitList(sectionText(content, "Open questions and assumptions", "Assumptions"));
  const questions = splitList(sectionText(content, "Open questions", "Questions"));
  const internalCode = slugify(title).toUpperCase().replace(/-/g, "_");

  return {
    overview: {
      campaign_name: title,
      internal_campaign_code: internalCode,
      channels,
      primary_channel: primaryChannel,
      secondary_channel: channels[1] || "",
      tertiary_channel: channels[2] || "",
    },
    summary: {
      campaign_template: "Outbound campaign brief",
      campaign_nature: inferCampaignNature(content),
      campaign_frequency: "One-off",
      campaign_plan: firstNonEmpty(getField(fields, "Campaign plan"), "CRM outbound campaign"),
      plan_mode: "Draft",
      start_date: firstNonEmpty(getField(fields, "Start date", "Launch date"), timing),
      end_date: getField(fields, "End date"),
      description: firstNonEmpty(getField(fields, "Campaign summary", "Summary", "Description"), sectionText(content, "Campaign summary"), content),
      business_context: sectionText(content, "Campaign summary", "Business context"),
      why_now: getField(fields, "Why now"),
      primary_objective: objective,
      secondary_objective: getField(fields, "Secondary objective"),
      offer,
      primary_cta: cta,
      single_minded_message: message,
      hypothesis: firstNonEmpty(getField(fields, "Hypothesis"), `If we send ${message}, then ${audience} should be more likely to act.`),
      kpis: metrics,
      expected_open_rate: "",
      expected_ctor: "",
      expected_conversion_rate: "",
      expected_ctr_delivered: "",
      test_plan: firstNonEmpty(getField(fields, "Test plan"), "Define test/control or content variant before launch."),
      dependencies: splitList(sectionText(content, "Risks, dependencies, and approvals", "Dependencies")),
      risks: splitList(sectionText(content, "Risks")),
      compliance_considerations: splitList(sectionText(content, "Compliance")),
      assumptions,
      open_questions: questions,
    },
    targeting: {
      workflow_name: title,
      workflow_internal_name: internalCode,
      audience_description: audience,
      audience_rules: firstNonEmpty(getField(fields, "Audience rules", "Targeting rules"), audience),
      inclusions: splitList(firstNonEmpty(getField(fields, "Inclusions"), audience)),
      exclusions: splitList(getField(fields, "Exclusions", "Suppressions")),
      suppressions: splitList(getField(fields, "Suppressions")),
      control_group: {
        campaign_enabled: false,
        campaign_size: "",
        universal_enabled: false,
      },
      deliveries: [
        {
          label: `${primaryChannel} delivery`,
          code: `${internalCode}_${primaryChannel.toUpperCase()}`,
          channel: primaryChannel,
          nature: inferCampaignNature(content),
          description: message,
          launch_date: timing,
          send_sequence: "1",
          quarantine_period: "",
          throttle_rate: "",
        },
      ],
      automated_quarantine_days: "",
      automated_priority_description: "",
      timing_rules: timing,
      trigger_logic: timing,
      operational_rules: "",
      segments: [
        {
          code: "SEG1",
          rule: audience,
          treatment: message,
          delivery_label: `${primaryChannel} delivery`,
        },
      ],
      proof_list: [],
    },
    delivery: {
      delivery_label: `${primaryChannel} delivery`,
      delivery_code: `${internalCode}_${primaryChannel.toUpperCase()}`,
      subject_line: getField(fields, "Subject line", "Headline"),
      paragraph_1_summary: message,
      paragraph_2_summary: offer,
      paragraph_3_summary: cta,
      additional_content: firstNonEmpty(getField(fields, "Creative requirements"), sectionText(content, "Creative and production requirements")),
      content_summary: message,
      html_supplied: false,
      include_offer_space: Boolean(offer),
      offer_space_notes: offer,
      tone_and_personalization: getField(fields, "Tone", "Personalization"),
      asset_requirements: splitList(sectionText(content, "Creative and production requirements", "Asset requirements")),
      localization_notes: getField(fields, "Localization"),
      qa_checkpoints: ["Confirm audience counts", "Validate personalization fallback", "Send and approve proof"],
      personalization_fields: [],
      content_modules: [
        {
          module: "Primary message",
          audience,
          rule: "Default",
          image: "",
          copy: message,
          link_url: "",
          link_label: cta,
          notes: offer,
        },
      ],
    },
    governance: {
      owner: getField(fields, "Owner"),
      document_date: new Date().toISOString().slice(0, 10),
      current_version: "0.1",
      delivery_outline_name: `${title} delivery outline`,
      delivery_outline_internal_name: internalCode,
      estimated_provisional_cost: "",
      documents: [{ name: "Campaign brief", nature: "Brief", last_modified: new Date().toISOString().slice(0, 10) }],
      version_history: [{ version_no: "0.1", author: "Outbound Campaign Brief skill", date: new Date().toISOString().slice(0, 10), comments: "Draft generated from latest brief" }],
      approvals: [{ name: "Pending approval", date: "", comments: "" }],
    },
  };
}

function parseBriefFields(content) {
  const fields = {};
  let currentField = "";
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:[-*]\s*)?([A-Za-z][A-Za-z0-9 /&()_-]{1,64})\s*:\s*(.*)$/);
    if (match) {
      currentField = match[1].trim();
      fields[currentField] = match[2].trim();
    } else if (currentField && line.trim() && !line.trim().startsWith("#")) {
      fields[currentField] = `${fields[currentField]}\n${line.trim()}`.trim();
    }
  }
  return fields;
}

function sectionText(content, ...names) {
  const escaped = names.map((name) => escapeRegExp(name)).join("|");
  const match = content.match(new RegExp(`^#{1,4}\\s*(?:${escaped})\\s*$([\\s\\S]*?)(?=^#{1,4}\\s+|$)`, "im"));
  return match?.[1]?.trim() || "";
}

function firstHeading(content) {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim() || "";
}

function getField(fields, ...names) {
  const normalized = new Map(Object.entries(fields).map(([key, value]) => [normalizeKey(key), value]));
  for (const name of names) {
    const exact = normalized.get(normalizeKey(name));
    if (exact) return exact;
  }
  for (const name of names) {
    const target = normalizeKey(name);
    const fuzzy = Object.entries(fields).find(([key]) => normalizeKey(key).includes(target));
    if (fuzzy?.[1]) return fuzzy[1];
  }
  return "";
}

function detectChannels(value) {
  const channels = [
    ["email", "Email"],
    ["sms", "SMS"],
    ["whatsapp", "WhatsApp"],
    ["push", "Push"],
    ["in-app", "In-app"],
    ["in app", "In-app"],
    ["direct mail", "Direct Mail"],
  ];
  const lower = String(value || "").toLowerCase();
  const found = channels.filter(([token]) => lower.includes(token)).map(([, label]) => label);
  return Array.from(new Set(found.length ? found : ["Email"]));
}

function inferCampaignNature(content) {
  const lower = String(content || "").toLowerCase();
  if (lower.includes("reactivation") || lower.includes("win-back") || lower.includes("winback")) return "Reactivation";
  if (lower.includes("launch")) return "Product launch";
  if (lower.includes("newsletter")) return "Newsletter";
  if (lower.includes("offer") || lower.includes("sale") || lower.includes("discount")) return "Promotional";
  return "Lifecycle";
}

function splitList(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value || "")
    .split(/\n|;|(?:,\s+(?=[a-z0-9]))/i)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 8);
}

function firstNonEmpty(...values) {
  return values.map((value) => stringifyValue(value)).find(Boolean) || "";
}

function stringifyValue(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(stringifyValue).filter(Boolean).join("\n");
  if (typeof value === "object") return Object.values(value).map(stringifyValue).filter(Boolean).join("\n");
  return String(value).trim();
}

function normalizeKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readZipEntries(bytes) {
  const entries = [];
  let centralOffset = centralDirectoryOffset(bytes);
  while (centralOffset !== -1 && centralOffset + 46 <= bytes.length) {
    if (bytes.readUInt32LE(centralOffset) !== 0x02014b50) break;
    const method = bytes.readUInt16LE(centralOffset + 10);
    const compressedSize = bytes.readUInt32LE(centralOffset + 20);
    const fileNameLength = bytes.readUInt16LE(centralOffset + 28);
    const extraLength = bytes.readUInt16LE(centralOffset + 30);
    const commentLength = bytes.readUInt16LE(centralOffset + 32);
    const localOffset = bytes.readUInt32LE(centralOffset + 42);
    const nameStart = centralOffset + 46;
    const name = bytes.subarray(nameStart, nameStart + fileNameLength).toString("utf8");
    const localFileNameLength = bytes.readUInt16LE(localOffset + 26);
    const localExtraLength = bytes.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localFileNameLength + localExtraLength;
    const data = bytes.subarray(dataStart, dataStart + compressedSize);
    entries.push({
      name,
      content: method === 8 ? inflateRawSync(data) : Buffer.from(data),
    });
    centralOffset += 46 + fileNameLength + extraLength + commentLength;
  }
  return entries;
}

function centralDirectoryOffset(bytes) {
  for (let index = bytes.length - 22; index >= 0; index -= 1) {
    if (bytes.readUInt32LE(index) === 0x06054b50) {
      return bytes.readUInt32LE(index + 16);
    }
  }
  return -1;
}

function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const data = entry.content;
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function decodeXml(value) {
  return String(value)
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if ((!args.input && !args.brief) || !args.outdir) {
    throw new Error("Usage: node generate_campaign_outputs.mjs --input <campaign.json> --outdir <dir> [--template <template.xlsx>] [--outputs workbook,brd,docx]");
  }

  const inputPath = args.input ? path.resolve(args.input) : "";
  const outDir = path.resolve(args.outdir);
  const input = args.input
    ? JSON.parse(await fs.readFile(inputPath, "utf8"))
    : campaignInputFromBrief(await fs.readFile(path.resolve(args.brief), "utf8"));
  const slug = slugify(input.overview?.campaign_name || input.overview?.internal_campaign_code || "campaign");
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const templatePath = path.resolve(
    args.template || path.join(scriptDir, "..", "assets", "TAP CXM - Campaign Brief Template.xlsx"),
  );

  const workbookOut = path.join(outDir, `${slug}-campaign-brief.xlsx`);
  const brdOut = path.join(outDir, `${slug}-brd.md`);
  const brdDocxOut = path.join(outDir, `${slug}-brd.docx`);
  const outputs = String(args.outputs || "workbook,brd,docx")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const generated = [];

  await fs.mkdir(outDir, { recursive: true });
  if (outputs.includes("workbook")) {
    await populateWorkbook(templatePath, input, workbookOut);
    generated.push(workbookOut);
  }
  if (outputs.includes("brd")) {
    await fs.writeFile(brdOut, buildBrdMarkdown(input), "utf8");
    generated.push(brdOut);
  }

  if (outputs.includes("docx")) {
    const docxInputPath = inputPath || path.join(outDir, `${slug}-campaign-input.json`);
    if (!inputPath) {
      await fs.writeFile(docxInputPath, JSON.stringify(input, null, 2), "utf8");
    }
    const pythonBin = args.python || process.env.BUNDLED_PYTHON || "python";
    const docxScriptPath = path.join(scriptDir, "generate_brd_docx.py");

    await new Promise((resolve, reject) => {
      const child = spawn(
        pythonBin,
        [docxScriptPath, "--input", docxInputPath, "--output", brdDocxOut],
        { stdio: "inherit" },
      );
      child.on("exit", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`generate_brd_docx.py exited with code ${code}`));
      });
      child.on("error", reject);
    });
    generated.push(brdDocxOut);
  }

  process.stdout.write(`${generated.join("\n")}\n`);
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
