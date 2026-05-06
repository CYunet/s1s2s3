require "cgi"
require "fileutils"
require "json"

ROOT = File.expand_path("..", __dir__)
SOURCE_DOCX = ARGV[0]
TMP_TXT = "/private/tmp/cadre_exploratoire_v1.txt"
CONTENT_PATH = File.join(ROOT, "content.js")
SOURCE_MARKDOWN_PATH = File.join(ROOT, "sources", "CADRE_EXPLORATOIRE_YUNES_CLEMENT_PRIMARY.md")
FR_MARKDOWN_PATH = File.join(ROOT, "docs", "DOCUMENT_COMPLEMENTAIRE_CONTENU_FR.md")
FR_HTML_PATH = "/private/tmp/cadre_exploratoire_v1_fr.html"
FR_DOCX_PATH = File.join(ROOT, "docs", "DOCUMENT_COMPLEMENTAIRE_CONTENU_FR.docx")

abort("Usage: ruby scripts/load-exploratory-v1.rb /path/to/Cadre_Exploratoire_YUNES_V1.0.docx") unless SOURCE_DOCX

def run(*args)
  system(*args) || abort("Command failed: #{args.join(" ")}")
end

def normalize_spaces(value)
  value.to_s.gsub("\u00a0", " ").gsub(/[ \t]+/, " ").strip
end

def strip_inline(value)
  normalize_spaces(value).gsub(/^[-•]\s+/, "- ").gsub(/\s+([,.;:!?])/, "\\1")
end

def bibliography_entry?(line)
  line.match?(/^[A-ZÀ-Ý][^,]{1,80},\s/) || line.match?(/^de\s/i)
end

