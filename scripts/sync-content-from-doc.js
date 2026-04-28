var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.join(__dirname, "..");
var sourcePath = process.argv[2] || "/tmp/cadre_exploratoire_latest.md";
var markdown = fs.readFileSync(sourcePath, "utf8");
var contentPath = path.join(root, "content.js");
var sandbox = { window: {} };

vm.runInNewContext(fs.readFileSync(contentPath, "utf8"), sandbox);

var content = sandbox.window.ARTEFACT_CONTENT;
var fr = content.locales.fr;

function stripInline(value) {
  return String(value || "")
    .replace(/\[(.*?)\]\{\.underline\}/g, "$1")
    .replace(/\[(.*?)\]\{\.mark\}/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)\{[^}]+\}/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[\^(\d+)\]/g, "")
    .replace(/\\\[/g, "[")
    .replace(/\\\]/g, "]")
    .replace(/\\\|/g, "|")
    .replace(/\\_/g, "_")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\{[^}]+\}/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function normalizeBlock(value) {
  var lines = String(value || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(function (line) {
      return stripInline(line);
    })
    .filter(function (line) {
      return !/^Figure \d+/.test(line) && !/^\+[-=+]+/.test(line) && !/^\{?width=/.test(line) && !/^height=/.test(line) && line !== "l’ère de l’IA" && line !== "interdépendances dynamiques entre les 3 dimensions";
    });
  var paragraphs = [];
  var current = [];

  lines.forEach(function (line) {
    if (/^#{1,6} /.test(line)) {
      return;
    }

    if (/^\s*$/.test(line)) {
      if (current.length) {
        paragraphs.push(current.join(" "));
        current = [];
      }
      return;
    }

    if (/^- /.test(line) || /^\d+\. /.test(line)) {
      if (current.length) {
        paragraphs.push(current.join(" "));
        current = [];
      }
      paragraphs.push(line);
      return;
    }

    current.push(line);
  });

  if (current.length) {
    paragraphs.push(current.join(" "));
  }

  return paragraphs
    .map(function (paragraph) {
      return paragraph.replace(/\s+/g, " ").trim();
    })
    .filter(Boolean)
    .join("\n\n");
}

function textBetween(start, end) {
  var startIndex = markdown.indexOf(start);
  var endIndex;

  if (startIndex === -1) {
    throw new Error("Missing start marker: " + start);
  }

  startIndex += start.length;
  endIndex = end ? markdown.indexOf(end, startIndex) : markdown.length;

  if (end && endIndex === -1) {
    throw new Error("Missing end marker: " + end);
  }

  return normalizeBlock(markdown.slice(startIndex, endIndex));
}

function oneLine(value) {
  return normalizeBlock(value).replace(/\n+/g, " ").trim();
}

function htmlParagraphs(value) {
  return normalizeBlock(value)
    .split(/\n{2,}/)
    .map(function (paragraph) {
      return paragraph.replace(/^Note :/, "<strong>Note :</strong>");
    })
    .join("<br><br>");
}

function bibliographyEntries() {
  var entries = normalizeBlock(markdown.slice(markdown.indexOf("# BIBLIOGRAPHIE") + "# BIBLIOGRAPHIE".length, markdown.indexOf("[^1]:")))
    .split(/\n{2,}/)
    .map(function (entry) {
      return entry.replace(/\s+/g, " ").trim();
    })
    .filter(Boolean);
  var merged = [];

  entries.forEach(function (entry) {
    if (/^\d/.test(entry) && merged.length) {
      merged[merged.length - 1] += " " + entry;
    } else {
      merged.push(entry);
    }
  });

  return merged;
}

function fullCleanMarkdown() {
  var body = markdown
    .replace(/\r\n/g, "\n")
    .replace(/!\[[^\]]*\]\([^)]+\)\{[^}]+\}/g, "")
    .replace(/\[(.*?)\]\{\.underline\}/g, "$1")
    .replace(/\[(.*?)\]\{\.mark\}/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/\\\[/g, "[")
    .replace(/\\\]/g, "]")
    .replace(/\\\|/g, "|")
    .replace(/\\_/g, "_")
    .replace(/\u00a0/g, " ");

  return body.trim() + "\n";
}

