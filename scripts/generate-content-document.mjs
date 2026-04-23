import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentPath = path.join(root, "content.js");
const docsDir = path.join(root, "docs");

function outputPaths(lang) {
  const suffix = lang === "fr" ? "FR" : "EN";
  const base = `DOCUMENT_COMPLEMENTAIRE_CONTENU_${suffix}`;
  return {
    markdownPath: path.join(docsDir, `${base}.md`),
    wordHtmlPath: path.join(docsDir, `${base}.doc`),
    wordDocxPath: path.join(docsDir, `${base}.docx`)
  };
}

function loadArtefactContent() {
  const source = fs.readFileSync(contentPath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: "content.js" });
  return sandbox.window.ARTEFACT_CONTENT;
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
}

function stripHtml(value) {
  return decodeHtmlEntities(
    String(value || "")
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
  ).trim();
}

function splitParagraphs(value) {
  return stripHtml(value)
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSphereSvg(labels) {
  const rawTitle = labels.title || "";
  const ai = escapeHtml(labels.ai || "AI");
  const consultant = escapeHtml(labels.consultant || "CO = Consultant");
  const client = escapeHtml(labels.client || "CL = Client");
  const s1 = escapeHtml(labels.s1 || "S1");
  const s2 = escapeHtml(labels.s2 || "S2");
  const s3 = escapeHtml(labels.s3 || "S3");
  const isFrench = String(labels.ai || "").toUpperCase() === "IA";
  const titleLines = isFrench
    ? ["Les 3 sphères de la co-création", "consultant-client-IA"]
    : ["The 3 spheres of consultant-client-AI", "co-creation"];
  const fallbackTitle = rawTitle || titleLines.join(" ");
  const titleSvg = titleLines
    .map((line, index) => `<tspan x="800" dy="${index === 0 ? 0 : 48}">${escapeHtml(line)}</tspan>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${escapeHtml(fallbackTitle)}">
  <defs>
    <radialGradient id="aiBall" cx="30%" cy="30%"><stop offset="0%" stop-color="#b784ff"/><stop offset="100%" stop-color="#8a5cf6"/></radialGradient>
    <radialGradient id="coBall" cx="30%" cy="30%"><stop offset="0%" stop-color="#ff77bb"/><stop offset="100%" stop-color="#e53e96"/></radialGradient>
    <radialGradient id="clBall" cx="30%" cy="30%"><stop offset="0%" stop-color="#5fd8ff"/><stop offset="100%" stop-color="#18add0"/></radialGradient>
    <style>
      text { font-family: "IBM Plex Sans", Aptos, Calibri, Arial, sans-serif; }
      .title { font-size: 42px; font-weight: 700; fill: #251d13; }
      .node { font-size: 34px; font-weight: 700; fill: #fff; }
      .small-node { font-size: 29px; font-weight: 700; fill: #fff; }
      .sphere-label { font-size: 28px; font-weight: 800; }
      .legend { font-size: 28px; fill: #61584a; }
      .button { font-size: 23px; font-weight: 800; }
    </style>
  </defs>
  <rect x="38" y="38" width="1524" height="824" rx="46" fill="#fffdf9"/>
  <text class="title" x="800" y="84" text-anchor="middle">${titleSvg}</text>

  <ellipse cx="800" cy="360" rx="620" ry="240" fill="none" stroke="#16bb84" stroke-width="5"/>
  <ellipse cx="800" cy="360" rx="405" ry="150" fill="none" stroke="#8a5cf6" stroke-width="5"/>
  <ellipse cx="800" cy="360" rx="250" ry="82" fill="none" stroke="#f09400" stroke-width="5"/>

  <line x1="800" y1="178" x2="535" y2="330" stroke="#575757" stroke-width="4"/>
  <line x1="800" y1="178" x2="1065" y2="330" stroke="#575757" stroke-width="4"/>
  <line x1="800" y1="178" x2="725" y2="360" stroke="#575757" stroke-width="4"/>
  <line x1="800" y1="178" x2="875" y2="360" stroke="#575757" stroke-width="4"/>
  <line x1="545" y1="343" x2="720" y2="360" stroke="#575757" stroke-width="4"/>
  <line x1="1055" y1="343" x2="880" y2="360" stroke="#575757" stroke-width="4"/>
  <line x1="770" y1="360" x2="830" y2="360" stroke="#575757" stroke-width="5"/>

  <circle cx="800" cy="178" r="50" fill="url(#aiBall)"/>
  <circle cx="530" cy="335" r="39" fill="url(#aiBall)"/>
  <circle cx="1070" cy="335" r="39" fill="url(#aiBall)"/>
  <circle cx="720" cy="360" r="60" fill="url(#coBall)"/>
  <circle cx="880" cy="360" r="60" fill="url(#clBall)"/>

  <text class="node" x="800" y="191" text-anchor="middle">${ai}</text>
  <text class="small-node" x="530" y="346" text-anchor="middle">${ai}</text>
  <text class="small-node" x="1070" y="346" text-anchor="middle">${ai}</text>
  <text class="node" x="720" y="373" text-anchor="middle">CO</text>
  <text class="node" x="880" y="373" text-anchor="middle">CL</text>

  <rect x="680" y="500" width="240" height="76" rx="38" fill="#fffdf9" stroke="#e18a00" stroke-width="2"/>
  <text class="sphere-label" x="800" y="548" text-anchor="middle" fill="#e18a00">S1</text>
  <rect x="680" y="588" width="240" height="76" rx="38" fill="#fffdf9" stroke="#8a5cf6" stroke-width="2"/>
  <text class="sphere-label" x="800" y="636" text-anchor="middle" fill="#8a5cf6">S2</text>
  <rect x="680" y="676" width="240" height="76" rx="38" fill="#fffdf9" stroke="#14b87d" stroke-width="2"/>
  <text class="sphere-label" x="800" y="724" text-anchor="middle" fill="#14b87d">S3</text>

  <circle cx="390" cy="790" r="15" fill="#e53e96"/>
  <text class="legend" x="422" y="800">${consultant}</text>
  <circle cx="730" cy="790" r="15" fill="#18add0"/>
  <text class="legend" x="762" y="800">${client}</text>
  <circle cx="1040" cy="790" r="15" fill="#8a5cf6"/>
  <text class="legend" x="1072" y="800">${ai}</text>

  <rect x="220" y="830" width="300" height="46" rx="23" fill="#fffdf9" stroke="#f6a21b" stroke-width="2"/>
  <text class="button" x="370" y="860" text-anchor="middle" fill="#e18a00">${s1}</text>
  <rect x="590" y="830" width="340" height="46" rx="23" fill="#fffdf9" stroke="#8a5cf6" stroke-width="2"/>
  <text class="button" x="760" y="860" text-anchor="middle" fill="#8a5cf6">${s2}</text>
  <rect x="1000" y="830" width="420" height="46" rx="23" fill="#fffdf9" stroke="#14b87d" stroke-width="2"/>
  <text class="button" x="1210" y="860" text-anchor="middle" fill="#14b87d">${s3}</text>
</svg>
`;
}

function ensureFigureAssets(artefact) {
  const assetsDir = path.join(docsDir, "assets");
  fs.mkdirSync(assetsDir, { recursive: true });

  return ["fr", "en"].reduce((acc, lang) => {
    const labels = artefact.locales[lang]?.spheres?.diagramLabels || {};
    const svgFilename = `spheres-${lang}.svg`;
    const pngFilename = `spheres-${lang}.png`;
    const svgPath = path.join(assetsDir, svgFilename);
    const pngPath = path.join(assetsDir, pngFilename);

    fs.writeFileSync(svgPath, renderSphereSvg(labels), "utf8");
    convertSvgToPng(svgPath, pngPath, assetsDir);

    const imagePath = fs.existsSync(pngPath) ? pngPath : svgPath;
    const imageFilename = fs.existsSync(pngPath) ? pngFilename : svgFilename;

    acc[lang] = {
      relativePath: `assets/${imageFilename}`,
      fileUrl: pathToFileURL(imagePath).href
    };
    return acc;
  }, {});
}

function convertSvgToPng(svgPath, pngPath, assetsDir) {
  const thumbnailPath = `${svgPath}.png`;

  fs.rmSync(pngPath, { force: true });
  fs.rmSync(thumbnailPath, { force: true });

  const result = spawnSync("qlmanage", ["-t", "-s", "1600", "-o", assetsDir, svgPath], {
    cwd: docsDir,
    encoding: "utf8"
  });

  if (result.error || result.status !== 0 || !fs.existsSync(thumbnailPath)) {
    return false;
  }

  fs.renameSync(thumbnailPath, pngPath);
  return fs.existsSync(pngPath);
}

function markdownEscape(value) {
  return String(value || "").replace(/\n/g, "\n\n");
}

function makeDoc() {
  const blocks = [];

  function heading(level, text) {
    if (text) {
      blocks.push({ type: "heading", level, text: stripHtml(text) });
    }
  }

  function paragraph(text) {
    splitParagraphs(text).forEach((item) => {
      const bulletItems = item
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (bulletItems.length && bulletItems.every((line) => /^•\s+/.test(line))) {
        blocks.push({
          type: "list",
          items: bulletItems.map((line) => line.replace(/^•\s+/, "").trim())
        });
        return;
      }

      blocks.push({ type: "paragraph", text: item });
    });
  }

  function list(items) {
    const cleanItems = (items || [])
      .map((item) => stripHtml(item))
      .filter(Boolean);
    if (cleanItems.length) {
      blocks.push({ type: "list", items: cleanItems });
    }
  }

  function toc(groups) {
    blocks.push({ type: "toc", groups });
  }

  function figure(kind, title, data) {
    blocks.push({ type: "figure", kind, title: stripHtml(title), data });
  }

  function pageBreak() {
    blocks.push({ type: "pageBreak" });
  }

  function definition(label, text) {
    if (text) {
      blocks.push({ type: "definition", label: stripHtml(label), text: stripHtml(text) });
    }
  }

  function linkParagraph(text, label, url) {
    blocks.push({
      type: "linkParagraph",
      text: stripHtml(text),
      label: stripHtml(label),
      url: String(url || "")
    });
  }

  function meta(text) {
    if (text) {
      blocks.push({ type: "meta", text: stripHtml(text) });
    }
  }

  function spacer() {
    blocks.push({ type: "spacer" });
  }

  return { blocks, heading, paragraph, list, toc, definition, figure, pageBreak, linkParagraph, meta, spacer };
}

function addLocale(doc, lang, locale, options = {}) {
  const { heading, paragraph, list, definition, figure, spacer } = doc;
  const why = locale.whyResearch || {};
  const theory = locale.theory || {};
  const spheres = locale.spheres || {};
  const illustration = locale.illustration || {};
  const labels = lang === "fr"
    ? {
        rpcDimensions: "Les dimensions de la valeur perçue du conseil à l'ère de l'IA : R / P / C",
        positive: "Reconfiguration positive",
        negative: "Reconfiguration négative",
        contingencies: "Contingences",
        stages: "Phases de la mission",
        substeps: "Sous étapes",
        stage: "Étape",
        situation: "Situation",
        phasePropositions: "Propositions examinées",
        valueDimensions: "Dimensions de la valeur perçue"
      }
    : {
        rpcDimensions: "R / P / C dimensions",
        positive: "Positive reconfiguration",
        negative: "Negative reconfiguration",
        contingencies: "Contingencies",
        stages: "Mission phases",
        substeps: "Sub-steps",
        stage: "Stage",
        situation: "Situation",
        phasePropositions: "Propositions examined",
        valueDimensions: "Perceived value dimensions"
      };

  if (!options.omitVersionHeading) {
    heading(1, lang === "fr" ? "Version française" : "English Version");
  }

  heading(2, `1. ${why.kicker || "Why this research"}`);
  heading(3, (why.titleLines || []).join(" "));
  heading(3, why.questionLabel || "The question");
  paragraph(why.questionHtml || "");
  heading(3, why.whyLabel || "Why it matters");
  paragraph(why.whyHtml || "");
  heading(3, why.gapLabel || "The research gap");
  paragraph(why.gapHtml || "");

  doc.pageBreak();
  heading(2, `2. ${theory.kicker || "Theoretical framework"}`);
  heading(3, theory.title || "");
  paragraph(theory.introHtml || "");
  if (theory.researchGapParagraphs?.length) {
    heading(3, theory.researchGapLabel || theory.gapLabel || "Research gap");
    theory.researchGapParagraphs.forEach(paragraph);
  }
  if (theory.propositionDetails?.length) {
    heading(3, theory.propositionsLabel || "Research propositions");
    theory.propositionDetails.filter((item) => item.tone !== "managerial").forEach((item) => {
      heading(4, `${item.badge} — ${item.title}`);
      paragraph(item.text || "");
    });
  }
  heading(3, theory.modelLabel || "R -> P -> C model");
  if (theory.dimensionCards?.length) {
    heading(4, labels.rpcDimensions);
    theory.dimensionCards.forEach((card) => {
      definition(`${card.letter || ""} — ${card.label || ""}`, card.text);
    });
  }
  if (theory.sequenceHtml) {
    paragraph(theory.sequenceHtml);
  }
  if (theory.rpcDiagram) {
    heading(4, theory.rpcDiagram.title || "R -> P -> C model");
    figure("rpc", theory.rpcDiagram.title || "R -> P -> C model", {
      dimensions: theory.dimensionCards || [],
      diagram: theory.rpcDiagram
    });
    paragraph(theory.rpcDiagram.intro || "");
    (theory.rpcDiagram.links || []).forEach((link) => {
      heading(4, link.label || "");
      definition(link.positiveLabel || labels.positive, link.positive || "");
      definition(link.negativeLabel || labels.negative, link.negative || "");
      definition(link.contingencyLabel || labels.contingencies, link.contingency || "");
    });
    paragraph(theory.rpcDiagram.footer || "");
  }
  if (theory.observationalFramework) {
    heading(3, theory.observationalFramework.title || theory.observationalFramework.label || "Observational framework");
    paragraph(theory.observationalFramework.text || "");
    list((theory.observationalFramework.chips || []).map((chip) => chip.text));
  }
  const managerialDetail = (theory.propositionDetails || []).find((item) => item.tone === "managerial");
  if (managerialDetail) {
    heading(3, managerialDetail.badge || "");
    heading(4, managerialDetail.title || "");
    paragraph(managerialDetail.text || "");
  }
  if (theory.practitionerPrompt?.text) {
    heading(3, theory.practitionerPrompt.title || theory.practitionerPrompt.label || "Practitioner relevance");
    paragraph(theory.practitionerPrompt.text || "");
  }
  if (theory.findingsNote) {
    paragraph(theory.findingsNote);
  }

  doc.pageBreak();
  heading(2, `3. ${spheres.kicker || "Observation framework"}`);
  heading(3, spheres.title || "");
  paragraph(spheres.intro || "");
  figure("spheres", spheres.diagramLabels?.title || spheres.title || "S1/S2/S3", {
    labels: spheres.diagramLabels || {},
    cards: spheres.cards || [],
    image: options.figureAssets?.[lang]?.relativePath || "",
    imageFileUrl: options.figureAssets?.[lang]?.fileUrl || ""
  });
  (spheres.cards || []).forEach((card) => {
    heading(4, card.title || "");
    paragraph(card.text || "");
  });
  if (spheres.diagram) {
    heading(3, spheres.diagram.title || "Diagram labels");
    definition("Consultant", spheres.diagram.consultant || "");
    definition("Client", spheres.diagram.client || "");
    definition("AI", spheres.diagram.ai || "");
    definition("S1", spheres.diagram.s1 || "");
    definition("S2", spheres.diagram.s2 || "");
    definition("S3", spheres.diagram.s3 || "");
  }

  doc.pageBreak();
  heading(2, `4. ${illustration.kicker || "Illustration"}`);
  heading(3, illustration.title || "");
  paragraph(illustration.subtitle || "");
  paragraph(illustration.intro || "");
  paragraph(illustration.legend || "");

  if (illustration.stages?.length) {
    heading(3, labels.stages);
    figure("timeline", labels.stages, {
      stages: illustration.stages || [],
      phases: illustration.phases || []
    });
    illustration.stages.forEach((stage) => {
      definition(`${stage.index}. ${stage.title} — ${stage.span}`, stage.summary || "");
    });
  }

  if (illustration.phases?.length) {
    heading(3, labels.substeps);
    illustration.phases.forEach((phase) => {
      heading(4, `${phase.title} — ${phase.week}`);
      definition(labels.stage, phase.stage || "");
      definition(labels.situation, phase.badge || "");
      definition(labels.phasePropositions, (phase.propositions || []).join(", "));
      definition(labels.valueDimensions, (phase.dimensions || []).join(", "));
      paragraph(phase.body || "");
      paragraph(phase.observable || "");
    });
  }

  spacer();
}

function renderMarkdown(blocks) {
  return blocks.map((block) => {
    if (block.type === "heading") {
      return `${"#".repeat(block.level)} ${markdownEscape(block.text)}`;
    }
    if (block.type === "paragraph") {
      return markdownEscape(block.text);
    }
    if (block.type === "definition") {
      return `**${markdownEscape(block.label)}**\n\n${markdownEscape(block.text)}`;
    }
    if (block.type === "linkParagraph") {
      return `${markdownEscape(block.text)} [${markdownEscape(block.label)}](${block.url})`;
    }
    if (block.type === "meta") {
      return `_${markdownEscape(block.text)}_`;
    }
    if (block.type === "toc") {
      return block.groups.map((group) => {
        const rows = group.items.map((item) => `| ${markdownEscape(item.label)} | ${markdownEscape(item.page)} |`).join("\n");
        const sectionColumn = group.sectionColumn || "Partie";
        return `**${markdownEscape(group.label)}**\n\n| ${markdownEscape(sectionColumn)} | Page |\n| --- | ---: |\n${rows}`;
      }).join("\n\n");
    }
    if (block.type === "figure") {
      return renderMarkdownFigure(block);
    }
    if (block.type === "list") {
      return block.items.map((item) => `- ${markdownEscape(item)}`).join("\n");
    }
    if (block.type === "pageBreak") {
      return "<div style=\"page-break-after: always;\"></div>";
    }
    return "";
  }).join("\n\n").replace(/\n{4,}/g, "\n\n\n") + "\n";
}

function renderMarkdownFigure(block) {
  if (block.kind === "rpc") {
    const dimensions = block.data.dimensions || [];
    const line = dimensions.map((item) => `${item.letter} (${item.label})`).join("  →  ");
    const feedback = dimensions.length >= 2 ? `${dimensions[1].letter}  →  ${dimensions[0].letter} (feedback loop)` : "";
    return `**Figure — ${markdownEscape(block.title)}**\n\n\`\`\`text\n${line}\n${feedback}\n\`\`\``;
  }
  if (block.kind === "spheres") {
    if (block.data.image) {
      return `**Figure — ${markdownEscape(block.title)}**\n\n![${markdownEscape(block.title)}](${block.data.image})`;
    }
    const cards = block.data.cards || [];
    const rows = cards.map((card) => `| ${markdownEscape(card.title)} | ${markdownEscape(card.text)} |`).join("\n");
    return `**Figure — ${markdownEscape(block.title)}**\n\n| Configuration | Description |\n| --- | --- |\n${rows}`;
  }
  if (block.kind === "timeline") {
    const stages = block.data.stages || [];
    const phases = block.data.phases || [];
    const rows = phases.map((phase) => {
      const stage = stages.find((item) => item.id === phase.stage);
      return `| ${markdownEscape(stage ? `${stage.index}. ${stage.title}` : phase.stage)} | ${markdownEscape(`${phase.title} — ${phase.week}`)} | ${markdownEscape(phase.badge)} | ${markdownEscape((phase.propositions || []).join(", "))} | ${markdownEscape((phase.dimensions || []).join(", "))} |`;
    }).join("\n");
    return `**Figure — ${markdownEscape(block.title)}**\n\n| Phase | Sous-étape | S | P | R/P/C |\n| --- | --- | --- | --- | --- |\n${rows}`;
  }
  return `**Figure — ${markdownEscape(block.title)}**`;
}

function renderWordFigure(block) {
  const title = `<p class="figure-title">Figure — ${escapeHtml(block.title)}</p>`;
  if (block.kind === "rpc") {
    const dimensions = block.data.dimensions || [];
    const cells = dimensions.map((item, index) => (
      `<td class="figure-cell"><p class="figure-node">${escapeHtml(item.letter)} — ${escapeHtml(item.label)}</p><p>${escapeHtml(item.text)}</p></td>` +
      (index < dimensions.length - 1 ? `<td class="figure-arrow">→</td>` : "")
    )).join("");
    return `<div class="figure">${title}<table class="figure-table"><tbody><tr>${cells}</tr><tr><td class="figure-small" colspan="5">R ← P : feedback loop / boucle de rétroaction</td></tr></tbody></table></div>`;
  }

  if (block.kind === "spheres") {
    if (block.data.imageFileUrl || block.data.image) {
      const src = block.data.image || block.data.imageFileUrl;
      return `<div class="figure">${title}<p class="figure-image-wrap"><img class="figure-image figure-image--spheres" src="${escapeHtml(src)}" alt="${escapeHtml(block.title)}" width="520"></p></div>`;
    }
    const cards = block.data.cards || [];
    const cells = cards.map((card) => (
      `<td class="figure-cell"><p class="figure-node">${escapeHtml(card.title)}</p><p>${escapeHtml(card.text)}</p></td>`
    )).join("");
    return `<div class="figure">${title}<table class="figure-table"><tbody><tr>${cells}</tr></tbody></table></div>`;
  }

  if (block.kind === "timeline") {
    const stages = block.data.stages || [];
    const phases = block.data.phases || [];
    const rows = phases.map((phase) => {
      const stage = stages.find((item) => item.id === phase.stage);
      const stageLabel = stage ? `${stage.index}. ${stage.title}` : phase.stage;
      return `<tr>
        <td class="figure-cell"><p>${escapeHtml(stageLabel)}</p></td>
        <td class="figure-cell"><p><strong>${escapeHtml(phase.title)} — ${escapeHtml(phase.week)}</strong></p></td>
        <td class="figure-cell"><p>${escapeHtml(phase.badge)}</p></td>
        <td class="figure-cell"><p>${escapeHtml((phase.propositions || []).join(", "))}</p></td>
        <td class="figure-cell"><p>${escapeHtml((phase.dimensions || []).join(", "))}</p></td>
      </tr>`;
    }).join("");
    return `<div class="figure">${title}<table class="figure-table"><tbody>
      <tr>
        <td class="figure-cell"><p><strong>Phase</strong></p></td>
        <td class="figure-cell"><p><strong>Sub-step / Sous-étape</strong></p></td>
        <td class="figure-cell"><p><strong>S</strong></p></td>
        <td class="figure-cell"><p><strong>P</strong></p></td>
        <td class="figure-cell"><p><strong>R/P/C</strong></p></td>
      </tr>
      ${rows}
    </tbody></table></div>`;
  }

  return `<div class="figure">${title}</div>`;
}

function renderWordHtml(blocks) {
  const body = blocks.map((block) => {
    if (block.type === "heading") {
      const sectionClass = block.level === 2 && /^\d+\.\s/.test(block.text)
        ? " doc-heading--section"
        : "";
      return `<h${block.level} class="doc-heading doc-heading--${block.level}${sectionClass}">${escapeHtml(block.text)}</h${block.level}>`;
    }
    if (block.type === "paragraph") {
      return `<p class="doc-paragraph">${escapeHtml(block.text).replace(/\n/g, "<br>")}</p>`;
    }
    if (block.type === "definition") {
      return `<div class="definition"><p class="block-label"><strong>${escapeHtml(block.label)}</strong></p><p class="definition-text">${escapeHtml(block.text).replace(/\n/g, "<br>")}</p></div>`;
    }
    if (block.type === "linkParagraph") {
      return `<p class="doc-paragraph">${escapeHtml(block.text)} <a href="${escapeHtml(block.url)}">${escapeHtml(block.label)}</a></p>`;
    }
    if (block.type === "meta") {
      return `<p class="doc-meta">${escapeHtml(block.text)}</p>`;
    }
    if (block.type === "toc") {
      return block.groups.map((group) => (
        `<p class="toc-group">${escapeHtml(group.label)}</p>` +
        `<table class="toc-table"><tbody>` +
        group.items.map((item) => (
          `<tr><td class="toc-label">${escapeHtml(item.label)}</td><td class="toc-page">${escapeHtml(item.page)}</td></tr>`
        )).join("") +
        `</tbody></table>`
      )).join("\n");
    }
    if (block.type === "figure") {
      return renderWordFigure(block);
    }
    if (block.type === "list") {
      return `<ul class="doc-list">${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
    }
    if (block.type === "pageBreak") {
      return `<div class="page-break" style="page-break-before: always;"></div>`;
    }
    return "<hr>";
  }).join("\n");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>La co-création de valeur perçue dans le conseil à l'ère de l'IA — un cadre exploratoire</title>
  <style>
    @page WordSection1 {
      margin: 2cm 2cm 2.25cm 2cm;
      mso-footer: footer1;
    }
    @page {
      @bottom-center {
        content: "Page " counter(page);
      }
    }
    div.WordSection1 { page: WordSection1; }
    body { font-family: Aptos, Calibri, Arial, sans-serif; color: #1f1a16; line-height: 1.45; }
    h1, h2, h3, h4, .block-label, .toc-group, .toc-table, .footer { text-align: left; }
    h1 { font-size: 26pt; margin-top: 24pt; border-bottom: 2px solid #ddd; padding-bottom: 6pt; }
    h2 { font-size: 20pt; margin-top: 22pt; color: #2b2520; }
    .doc-heading--section { page-break-before: always; }
    h3 { font-size: 15pt; margin-top: 16pt; color: #3a332d; }
    h4 { font-size: 12.5pt; margin-top: 12pt; color: #4a4038; }
    p, li { font-size: 11pt; }
    .doc-meta { margin-top: -6pt; font-size: 9.5pt; color: #6d6258; text-align: left; }
    .doc-paragraph { margin: 0 0 11pt; text-align: justify; }
    .definition-text, li { text-align: justify; }
    .block-label { margin: 10pt 0 0; font-size: 11pt; letter-spacing: 0; }
    .definition p:last-child { margin-top: 0; }
    .toc-group { margin: 14pt 0 4pt; font-size: 12pt; font-weight: 600; }
    .toc-table { width: 100%; border-collapse: collapse; margin: 0 0 12pt 0; }
    .toc-table td { padding: 4pt 0; font-size: 11pt; }
    .toc-label { width: 86%; text-align: left; }
    .toc-page { width: 14%; text-align: right; white-space: nowrap; }
    .page-break { page-break-before: always; height: 0; margin: 0; }
    .figure { margin: 12pt 0 18pt; padding: 10pt; border: 1px solid #d8d1c7; border-radius: 12pt; background: #fbf7ef; }
    .figure-title { margin: 0 0 8pt; font-size: 10pt; font-weight: 700; color: #5a5047; text-align: left; letter-spacing: .04em; text-transform: uppercase; }
    .figure-image-wrap { margin: 0; text-align: center; }
    .figure-image { max-width: 100%; height: auto; border: 0; }
    .figure-image--spheres { width: 12.2cm; height: auto; }
    .figure-table { width: 100%; border-collapse: separate; border-spacing: 6pt; }
    .figure-cell { border: 1px solid #d8d1c7; border-radius: 10pt; padding: 8pt; vertical-align: top; background: #fffdf8; }
    .figure-cell p { margin: 0; text-align: justify; font-size: 9.5pt; }
    .figure-node { text-align: center; font-weight: 700; font-size: 13pt; }
    .figure-cell .figure-node { text-align: center; }
    .figure-arrow { text-align: center; font-weight: 700; font-size: 16pt; color: #7a7066; }
    .figure-small { font-size: 9pt; color: #675d54; text-align: left; }
    strong { color: #1f1a16; }
    a { color: #2357a8; text-decoration: underline; }
    hr { border: 0; border-top: 1px solid #ddd; margin: 24pt 0; }
    .doc-list { margin: 6pt 0 14pt 0; padding-left: 20pt; }
    .doc-list li { margin: 0 0 8pt 0; line-height: 1.5; }
    .footer { font-size: 9pt; color: #777; text-align: center; }
  </style>
</head>
<body>
<div class="WordSection1">
${body}
</div>
<div style="mso-element:footer" id="footer1">
  <p class="footer">Page <span style="mso-element:field-begin"></span><span style="mso-spacerun:yes"> </span>PAGE<span style="mso-element:field-separator"></span>1<span style="mso-element:field-end"></span></p>
</div>
</body>
</html>
`;
}

function injectPageBreakAfterToc(wordDocxPath) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "s1s2s3-docx-"));

  try {
    const unzipResult = spawnSync("unzip", ["-q", wordDocxPath, "-d", tempDir], {
      encoding: "utf8"
    });

    if (unzipResult.error || unzipResult.status !== 0) {
      return false;
    }

    const documentXmlPath = path.join(tempDir, "word", "document.xml");
    let xml = fs.readFileSync(documentXmlPath, "utf8");
    let changed = false;

    if (!xml.includes('w:br w:type="page"')) {
      const headingRegex = /<w:p\b(?:(?!<\/w:p>)[\s\S])*<w:pStyle[^>]*w:val="Heading2"[^>]*\/>(?:(?!<\/w:p>)[\s\S])*<w:t[^>]*>1\.(?:(?!<\/w:p>)[\s\S])*<\/w:p>/;
      const pageBreakXml = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

      if (!headingRegex.test(xml)) {
        return false;
      }

      xml = xml.replace(headingRegex, `${pageBreakXml}$&`);
      fs.writeFileSync(documentXmlPath, xml, "utf8");
      changed = true;
    }

    const stylesXmlPath = path.join(tempDir, "word", "styles.xml");
    if (fs.existsSync(stylesXmlPath)) {
      const stylesXml = fs.readFileSync(stylesXmlPath, "utf8");
      const justifiedStylesXml = stylesXml.replace(
        /(<w:style\b[^>]*w:styleId="BodyText"[^>]*>[\s\S]*?<w:pPr>)([\s\S]*?)(<\/w:pPr>)/,
        (match, start, body, end) => {
          if (body.includes("<w:jc")) {
            return `${start}${body.replace(/<w:jc\b[^>]*\/>/, '<w:jc w:val="both" />')}${end}`;
          }

          return `${start}${body}<w:jc w:val="both" />${end}`;
        }
      );

      if (justifiedStylesXml !== stylesXml) {
        fs.writeFileSync(stylesXmlPath, justifiedStylesXml, "utf8");
        changed = true;
      }
    }

    if (changed) {
      fs.rmSync(wordDocxPath, { force: true });
      const zipResult = spawnSync("zip", ["-qr", wordDocxPath, "."], {
        cwd: tempDir,
        encoding: "utf8"
      });

      if (zipResult.error || zipResult.status !== 0) {
        return false;
      }
    }

    return true;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function convertWordHtmlToDocx(wordHtmlPath, wordDocxPath) {
  fs.rmSync(wordDocxPath, { force: true });

  const pandocResult = spawnSync("pandoc", ["-f", "html", wordHtmlPath, "-o", wordDocxPath, "--resource-path", docsDir], {
    cwd: root,
    encoding: "utf8"
  });

  if (!pandocResult.error && pandocResult.status === 0 && fs.existsSync(wordDocxPath)) {
    injectPageBreakAfterToc(wordDocxPath);
    return true;
  }

  const textutilResult = spawnSync("textutil", ["-convert", "docx", "-output", wordDocxPath, wordHtmlPath], {
    cwd: docsDir,
    encoding: "utf8"
  });

  if (textutilResult.error || textutilResult.status !== 0) {
    return false;
  }

  if (!fs.existsSync(wordDocxPath)) {
    return false;
  }

  injectPageBreakAfterToc(wordDocxPath);
  return true;
}

function buildToc(lang) {
  return lang === "fr"
    ? [{
        label: "Version française",
        sectionColumn: "Partie",
        items: [
          { label: "1. Positionnement de la recherche", page: "p. 2" },
          { label: "2. Cadre théorique", page: "p. 3" },
          { label: "3. Cadre d'observation", page: "p. 8" },
          { label: "4. Illustration", page: "p. 10" }
        ]
      }]
    : [{
        label: "English version",
        sectionColumn: "Section",
        items: [
          { label: "1. Research positioning", page: "p. 2" },
          { label: "2. Theoretical framework", page: "p. 3" },
          { label: "3. Observation framework", page: "p. 8" },
          { label: "4. Illustration", page: "p. 10" }
        ]
      }];
}

function buildLocaleDocument(artefact, lang, figureAssets) {
  const locale = artefact.locales[lang];
  const doc = makeDoc();
  const isFrench = lang === "fr";

  doc.heading(1, isFrench
    ? "La co-création de valeur perçue dans le conseil à l'ère de l'IA — un cadre exploratoire"
    : "Perceived value co-creation in AI-era consulting — an exploratory framework");
  doc.meta(isFrench
    ? "Yunes, Clément - Université de Bordeaux"
    : "Yunes, Clément - University of Bordeaux");
  doc.linkParagraph(isFrench
    ? "Ce texte est disponible également en ligne :"
    : "This text is also available online:",
    "https://s1s2s3.vercel.app",
    "https://s1s2s3.vercel.app");

  doc.heading(2, isFrench ? "Table des matières" : "Table of contents");
  doc.toc(buildToc(lang));
  doc.pageBreak();

  addLocale(doc, lang, locale, { omitVersionHeading: true, figureAssets });
  return doc;
}

function generateContentDocuments() {
  fs.mkdirSync(docsDir, { recursive: true });

  const artefact = loadArtefactContent();
  const figureAssets = ensureFigureAssets(artefact);

  ["fr", "en"].forEach((lang) => {
    const paths = outputPaths(lang);
    const doc = buildLocaleDocument(artefact, lang, figureAssets);
    fs.writeFileSync(paths.markdownPath, renderMarkdown(doc.blocks), "utf8");
    fs.writeFileSync(paths.wordHtmlPath, renderWordHtml(doc.blocks), "utf8");
    const docxCreated = convertWordHtmlToDocx(paths.wordHtmlPath, paths.wordDocxPath);

    console.log(`Generated ${path.relative(root, paths.markdownPath)}`);
    console.log(`Generated ${path.relative(root, paths.wordHtmlPath)}`);
    if (docxCreated) {
      console.log(`Generated ${path.relative(root, paths.wordDocxPath)}`);
    } else {
      console.log(`Skipped ${path.relative(root, paths.wordDocxPath)} because textutil was unavailable or failed.`);
    }
  });
}

export {
  buildLocaleDocument,
  generateContentDocuments,
  loadArtefactContent,
  outputPaths,
  renderMarkdown,
  renderSphereSvg,
  renderWordHtml
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateContentDocuments();
}
