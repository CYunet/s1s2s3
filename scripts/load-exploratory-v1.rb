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
  return 1 if line.match?(/^(1|2|3|4|5|6|7)\. [A-ZÉÈÊËÀÂÎÏÔÛÙÇ’' -]+(\s| )*(:|$)/) || line == "BIBLIOGRAPHIE"
  return 2 if line.match?(/^(Problématisation|Intérêt de la recherche|De l'accomplissement social|La finalité du conseil|L’intégration de l’IA|Penser l'IA|L’IA, comment|L’IA, une composante|Implication théorique|Implication praxéologique|La Service-Dominant Logic|L'interaction client-consultant|L’IA comme perturbateur|La Rencontre de Service Hybride|Synthèse du cadre théorique|P1 —|P1 –|P2 —|P2 –|P3 —|P3 –|Dimensions de la valeur|Comment l'IA|Opérationnalisation du cadre|S1 \(Sans IA\)|Les 3 sphères|Situations et observables|Une démarche|Un design|Une posture|Le cas étudié|Un dispositif|Scénario fictif|Phases du scenario)/)
  return 3 if line.match?(/^(R|P|C) — /) || line.match?(/^S[1-3] — /) || line.match?(/^[1-4]\. /) || line.match?(/— Sem\.|— Post|Exploration|Préparation|Analyse collaborative|Affinement|Validation mutuelle|Présentation au COMEX/)
  0
end

def to_markdown(text, full_document: false)
  lines = text.gsub("\r\n", "\n").split("\n")
  start = if full_document
    0
  else
    lines.index { |line| normalize_spaces(line).start_with?("1. POSITIONNEMENT") && !line.include?("\t") }
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

def heading_marker(markdown, prefix)
  marker = markdown.each_line.find do |line|
    line.sub(/^#+\s*/, "").strip.start_with?(prefix)
  end
  abort("Missing heading prefix: #{prefix}") unless marker
  marker.strip
end

def section_prefix(markdown, start_prefix, end_prefix = nil)
  section(
    markdown,
    heading_marker(markdown, start_prefix),
    end_prefix ? heading_marker(markdown, end_prefix) : nil
  )
end

def html_paragraphs(value)
  clean_block(value).split(/\n{2,}/).map { |paragraph| CGI.escapeHTML(paragraph) }.join("<br><br>")
end

def bibliography_entries(markdown)
  section_prefix(markdown, "7. BIBLIOGRAPHIE").split(/\n{2,}/).map { |entry| strip_inline(entry) }.reject(&:empty?)
end

def page_marked(markdown)
  markers = [
    ["Note préliminaire", "[p. 3]"],
    ["Plan prévisionnel détaillé de la thèse", "[p. 4]"],
    ["Sommaire du cadre exploratoire", "[p. 14]"],
    ["1. POSITIONNEMENT", "[p. 17]"],
    ["2. CADRE THÉORIQUE", "[p. 24]"],
    ["3. CADRE PROPOSITIONNEL", "[p. 31]"],
    ["P1", "[p. 32]"],
    ["R — Relationnelle", "[p. 33]"],
    ["Comment l'IA reconfigure", "[p. 34]"],
    ["P2", "[p. 35]"],
    ["P3", "[p. 35]"],
    ["4. CADRE D’OBSERVATION", "[p. 36]"],
    ["S1 (Sans IA)", "[p. 37]"],
    ["5. DESIGN DE RECHERCHE", "[p. 39]"],
    ["6. ILLUSTRATION", "[p. 43]"],
    ["7. BIBLIOGRAPHIE", "[p. 47]"]
  ]
  out = []

  markdown.each_line do |line|
    raw = line.strip
    clean = raw.sub(/^#+\s*/, "")
    marker = raw.start_with?("#") ? markers.find { |item| clean.start_with?(item[0]) } : nil
    if marker
      page = marker[1]
      out << page
      out << ""
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
    { "id" => "why", "label" => "1. POSITIONNEMENT" },
    { "id" => "theory", "label" => "2. CADRE THÉORIQUE MOBILISÉ" },
    { "id" => "propositions", "label" => "3. CADRE PROPOSITIONNEL" },
    { "id" => "spheres", "label" => "4. CADRE D'OBSERVATION" },
    { "id" => "posture", "label" => "5. DESIGN DE RECHERCHE" },
    { "id" => "illustration", "label" => "6. ILLUSTRATION" },
    { "id" => "bibliography", "label" => "BIBLIOGRAPHIE" }
  ]

  fr["whyResearch"]["questionHtml"] = html_paragraphs(section_prefix(markdown, "La finalité du conseil", "L’intégration de l’IA"))
  fr["whyResearch"]["whyHtml"] = html_paragraphs(section_prefix(markdown, "L’intégration de l’IA", "Penser l'IA"))
  fr["whyResearch"]["gapHtml"] = html_paragraphs(section_prefix(markdown, "Penser l'IA", "2. CADRE"))

  fr["theory"]["overviewBlocks"] = [
    { "label" => "La Service-Dominant Logic : la valeur du conseil comme cocréation en sphère conjointe", "text" => section_prefix(markdown, "La Service-Dominant Logic", "L'interaction client-consultant") },
    { "label" => "L'interaction client-consultant comme processus social de création de connaissances", "text" => section_prefix(markdown, "L'interaction client-consultant", "L’IA comme perturbateur") },
    { "label" => "L’IA comme perturbateur de l'attribution de valeur", "text" => section_prefix(markdown, "L’IA comme perturbateur", "La Rencontre de Service Hybride") },
    { "label" => "La Rencontre de Service Hybride : du design de l’IA au co-pilotage de la valeur", "text" => section_prefix(markdown, "La Rencontre de Service Hybride", "Synthèse du cadre théorique") },
    { "label" => "Synthèse du cadre théorique : l'intelligibilité de l'intelligence hybride comme condition de la valeur perçue", "text" => section_prefix(markdown, "Synthèse du cadre théorique", "3. CADRE PROPOSITIONNEL") }
  ]

  fr["propositions"]["introHtml"] = html_paragraphs(section_prefix(markdown, "3. CADRE PROPOSITIONNEL", "P1"))
  fr["propositions"]["modelLabel"] = "LE TRIANGLE R - P - C"
  fr["propositions"]["sequenceHtml"] = "<strong>TRIANGLE</strong> <span class=\"sequence-pill sequence-pill--relational\">R</span><span class=\"sequence-arrow\">↔</span><span class=\"sequence-pill sequence-pill--processual\">P</span><span class=\"sequence-arrow\">↔</span><span class=\"sequence-pill sequence-pill--cognitive\">C</span>"
  fr["propositions"]["dimensionCards"] = [
    { "tone" => "relational", "label" => "Relationnelle", "letter" => "R", "text" => "Légitimité de la prestation de conseil, activement produite par l'interaction et mise à l'épreuve par l'opacité des systèmes humain-IA." },
    { "tone" => "processual", "label" => "Processuelle", "letter" => "P", "text" => "L'expérience dialogique de la co-création, la lisibilité des interactions, la transparence des mécanismes d'usage de l'IA et la juste distribution des rôles consultant-client-IA." },
    { "tone" => "cognitive", "label" => "Cognitive", "letter" => "C", "text" => "L'appropriation cognitive et la création de connaissances managériales, lorsque les productions deviennent intelligibles, évaluables et mobilisables par le client." }
  ]
  fr["propositions"]["rpcDiagram"]["title"] = "Comment l'IA reconfigure les trois interdépendances du triangle R - P – C"
  fr["propositions"]["rpcDiagram"]["intro"] = section_prefix(markdown, "Comment l'IA reconfigure", "P2")
  fr["propositions"]["rpcDiagram"]["links"] = [
    { "label" => "R ↔ P", "positive" => "Une orchestration visible et crédible peut renforcer l'engagement processuel.", "negative" => "Un usage masqué de l'IA peut fragiliser la légitimité et délégitimer rétrospectivement le processus.", "contingency" => "Protégé par P2, modulé par la lisibilité, la littératie IA et l'aversion à l'algorithme." },
    { "label" => "P ↔ C", "positive" => "Une co-création visible avec l'IA peut enrichir l'appropriation et la création de connaissances.", "negative" => "L'IA peut découpler la connaissance de la co-production si le client reçoit des outputs sans participer à leur génération.", "contingency" => "Dépend de l'explicitation substantive du conseil, modulée par P3." },
    { "label" => "C ↔ R", "positive" => "La création de connaissances nouvelles peut renforcer rétroactivement la légitimité du conseil.", "negative" => "Une absence d'appropriation cognitive peut éroder la légitimité a posteriori.", "contingency" => "Lien à tester empiriquement dans l'étude de cas." }
  ]
  fr["propositions"]["propositionDetails"] = [
    { "tone" => "relational", "badge" => "P1", "title" => "P1 — La reconfiguration multidimensionnelle de la valeur par l'IA", "text" => section_prefix(markdown, "P1", "Comment l'IA reconfigure") },
    { "tone" => "processual", "badge" => "P2", "title" => "P2 — La transparence comme mécanisme médiateur face à la boîte noire", "text" => section_prefix(markdown, "P2", "P3") },
    { "tone" => "cognitive", "badge" => "P3", "title" => "P3 — L’influence des profils d'acteurs", "text" => section_prefix(markdown, "P3", "4. CADRE") }
  ]

  fr["spheres"]["title"] = "Les 3 sphères de co-création de valeur perçue du conseil à l’ère de l’IA : S1, S2, S3"
  fr["spheres"]["intro"] = section_prefix(markdown, "4. CADRE", "S1 (Sans IA)")
  fr["spheres"]["cards"] = [
    { "key" => "s1", "tone" => "s1", "title" => "S1 — Sans IA", "text" => section_prefix(markdown, "S1 — Sans IA", "S2 — IA en silo") },
    { "key" => "s2", "tone" => "s2", "title" => "S2 — IA en silo", "text" => section_prefix(markdown, "S2 — IA en silo", "S3 — Cocréation tripartite") },
    { "key" => "s3", "tone" => "s3", "title" => "S3 — Cocréation tripartite", "text" => section_prefix(markdown, "S3 — Cocréation tripartite", "5. DESIGN") }
  ]

  fr["posture"] = {
    "kicker" => "5. DESIGN DE RECHERCHE",
    "title" => "Etude de cas exemplaire et auto-ethnographie d’un praticien réflexif",
    "blocks" => [
      { "label" => "Une démarche qualitative exploratoire en deux temps", "text" => section_prefix(markdown, "Une démarche qualitative exploratoire", "Un design d'étude de cas") },
      { "label" => "Un design d'étude de cas exemplaire en grandeur réelle", "text" => section_prefix(markdown, "Un design d'étude de cas", "Une posture assumée") },
      { "label" => "Une posture assumée de praticien réflexif", "text" => section_prefix(markdown, "Une posture assumée", "Un dispositif de réflexivité") },
      { "label" => "Un dispositif de réflexivité renforcé face au risque de biais", "text" => section_prefix(markdown, "Un dispositif de réflexivité", "6. ILLUSTRATION") }
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
  "# Cadre exploratoire - source primaire\n\nDocument source : Cadre_Exploratoire_YUNES_V0.1.docx\nVersion synchronisée avec l'application interactive.\nPérimètre chatbot : document complet, incluant note préliminaire, plan prévisionnel détaillé de la thèse, cadre exploratoire et bibliographie.\nPérimètre UX de l'application : cadre exploratoire uniquement, afin de ne pas alourdir la navigation.\n\n#{marked_full_markdown}"
)
File.write(FR_HTML_PATH, markdown_to_html(marked_markdown, "fr", "Cadre exploratoire - Yunes Clement"))