function primaryMarkdown() {
  var body = fullCleanMarkdown();
  var markers = [
    ["# 1. POSITIONNEMENT DE LA RECHERCHE", "[p. 3]"],
    ["## En quoi est-ce un questionnement nécessaire", "[p. 4]"],
    ["## Implications de la recherche", "[p. 5]"],
    ["# 2. CADRE THEORIQUE", "[p. 6]"],
    ["## La valeur perçue du conseil est avant tout un accomplissement social", "[p. 7]"],
    ["## L’IA, élément perturbateur de l’accomplissement social", "[p. 8]"],
    ["# 3. CADRE PROPOSITIONNEL", "[p. 9]"],
    ["### **R — Relationnelle**", "[p. 10]"],
    ["### Comment l'IA reconfigure les trois interdépendances", "[p. 11]"],
    ["## P2 — La transparence comme mécanisme médiateur", "[p. 12]"],
    ["# 4. CADRE D'OBSERVATION", "[p. 14]"],
    ["## Situations et observables", "[p. 15]"],
    ["# 5. POSTURE DU CHERCHEUR ET DESIGN DE LA RECHERCHE", "[p. 16]"],
    ["# 6. ILLUSTRATION", "[p. 17]"],
    ["### **2. Analyse – Sem. 4-9**", "[p. 18]"],
    ["### **3. Recommandations — Sem. 10**", "[p. 19]"],
    ["# BIBLIOGRAPHIE", "[p. 21]"]
  ];

  markers.forEach(function (item) {
    var marker = item[0];
    var page = item[1];
    var index = body.indexOf(marker);

    if (index !== -1) {
      body = body.slice(0, index) + page + "\n\n" + body.slice(index);
    }
  });

  return body;
}

fr.hero.title = "Vers une reconfiguration de la valeur perçue du conseil à l’ère de l’IA : repenser la co-création de connaissances managériales.";
fr.hero.subtitle = "Cadre exploratoire";
fr.hero.signature = "Yunes, Clément - Université de Bordeaux – Avril 2026";

fr.nav = [
  { id: "why", label: "1. POSITIONNEMENT DE LA RECHERCHE" },
  { id: "theory", label: "2. CADRE THEORIQUE" },
  { id: "propositions", label: "3. CADRE PROPOSITIONNEL" },
  { id: "spheres", label: "4. CADRE D'OBSERVATION" },
  { id: "posture", label: "5. POSTURE DU CHERCHEUR" },
  { id: "illustration", label: "6. ILLUSTRATION" },
  { id: "bibliography", label: "BIBLIOGRAPHIE" }
];

fr.whyResearch.questionHtml = htmlParagraphs(textBetween("## La valeur perçue du conseil au prisme de l’IA", "## Gap théorique"));
fr.whyResearch.whyHtml = htmlParagraphs(
  textBetween("## Gap théorique", "## Implications de la recherche")
);
fr.whyResearch.gapHtml = htmlParagraphs(textBetween("## Implications de la recherche", "# 2. CADRE THEORIQUE"));

fr.theory.overviewBlocks = [
  {
    label: "La valeur perçue du conseil à l’ère de l’IA, des mécanismes qui restent à explorer",
    text: textBetween("## La valeur perçue du conseil à l’ère de l’IA, des mécanismes qui restent à explorer", "## La valeur perçue du conseil est avant tout un accomplissement social")
  },
  {
    label: "La valeur perçue du conseil est avant tout un accomplissement social",
    text: textBetween("## La valeur perçue du conseil est avant tout un accomplissement social", "## L’IA, élément perturbateur de l’accomplissement social")
  },
  {
    label: "L’IA, élément perturbateur de l’accomplissement social",
    text: textBetween("## L’IA, élément perturbateur de l’accomplissement social", "# 3. CADRE PROPOSITIONNEL")
  }
];

