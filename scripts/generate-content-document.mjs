import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentPath = path.join(root, "content.js");
const docsDir = path.join(root, "docs");
const markdownPath = path.join(docsDir, "DOCUMENT_COMPLEMENTAIRE_CONTENUS.md");
const wordHtmlPath = path.join(docsDir, "DOCUMENT_COMPLEMENTAIRE_CONTENUS.doc");
const wordDocxPath = path.join(docsDir, "DOCUMENT_COMPLEMENTAIRE_CONTENUS.docx");

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

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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

  function spacer() {
    blocks.push({ type: "spacer" });
  }

  return { blocks, heading, paragraph, list, toc, definition, linkParagraph, spacer };
}

function addLocale(doc, lang, locale) {
  const { heading, paragraph, list, definition, spacer } = doc;
  const why = locale.whyResearch || {};
  const theory = locale.theory || {};
  const spheres = locale.spheres || {};
  const illustration = locale.illustration || {};

  heading(1, lang === "fr" ? "Version française" : "English Version");

  heading(2, `1. ${why.kicker || "Why this research"}`);
  heading(3, (why.titleLines || []).join(" "));
  heading(3, why.questionLabel || "The question");
  paragraph(why.questionHtml || "");
  heading(3, why.whyLabel || "Why it matters");
  paragraph(why.whyHtml || "");
  heading(3, why.gapLabel || "The research gap");
  paragraph(why.gapHtml || "");

  heading(2, `2. ${theory.kicker || "Theoretical framework"}`);
  heading(3, theory.title || "");
  paragraph(theory.introHtml || "");
  if (theory.researchGapParagraphs?.length) {
    heading(3, theory.researchGapLabel || "Research gap");
    theory.researchGapParagraphs.forEach(paragraph);
  }
  if (theory.dimensionCards?.length) {
    heading(3, "R / P / C dimensions");
    theory.dimensionCards.forEach((card) => {
      definition(`${card.letter || ""} — ${card.label || ""}`, card.text);
    });
  }
  if (theory.propositionMiniCards?.length) {
    heading(3, "Propositions");
    theory.propositionMiniCards.forEach((item) => {
      definition(item.label || item.letter || "", item.text);
    });
  }
  if (theory.rpcDiagram) {
    heading(3, theory.rpcDiagram.title || "R -> P -> C model");
    paragraph(theory.rpcDiagram.intro || "");
    (theory.rpcDiagram.links || []).forEach((link) => {
      heading(4, link.label || "");
      definition(link.positiveLabel || "Positive", link.positive || "");
      definition(link.negativeLabel || "Negative", link.negative || "");
      definition(link.contingencyLabel || "Contingencies", link.contingency || "");
    });
    paragraph(theory.rpcDiagram.footer || "");
  }
  if (theory.propositionDetails?.length) {
    heading(3, "Detailed propositions");
    theory.propositionDetails.forEach((item) => {
      heading(4, `${item.badge} — ${item.title}`);
      paragraph(item.text || "");
    });
  }
  if (theory.observationalFramework) {
    heading(3, theory.observationalFramework.title || "Observational framework");
    paragraph(theory.observationalFramework.text || "");
    list((theory.observationalFramework.chips || []).map((chip) => chip.text));
  }
  if (theory.practitionerPrompt) {
    heading(3, theory.practitionerPrompt.title || "Practitioner relevance");
    paragraph(theory.practitionerPrompt.text || "");
  }

  heading(2, `3. ${spheres.kicker || "Observation framework"}`);
  heading(3, spheres.title || "");
  paragraph(spheres.intro || "");
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

  heading(2, `4. ${illustration.kicker || "Illustration"}`);
  heading(3, illustration.title || "");
  paragraph(illustration.subtitle || "");
  paragraph(illustration.intro || "");
  paragraph(illustration.legend || "");

  if (illustration.stages?.length) {
    heading(3, "Major stages");
    illustration.stages.forEach((stage) => {
      definition(`${stage.index}. ${stage.title} — ${stage.span}`, stage.summary || "");
    });
  }

  if (illustration.phases?.length) {
    heading(3, "Mission sub-steps");
    illustration.phases.forEach((phase) => {
      heading(4, `${phase.title} — ${phase.week}`);
      definition("Stage", phase.stage || "");
      definition("Situation", phase.badge || "");
      definition("Propositions", (phase.propositions || []).join(", "));
      definition("Value dimensions", (phase.dimensions || []).join(", "));
      paragraph(phase.body || "");
      paragraph(phase.observable || "");
    });
  }

  if (illustration.glossary) {
    heading(3, "Glossary");
    Object.entries(illustration.glossary.situations || {}).forEach(([key, value]) => {
      definition(key, value);
    });
    Object.entries(illustration.glossary.propositions || {}).forEach(([key, value]) => {
      definition(key, value);
    });
    Object.entries(illustration.glossary.dimensions || {}).forEach(([key, value]) => {
      definition(key, value);
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
    if (block.type === "toc") {
      return block.groups.map((group) => {
        const rows = group.items.map((item) => `| ${markdownEscape(item.label)} | ${markdownEscape(item.page)} |`).join("\n");
        return `**${markdownEscape(group.label)}**\n\n| Partie | Page |\n| --- | ---: |\n${rows}`;
      }).join("\n\n");
    }
    if (block.type === "list") {
      return block.items.map((item) => `- ${markdownEscape(item)}`).join("\n");
    }
    return "";
  }).join("\n\n").replace(/\n{4,}/g, "\n\n\n") + "\n";
}

function renderWordHtml(blocks) {
  const body = blocks.map((block) => {
    if (block.type === "heading") {
      return `<h${block.level} class="doc-heading doc-heading--${block.level}">${escapeHtml(block.text)}</h${block.level}>`;
    }
    if (block.type === "paragraph") {
      return `<p>${escapeHtml(block.text).replace(/\n/g, "<br>")}</p>`;
    }
    if (block.type === "definition") {
      return `<div class="definition"><p class="block-label"><strong>${escapeHtml(block.label)}</strong></p><p>${escapeHtml(block.text).replace(/\n/g, "<br>")}</p></div>`;
    }
    if (block.type === "linkParagraph") {
      return `<p>${escapeHtml(block.text)} <a href="${escapeHtml(block.url)}">${escapeHtml(block.label)}</a></p>`;
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
    if (block.type === "list") {
      return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
    }
    return "<hr>";
  }).join("\n");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Document complémentaire - contenus de l'artefact</title>
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
    h3 { font-size: 15pt; margin-top: 16pt; color: #3a332d; }
    h4 { font-size: 12.5pt; margin-top: 12pt; color: #4a4038; }
    p, li { font-size: 11pt; text-align: justify; }
    .block-label { margin: 10pt 0 0; font-size: 11pt; letter-spacing: 0; }
    .definition p:last-child { margin-top: 0; }
    .toc-group { margin: 14pt 0 4pt; font-size: 12pt; font-weight: 600; }
    .toc-table { width: 100%; border-collapse: collapse; margin: 0 0 12pt 0; }
    .toc-table td { padding: 4pt 0; font-size: 11pt; }
    .toc-label { width: 86%; text-align: left; }
    .toc-page { width: 14%; text-align: right; white-space: nowrap; }
    strong { color: #1f1a16; }
    a { color: #2357a8; text-decoration: underline; }
    hr { border: 0; border-top: 1px solid #ddd; margin: 24pt 0; }
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

function docxRun(text, options = {}) {
  const styles = [];
  if (options.bold) styles.push("<w:b/>");
  if (options.italic) styles.push("<w:i/>");
  if (options.size) styles.push(`<w:sz w:val="${options.size}"/>`);
  const rPr = styles.length ? `<w:rPr>${styles.join("")}</w:rPr>` : "";
  return String(text || "").split("\n").map((line, index) => {
    const breakTag = index > 0 ? "<w:br/>" : "";
    return `<w:r>${rPr}${breakTag}<w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r>`;
  }).join("");
}

function docxParagraph(text, options = {}) {
  const alignment = options.justify ? "both" : (options.align || "left");
  const spacing = `<w:spacing w:before="${options.before ?? 0}" w:after="${options.after ?? 120}" w:line="276" w:lineRule="auto"/>`;
  const pageBreak = options.pageBreakBefore ? "<w:pageBreakBefore/>" : "";
  return `<w:p><w:pPr>${pageBreak}<w:jc w:val="${alignment}"/>${spacing}</w:pPr>${docxRun(text, options)}</w:p>`;
}

function docxTableRows(items) {
  const rows = items.map((item) => `
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="8500" w:type="dxa"/></w:tcPr>${docxParagraph(item.label, { size: 22, after: 60 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1500" w:type="dxa"/></w:tcPr>${docxParagraph(item.page, { size: 22, align: "right", after: 60 })}</w:tc>
    </w:tr>
  `).join("");

  return `<w:tbl>
    <w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>
      <w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/>
    </w:tblBorders></w:tblPr>
    ${rows}
  </w:tbl>`;
}

function renderDocxBody(blocks) {
  const headingSizes = { 1: 52, 2: 40, 3: 30, 4: 25 };
  const headingBefore = { 1: 360, 2: 300, 3: 240, 4: 180 };
  const headingAfter = { 1: 180, 2: 140, 3: 120, 4: 100 };

  return blocks.map((block) => {
    if (block.type === "heading") {
      return docxParagraph(block.text, {
        bold: true,
        size: headingSizes[block.level] || 24,
        before: headingBefore[block.level] || 120,
        after: headingAfter[block.level] || 100
      });
    }
    if (block.type === "paragraph") {
      return docxParagraph(block.text, { justify: true, size: 22, after: 140 });
    }
    if (block.type === "definition") {
      return [
        docxParagraph(block.label, { bold: true, size: 22, after: 40 }),
        docxParagraph(block.text, { justify: true, size: 22, after: 120 })
      ].join("");
    }
    if (block.type === "linkParagraph") {
      return docxParagraph(`${block.text} ${block.label}`, { justify: true, size: 22, after: 140 });
    }
    if (block.type === "toc") {
      return block.groups.map((group) => [
        docxParagraph(group.label, { bold: true, size: 24, before: 160, after: 80 }),
        docxTableRows(group.items)
      ].join("")).join("");
    }
    if (block.type === "list") {
      return block.items.map((item) => docxParagraph(`• ${item}`, { justify: true, size: 22, after: 80 })).join("");
    }
    return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
  }).join("\n");
}

function createDocx(blocks) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "s1s2s3-docx-"));
  const relsDir = path.join(tempDir, "_rels");
  const wordDir = path.join(tempDir, "word");
  const wordRelsDir = path.join(wordDir, "_rels");
  const docPropsDir = path.join(tempDir, "docProps");

  fs.mkdirSync(relsDir, { recursive: true });
  fs.mkdirSync(wordRelsDir, { recursive: true });
  fs.mkdirSync(docPropsDir, { recursive: true });
  fs.rmSync(wordDocxPath, { force: true });

  fs.writeFileSync(path.join(tempDir, "[Content_Types].xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`, "utf8");

  fs.writeFileSync(path.join(relsDir, ".rels"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`, "utf8");

  fs.writeFileSync(path.join(wordRelsDir, "document.xml.rels"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`, "utf8");

  fs.writeFileSync(path.join(wordDir, "document.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${renderDocxBody(blocks)}
    <w:sectPr>
      <w:footerReference w:type="default" r:id="rId1"/>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1276" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`, "utf8");

  fs.writeFileSync(path.join(wordDir, "footer1.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr><w:jc w:val="center"/></w:pPr>
    <w:r><w:t>Page </w:t></w:r>
    <w:r><w:fldChar w:fldCharType="begin"/></w:r>
    <w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>
    <w:r><w:fldChar w:fldCharType="separate"/></w:r>
    <w:r><w:t>1</w:t></w:r>
    <w:r><w:fldChar w:fldCharType="end"/></w:r>
  </w:p>
</w:ftr>`, "utf8");

  fs.writeFileSync(path.join(docPropsDir, "core.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Contenus textuels de l'artefact</dc:title>
  <dc:creator>Codex</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
</cp:coreProperties>`, "utf8");

  fs.writeFileSync(path.join(docPropsDir, "app.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Codex</Application>
</Properties>`, "utf8");

  const result = spawnSync("zip", ["-qr", wordDocxPath, "."], {
    cwd: tempDir,
    encoding: "utf8"
  });

  if (result.error || result.status !== 0) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    return false;
  }

  fs.rmSync(tempDir, { recursive: true, force: true });
  return fs.existsSync(wordDocxPath);
}

fs.mkdirSync(docsDir, { recursive: true });

const artefact = loadArtefactContent();
const doc = makeDoc();

doc.heading(1, "Contenus textuels de l'artefact");
doc.paragraph("Ce document complémentaire rassemble les contenus textuels de l'artefact interactif, organisés selon les rubriques du site. Il est destiné à une lecture humaine hors interface, tout en restant aligné avec le contenu source de l'application.");
doc.paragraph("Il doit être mis à jour en même temps que la documentation du projet lorsque les contenus de l'artefact évoluent.");
doc.linkParagraph("Application en ligne :", "https://s1s2s3.vercel.app", "https://s1s2s3.vercel.app");

doc.heading(2, "Table des matières");
doc.toc([
  {
    label: "Version française",
    items: [
      { label: "1. Positionnement de la recherche", page: "p. 2" },
      { label: "2. Cadre théorique", page: "p. 3" },
      { label: "3. Cadre d'observation", page: "p. 8" },
      { label: "4. Illustration", page: "p. 10" }
    ]
  },
  {
    label: "English Version",
    items: [
      { label: "1. Research positioning", page: "p. 14" },
      { label: "2. Theoretical framework", page: "p. 15" },
      { label: "3. Observation framework", page: "p. 20" },
      { label: "4. Illustration", page: "p. 22" }
    ]
  }
]);

addLocale(doc, "fr", artefact.locales.fr);
addLocale(doc, "en", artefact.locales.en);

fs.writeFileSync(markdownPath, renderMarkdown(doc.blocks), "utf8");
const wordHtml = renderWordHtml(doc.blocks);
fs.writeFileSync(wordHtmlPath, wordHtml, "utf8");

const docxCreated = createDocx(doc.blocks);

console.log(`Generated ${path.relative(root, markdownPath)}`);
console.log(`Generated ${path.relative(root, wordHtmlPath)}`);
if (docxCreated) {
  console.log(`Generated ${path.relative(root, wordDocxPath)}`);
} else {
  console.log("Skipped .docx generation because textutil was unavailable or failed.");
}