def heading_level(line)
  return 1 if line == "Cadre exploratoire et conception du design de recherche"
  return 1 if line == "Plan prévisionnel détaillé de la thèse" || line == "Sommaire du cadre exploratoire"
  return 2 if line.match?(/^Note préliminaire/)
  return 1 if line.match?(/^(1|2|3|4|5|6)\. [A-ZÉÈÊËÀÂÎÏÔÛÙÇ' -]+$/) || line == "BIBLIOGRAPHIE"
  return 2 if line.match?(/^(Problématisation|Intérêt de la recherche|De l'accomplissement social|P1 —|P2 —|P3 —|Comment l'IA|Les 3 sphères|Situations et observables|Une démarche|Un design|Une posture|Un dispositif|Scénario fictif|Phases du scenario)/)
  return 3 if line.match?(/^(R|P|C) — /) || line.match?(/^S[1-3] — /) || line.match?(/^[1-4]\. /) || line.match?(/— Sem\.|— Post|Exploration|Préparation|Analyse collaborative|Affinement|Validation mutuelle|Présentation au COMEX/)
  0
end

def to_markdown(text, full_document: false)
  lines = text.gsub("\r\n", "\n").split("\n")
  start = if full_document
    0
  else
    lines.index { |line| normalize_spaces(line) == "1. POSITIONNEMENT DE LA RECHERCHE" }
  end
  abort("Could not find exploratory-framework start marker.") unless start

  out = []
  pending_bullets = false

  lines[start..].each do |raw_line|
    line = strip_inline(raw_line)

    if line.empty? || line.match?(/^Figure \d+/)
      out << "" unless out.empty? || out.last == ""
      pending_bullets = false
      next
    end

    next if line == "\f"

    level = heading_level(line)
    if level.positive? && !bibliography_entry?(line)
      out << "" unless out.empty? || out.last == ""
      out << ("#" * level) + " " + line
      out << ""
      pending_bullets = false
      next
    end

    if line.match?(/^[-•] /)
      out << "- " + line.sub(/^[-•]\s+/, "")
      pending_bullets = true
      next
    end

    if pending_bullets
      out << ""
      pending_bullets = false
    end

    out << line
    out << ""
  end

  out.join("\n").gsub(/\n{3,}/, "\n\n").strip + "\n"
end

def clean_block(value)
  value.to_s.gsub(/^\#{1,6} .*$/, "").split("\n").map { |line| strip_inline(line) }.reject(&:empty?).join("\n\n")
end

def section(markdown, start_marker, end_marker = nil)
  start_index = markdown.index(start_marker)
  abort("Missing start marker: #{start_marker}") unless start_index
  start_index += start_marker.length
  end_index = end_marker ? markdown.index(end_marker, start_index) : markdown.length
  abort("Missing end marker: #{end_marker}") if end_marker && !end_index
  clean_block(markdown[start_index...end_index])
end

def html_paragraphs(value)
  clean_block(value).split(/\n{2,}/).map { |paragraph| CGI.escapeHTML(paragraph) }.join("<br><br>")
end

def bibliography_entries(markdown)
  section(markdown, "# BIBLIOGRAPHIE").split(/\n{2,}/).map { |entry| strip_inline(entry) }.reject(&:empty?)
end

def page_marked(markdown)
  markers = {
    "## Note préliminaire:" => "[p. 3]",
    "# Plan prévisionnel détaillé de la thèse" => "[p. 4]",
    "# Sommaire du cadre exploratoire" => "[p. 14]",
    "# 1. POSITIONNEMENT DE LA RECHERCHE" => "[p. 16]",
    "# 2. CADRE THEORIQUE MOBILISÉ" => "[p. 21]",
    "# 3. CADRE PROPOSITIONNEL" => "[p. 27]",
    "## P1 — Reconfiguration multidimensionnelle de la valeur perçue" => "[p. 28]",
    "### R — Relationnelle" => "[p. 29]",
    "## Comment l'IA reconfigure les trois interdépendances du triangle R - P – C (à tester empiriquement)" => "[p. 30]",
    "## P2 — La transparence comme mécanisme médiateur" => "[p. 30]",
    "## P3 — Les contingences acteur de la transparence substantive: littératie IA et aversion à l’algorithme" => "[p. 31]",
    "# 4. CADRE D'OBSERVATION" => "[p. 32]",
    "## Situations et observables" => "[p. 33]",
    "# 5. POSTURE DU CHERCHEUR ET DESIGN DE LA RECHERCHE" => "[p. 35]",
    "# 6. ILLUSTRATION" => "[p. 38]",
    "# BIBLIOGRAPHIE" => "[p. 42]"
  }
  seen = {}
  out = []

  markdown.each_line do |line|
    clean = line.strip
    page = markers[clean]
    if page && !seen[clean]
      out << page
      out << ""
      seen[clean] = true
    end
    out << line.chomp
  end

  out.join("\n").gsub(/\n{3,}/, "\n\n").strip + "\n"
end

def markdown_to_html(markdown, lang, title)
  html = [
    "<!doctype html>",
    "<html><head><meta charset=\"utf-8\"><title>#{CGI.escapeHTML(title)}</title>",
    "<style>body{font-family:Aptos,Arial,sans-serif;line-height:1.45;color:#111827}h1{font-size:24pt;margin-top:24pt}h2{font-size:17pt;margin-top:18pt}h3{font-size:13pt;margin-top:14pt}p,li{font-size:11pt}.page-marker{color:#6b7280;font-style:italic}</style>",
    "</head><body lang=\"#{CGI.escapeHTML(lang)}\">"
  ]

  markdown.each_line do |line|
    clean = line.strip
    next if clean.empty?
    if clean.start_with?("[p. ")
      html << "<p class=\"page-marker\">#{CGI.escapeHTML(clean)}</p>"
    elsif clean.start_with?("### ")
      html << "<h3>#{CGI.escapeHTML(clean[4..])}</h3>"
    elsif clean.start_with?("## ")
      html << "<h2>#{CGI.escapeHTML(clean[3..])}</h2>"
    elsif clean.start_with?("# ")
      html << "<h1>#{CGI.escapeHTML(clean[2..])}</h1>"
    elsif clean.start_with?("- ")
      html << "<p>• #{CGI.escapeHTML(clean[2..])}</p>"
    else
      html << "<p>#{CGI.escapeHTML(clean)}</p>"
    end
  end

  html << "</body></html>"
  html.join("\n")
end

def paragraph_xml(text, style = nil)
  runs = CGI.escapeHTML(text.to_s).split("\n").map do |part|
    "<w:r><w:t xml:space=\"preserve\">#{part}</w:t></w:r>"
  end.join("<w:r><w:br/></w:r>")
  style_xml = style ? "<w:pPr><w:pStyle w:val=\"#{style}\"/></w:pPr>" : ""
  "<w:p>#{style_xml}#{runs}</w:p>"
end

def markdown_to_docx(markdown, output_path)
  build_dir = "/private/tmp/cadre_docx_build"
  FileUtils.rm_rf(build_dir)
  FileUtils.mkdir_p(File.join(build_dir, "_rels"))
  FileUtils.mkdir_p(File.join(build_dir, "word", "_rels"))

  paragraphs = markdown.each_line.map do |line|
    clean = line.strip
    next if clean.empty?
    if clean.start_with?("# ")
      paragraph_xml(clean[2..], "Heading1")
    elsif clean.start_with?("## ")
      paragraph_xml(clean[3..], "Heading2")
    elsif clean.start_with?("### ")
      paragraph_xml(clean[4..], "Heading3")
    elsif clean.start_with?("- ")
      paragraph_xml("• #{clean[2..]}")
    elsif clean.start_with?("[p. ")
      paragraph_xml(clean, "IntenseQuote")
    else
      paragraph_xml(clean)
    end
  end.compact.join

  File.write(File.join(build_dir, "[Content_Types].xml"), <<~XML)
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
      <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
    </Types>
  XML
  File.write(File.join(build_dir, "_rels", ".rels"), <<~XML)
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    </Relationships>
  XML
  File.write(File.join(build_dir, "word", "_rels", "document.xml.rels"), <<~XML)
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>
  XML
  File.write(File.join(build_dir, "word", "styles.xml"), <<~XML)
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>
      <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style>
      <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="26"/></w:rPr></w:style>
      <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="23"/></w:rPr></w:style>
      <w:style w:type="paragraph" w:styleId="IntenseQuote"><w:name w:val="Intense Quote"/><w:basedOn w:val="Normal"/><w:rPr><w:i/><w:color w:val="6B7280"/></w:rPr></w:style>
    </w:styles>
  XML
  File.write(File.join(build_dir, "word", "document.xml"), <<~XML)
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        #{paragraphs}
        <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
      </w:body>
    </w:document>
  XML

  FileUtils.rm_f(output_path)
  Dir.chdir(build_dir) do
    run("/usr/bin/zip", "-qr", output_path, "[Content_Types].xml", "_rels", "word")
  end
end

def load_content
  raw = File.read(CONTENT_PATH)
  match = raw.match(/window\.ARTEFACT_CONTENT = (\{.*\});\s*$/m)
  abort("Could not parse content.js") unless match
  JSON.parse(match[1])
end

def write_content(content)
  bibliography = JSON.pretty_generate(content.fetch("locales").fetch("fr").fetch("bibliography").fetch("entries"))
  File.write(CONTENT_PATH, "var PRIMARY_BIBLIOGRAPHY = #{bibliography};\n\nwindow.ARTEFACT_CONTENT = #{JSON.pretty_generate(content)};\n")
end

def update_french_content(content, markdown)
  fr = content.fetch("locales").fetch("fr")
  fr["hero"]["title"] = "Vers une reconfiguration de la valeur perçue du conseil à l’ère de l’IA : repenser la co-création de connaissances managériales."
  fr["hero"]["subtitle"] = "Cadre exploratoire et conception du design de recherche"
  fr["hero"]["signature"] = "Yunes, Clément - Université de Bordeaux – Avril 2026 – 2e année de doctorat"
  fr["nav"] = [
    { "id" => "why", "label" => "1. POSITIONNEMENT DE LA RECHERCHE" },
    { "id" => "theory", "label" => "2. CADRE THEORIQUE MOBILISÉ" },
    { "id" => "propositions", "label" => "3. CADRE PROPOSITIONNEL" },
    { "id" => "spheres", "label" => "4. CADRE D'OBSERVATION" },
    { "id" => "posture", "label" => "5. POSTURE DU CHERCHEUR" },
    { "id" => "illustration", "label" => "6. ILLUSTRATION" },
    { "id" => "bibliography", "label" => "BIBLIOGRAPHIE" }
  ]

  fr["whyResearch"]["questionHtml"] = html_paragraphs(section(markdown, "## Problématisation", "## Intérêt de la recherche"))
  fr["whyResearch"]["whyHtml"] = html_paragraphs(section(markdown, "## Intérêt de la recherche", "# 2. CADRE THEORIQUE MOBILISÉ"))
  fr["whyResearch"]["gapHtml"] = html_paragraphs("En proposant de nouvelles dimensions de la valeur perçue, plus adaptées à l’intégration de l’IA dans les pratiques du conseil (le triptyque R-P-C), articulées à un cadre propositionnel (P1, P2, P3) et d’observation (configurations d'interaction S1, S2, S3) spécifiques, nous définissons une plateforme conceptuelle qui permet de mieux comprendre ce qui fait la valeur perçue du conseil à l'ère de l'IA.")

  fr["theory"]["overviewBlocks"] = [
    { "label" => "La valeur perçue du conseil, un accomplissement social", "text" => section(markdown, "La valeur perçue du conseil, un accomplissement social", "L’IA perturbateur de l’accomplissement social") },
    { "label" => "L’IA perturbateur de l’accomplissement social : la perspective de l’enchevêtrement", "text" => section(markdown, "L’IA perturbateur de l’accomplissement social", "# 3. CADRE PROPOSITIONNEL") }
  ]

  fr["propositions"]["introHtml"] = html_paragraphs(section(markdown, "# 3. CADRE PROPOSITIONNEL", "## P1 — Reconfiguration multidimensionnelle de la valeur perçue"))
  fr["propositions"]["modelLabel"] = "LE TRIANGLE R - P - C"
  fr["propositions"]["sequenceHtml"] = "<strong>TRIANGLE</strong> <span class=\"sequence-pill sequence-pill--relational\">R</span><span class=\"sequence-arrow\">↔</span><span class=\"sequence-pill sequence-pill--processual\">P</span><span class=\"sequence-arrow\">↔</span><span class=\"sequence-pill sequence-pill--cognitive\">C</span>"
  fr["propositions"]["dimensionCards"] = [
    { "tone" => "relational", "label" => "Relationnelle", "letter" => "R", "text" => "Légitimité de la prestation de conseil, activement produite par l'interaction et mise à l'épreuve par l'opacité des systèmes humain-IA." },
    { "tone" => "processual", "label" => "Processuelle", "letter" => "P", "text" => "L'expérience dialogique de la co-création, la lisibilité des interactions, la transparence des mécanismes d'usage de l'IA et la juste distribution des rôles consultant-client-IA." },
    { "tone" => "cognitive", "label" => "Cognitive", "letter" => "C", "text" => "L'appropriation cognitive et la création de connaissances managériales, lorsque les productions deviennent intelligibles, évaluables et mobilisables par le client." }
  ]
  fr["propositions"]["rpcDiagram"]["title"] = "Comment l'IA reconfigure les trois interdépendances du triangle R - P – C"
  fr["propositions"]["rpcDiagram"]["intro"] = section(markdown, "## Comment l'IA reconfigure les trois interdépendances du triangle R - P – C", "## P2 — La transparence comme mécanisme médiateur")
  fr["propositions"]["rpcDiagram"]["links"] = [
    { "label" => "R ↔ P", "positive" => "Une orchestration visible et crédible peut renforcer l'engagement processuel.", "negative" => "Un usage masqué de l'IA peut fragiliser la légitimité et délégitimer rétrospectivement le processus.", "contingency" => "Protégé par P2, modulé par la lisibilité, la littératie IA et l'aversion à l'algorithme." },
    { "label" => "P ↔ C", "positive" => "Une co-création visible avec l'IA peut enrichir l'appropriation et la création de connaissances.", "negative" => "L'IA peut découpler la connaissance de la co-production si le client reçoit des outputs sans participer à leur génération.", "contingency" => "Dépend de l'explicitation substantive du conseil, modulée par P3." },
    { "label" => "C ↔ R", "positive" => "La création de connaissances nouvelles peut renforcer rétroactivement la légitimité du conseil.", "negative" => "Une absence d'appropriation cognitive peut éroder la légitimité a posteriori.", "contingency" => "Lien à tester empiriquement dans l'étude de cas." }
  ]
  fr["propositions"]["propositionDetails"] = [
    { "tone" => "relational", "badge" => "P1", "title" => "P1 — Reconfiguration multidimensionnelle de la valeur perçue", "text" => section(markdown, "## P1 — Reconfiguration multidimensionnelle de la valeur perçue", "## Comment l'IA reconfigure les trois interdépendances du triangle R - P – C") },
    { "tone" => "processual", "badge" => "P2", "title" => "P2 — La transparence comme mécanisme médiateur", "text" => section(markdown, "## P2 — La transparence comme mécanisme médiateur", "## P3 — Les contingences acteur de la transparence substantive") },
    { "tone" => "cognitive", "badge" => "P3", "title" => "P3 — Les contingences acteur de la transparence substantive", "text" => section(markdown, "## P3 — Les contingences acteur de la transparence substantive", "# 4. CADRE D'OBSERVATION") }
  ]

  fr["spheres"]["title"] = "Les 3 sphères de co-création de valeur perçue du conseil à l’ère de l’IA : S1, S2, S3"
  fr["spheres"]["intro"] = section(markdown, "## Les 3 sphères", "## Situations et observables")
  fr["spheres"]["cards"] = [
    { "key" => "s1", "tone" => "s1", "title" => "S1 — Sans IA", "text" => section(markdown, "### S1 — Sans IA", "### S2 — IA en silo") },
    { "key" => "s2", "tone" => "s2", "title" => "S2 — IA en silo", "text" => section(markdown, "### S2 — IA en silo", "### S3 — Co-création tripartite") },
    { "key" => "s3", "tone" => "s3", "title" => "S3 — Co-création tripartite", "text" => section(markdown, "### S3 — Co-création tripartite", "# 5. POSTURE DU CHERCHEUR ET DESIGN DE LA RECHERCHE") }
  ]

  fr["posture"] = {
    "kicker" => "5. POSTURE DU CHERCHEUR ET DESIGN DE LA RECHERCHE",
    "title" => "Posture du chercheur et design de la recherche",
    "blocks" => [
      { "label" => "Une démarche qualitative exploratoire en deux temps", "text" => section(markdown, "## Une démarche qualitative exploratoire en deux temps", "## Un design d'étude de cas exemplaire") },
      { "label" => "Un design d'étude de cas exemplaire en grandeur réelle", "text" => section(markdown, "## Un design d'étude de cas exemplaire", "## Une posture assumée de praticien réflexif") },
      { "label" => "Une posture assumée de praticien réflexif", "text" => section(markdown, "## Une posture assumée de praticien réflexif", "## Un dispositif de réflexivité renforcé") },
      { "label" => "Un dispositif de réflexivité renforcé face au risque de biais", "text" => section(markdown, "## Un dispositif de réflexivité renforcé", "# 6. ILLUSTRATION") }
    ]
  }

  fr["illustration"]["kicker"] = "6. ILLUSTRATION"
  fr["illustration"]["intro"] = [
    "Ce scénario illustre, de manière fictive, la co-création de valeur perçue à l'œuvre dans le conseil, à travers la séquence R→P→C, examinée au prisme des trois propositions de recherche (P1, P2, P3) et du cadre d'observation S1/S2/S3, y compris leur capacité à être défendues politiquement dans l'organisation.",
    "L'objectif de cette simulation est de pré-tester, en amont de la phase empirique, le terrain d'observation grandeur nature prévu pour l'étude (étude de cas exemplaire unique).",
    "La mission fictive est structurée en trois grandes phases caractéristiques des missions de conseil (cadrage, analyse, recommandations), auxquelles une quatrième phase post-mission est ajoutée afin de permettre une lecture rétrospective de la co-création de valeur perçue en fin de mission.",
    "Note : un simulateur a été conçu pour tester et interroger les effets du modèle sur ce scénario fictif. Il représente graphiquement et interactivement la mission de conseil et permet de questionner, via l'assistant IA exposé au cadre analytique, les situations et observables au prisme de ce cadre."
  ].join("\n\n")
  fr["illustration"]["legend"] = "Chaque phase est divisée en sous-phases dans lesquelles se déroule l'observation : situation de co-création observée (S), propositions de recherche les plus directement examinées (P), dimensions observées de la valeur perçue (R, P, C)."
  fr["bibliography"]["entries"] = bibliography_entries(markdown)
end

run("/usr/bin/textutil", "-convert", "txt", SOURCE_DOCX, "-output", TMP_TXT)
source_text = File.read(TMP_TXT)
markdown = to_markdown(source_text)
full_markdown = to_markdown(source_text, full_document: true)
marked_markdown = page_marked(markdown)
marked_full_markdown = page_marked(full_markdown)
content = load_content
update_french_content(content, markdown)
write_content(content)

File.write(FR_MARKDOWN_PATH, marked_markdown)
File.write(
  SOURCE_MARKDOWN_PATH,
  "# Cadre exploratoire - source primaire\n\nDocument source : Cadre_Exploratoire_YUNES_V0.docx\nVersion synchronisée avec l'application interactive.\nPérimètre chatbot : document complet, incluant note préliminaire, plan prévisionnel détaillé de la thèse, cadre exploratoire et bibliographie.\nPérimètre UX de l'application : cadre exploratoire uniquement, afin de ne pas alourdir la navigation.\n\n#{marked_full_markdown}"
)
File.write(FR_HTML_PATH, markdown_to_html(marked_markdown, "fr", "Cadre exploratoire - Yunes Clement"))