fr.propositions.introHtml = htmlParagraphs(textBetween("# 3. CADRE PROPOSITIONNEL", "## P1 — Reconfiguration multidimensionnelle de la valeur perçue"));
fr.propositions.modelLabel = "LE TRIANGLE R - P - C";
fr.propositions.sequenceHtml = '<strong>TRIANGLE</strong> <span class="sequence-pill sequence-pill--relational">R</span><span class="sequence-arrow">↔</span><span class="sequence-pill sequence-pill--processual">P</span><span class="sequence-arrow">↔</span><span class="sequence-pill sequence-pill--cognitive">C</span> <em>avec lien exploratoire C → R</em>';
fr.propositions.dimensionCards = [
  {
    tone: "relational",
    label: "Relationnelle",
    letter: "R",
    text: "Confiance et légitimité — activement produits, et de plus en plus ambigus dans les systèmes humain-IA"
  },
  {
    tone: "processual",
    label: "Processuelle",
    letter: "P",
    text: "L'expérience même de co-création — sa nature, sa lisibilité et la distribution des rôles, reconfigurées par l'IA comme troisième acteur de la relation consultant-client-IA [Quid de l’enchevêtrement ?]"
  },
  {
    tone: "cognitive",
    label: "Cognitive",
    letter: "C",
    text: "C₁ — appropriation cognitive : La capacité à interpréter, comprendre et évaluer ce qui a été co-produit par le conseil, afin que les productions de la mission deviennent intelligibles, évaluables, appropriables et mobilisables comme connaissance managériale.\n\nC₂ — création de connaissances managériales : explicites (know-what) et surtout tacites (know-how), au sens de Ciampi (2017) et Harfouche et al. (2023)."
  }
];
fr.propositions.rpcDiagram.title = "Comment l'IA reconfigure les trois interdépendances du triangle R - P – C (à vérifier)";
fr.propositions.rpcDiagram.intro = textBetween("## Dimensions de la valeur perçue du conseil à l’ère de l’IA : le triangle R – P – C (à vérifier)", "### **R — Relationnelle**");
fr.propositions.rpcDiagram.links = [
  {
    label: "R ↔ P",
    positive: "Une orchestration visible et une construction crédible de la légitimité approfondissent l'engagement processuel ; réciproquement, une co-création fluide renforce la légitimité du consultant.",
    negative: "Un usage masqué de l'IA peut fragiliser la légitimité et délégitimer rétrospectivement le processus ; à l'inverse, une expérience de co-création où l'IA produit des outputs spectaculaires peut déplacer le crédit du consultant vers l'IA.",
    contingency: "Protégé par P2, modulé par la lisibilité, la littératie IA et l'aversion à l'algorithme (P3)."
  },
  {
    label: "P ↔ C",
    positive: "Une co-création visible avec l'IA enrichit la diversité et la nouveauté des insights (C₁ appropriation, C₂ création) lorsque le client est cognitivement engagé. Réciproquement, l'appropriation et la création de connaissances nourrissent l'engagement dans la suite de la mission.",
    negative: "L'IA peut découpler la connaissance de la co-production : le client reçoit des outputs sans participer à leur génération, ce qui inhibe l'appropriation (C₁) et empêche la création de connaissances tacites (C₂).",
    contingency: "Dépend de l'explicitation substantive du consultant (P2) et, via P3, de l'intelligibilité, de l'acceptation et des conditions situationnelles."
  },
  {
    label: "C → R",
    positive: "La création de connaissances managériales nouvelles (C₂) renforce rétroactivement la légitimité du consultant : « il m'a fait progresser ».",
    negative: "À l'inverse, l'absence de C₂ — perception que la mission n'a produit que de l'output sans transformation managériale — érode la légitimité a posteriori.",
    contingency: "Lien à explorer empiriquement, particulièrement révélateur en phase rétrospective (Post)."
  }
];
fr.propositions.propositionDetails = [
  {
    tone: "relational",
    badge: "P1",
    title: "P1 — Reconfiguration multidimensionnelle de la valeur perçue",
    text: textBetween("## P1 — Reconfiguration multidimensionnelle de la valeur perçue", "## Dimensions de la valeur perçue du conseil à l’ère de l’IA")
  },
  {
    tone: "processual",
    badge: "P2",
    title: "P2 — La transparence comme mécanisme médiateur",
    text: textBetween("## P2 — La transparence comme mécanisme médiateur", "## P3 — Les trois conditions de modération")
  },
  {
    tone: "cognitive",
    badge: "P3",
    title: "P3 — Les trois conditions de modération",
    text: textBetween("## P3 — Les trois conditions de modération", "# 4. CADRE D'OBSERVATION")
  }
];

fr.spheres.title = "Les 3 sphères de co-création de valeur perçue du conseil à l’ère de l’IA : S1, S2, S3";
fr.spheres.intro = textBetween("## Les 3 sphères de co-création de valeur perçue du conseil à l’ère de l’IA : S1, S2, S3", "## Situations et observables");
fr.spheres.cards = [
  {
    key: "s1",
    tone: "s1",
    title: "S1 — Sans IA",
    text: textBetween("### S1 — Sans IA", "### S2 — IA en silo")
  },
  {
    key: "s2",
    tone: "s2",
    title: "S2 — IA en silo",
    text: textBetween("### S2 — IA en silo", "### S3 — Co-création tripartite")
  },
  {
    key: "s3",
    tone: "s3",
    title: "S3 — Co-création tripartite",
    text: textBetween("### S3 — Co-création tripartite", "# 5. POSTURE DU CHERCHEUR ET DESIGN DE LA RECHERCHE")
  }
];
fr.spheres.diagramLabels.title = "Les 3 sphères de la co-création consultant-client-IA";
fr.spheres.diagramLabels.s1 = "S1 — Sans IA";
fr.spheres.diagramLabels.s2 = "S2 — IA en silo";
fr.spheres.diagramLabels.s3 = "S3 — Co-création tripartite";

fr.posture = {
  kicker: "5. POSTURE DU CHERCHEUR ET DESIGN DE LA RECHERCHE",
  title: "Posture du chercheur et design de la recherche",
  blocks: [
    {
      label: "Un design d'étude de cas exemplaire en grandeur réelle",
      text: textBetween("## Un design d'étude de cas exemplaire en grandeur réelle", "## Une posture de praticien-chercheur explicitement assumée")
    },
    {
      label: "Une posture de praticien-chercheur explicitement assumée",
      text: textBetween("## Une posture de praticien-chercheur explicitement assumée", "## Un dispositif de réflexivité renforcé pour répondre au risque de biais")
    },
    {
      label: "Un dispositif de réflexivité renforcé pour répondre au risque de biais",
      text: textBetween("## Un dispositif de réflexivité renforcé pour répondre au risque de biais", "# 6. ILLUSTRATION")
    }
  ]
};

fr.illustration.kicker = "6. ILLUSTRATION";
fr.illustration.intro = textBetween("## Scénario fictif d'une mission de conseil : audit de plateforme digitale sur 10 semaines", "## Phases du scenario de la mission fictive de conseil");
fr.illustration.legend = "Chaque phase est scindée en sous-phase, dans laquelle se déroule l’observation : situation de co-création observée (S), propositions de recherche les plus directement examinées (P), dimensions de la valeur perçue observée (R, P, C).";
fr.illustration.phases[5].body = "Thomas présente au comité exécutif sans IA visible. La construction narrative et l'autorité restent pleinement humains en surface. Pourtant, l'acceptation des recommandations dépend encore du caractère lisible et appropriable du travail assisté par IA si la chaîne analytique est questionnée ou dévoilée. Marie défend les recommandations.";
fr.illustration.phases[5].observable = "Observable principal : R (confiance et légitimité) + C (évaluation de la chaîne analytique) — P3 (littératie IA du COMEX (comité exécutif du client) et disposition à l'égard d'une analyse assistée par IA comme modérateur contextuel)";
fr.illustration.phases[6].title = "Évaluation rétrospective de la valeur perçue sur les trois dimensions.";
fr.illustration.phases[6].body = "Évaluation rétrospective de la valeur perçue sur les trois dimensions. Quelle configuration a généré la plus forte valeur perçue dans ses dimensions relationnelle, processuelle et cognitive — et sous quelles conditions ? Y-a-t-il eu création de connaissances managériales nouvelles ?";

fr.bibliography.entries = bibliographyEntries();

var bibliographyJson = JSON.stringify(fr.bibliography.entries, null, 2);
var output = "var PRIMARY_BIBLIOGRAPHY = " + bibliographyJson + ";\n\nwindow.ARTEFACT_CONTENT = " + JSON.stringify(content, null, 2) + ";\n";

fs.writeFileSync(contentPath, output);
fs.writeFileSync(path.join(root, "docs", "DOCUMENT_COMPLEMENTAIRE_CONTENU_FR.md"), fullCleanMarkdown());
fs.writeFileSync(
  path.join(root, "sources", "CADRE_EXPLORATOIRE_YUNES_CLEMENT_PRIMARY.md"),
  "# Cadre exploratoire - source primaire\n\nDocument source : Cadre_Exploratoire_YUNES Clément.docx\nVersion synchronisée avec l'application interactive.\n\n" + primaryMarkdown()
);
