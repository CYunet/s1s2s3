(function () {
  var content = window.ARTEFACT_CONTENT;
  var state = {
    lang: "fr",
    theme: "light",
    phase: 1,
    panel: null,
    sphere: "s1",
    diagBox: null,
    scrollSphere: false
  };

  var els = {
    html: document.documentElement,
    mainTitle: document.getElementById("mainTitle"),
    subtitle: document.getElementById("subtitle"),
    introText: document.getElementById("introText"),
    heroSignature: document.getElementById("heroSignature"),
    caseTitle: document.getElementById("caseTitle"),
    caseGrid: document.getElementById("caseGrid"),
    btnTheory: document.getElementById("btnTheory"),
    btnSpheres: document.getElementById("btnSpheres"),
    timelineKicker: document.getElementById("timelineKicker"),
    timelineHeading: document.getElementById("timelineHeading"),
    tlDesc: document.getElementById("tlDesc"),
    phaseNav: document.getElementById("phaseNav"),
    phContent: document.getElementById("phContent"),
    panelShell: document.getElementById("panelShell"),
    detailPanel: document.getElementById("detailPanel"),
    panelTitle: document.getElementById("panelTitle"),
    panelEyebrow: document.getElementById("panelEyebrow"),
    panelBody: document.getElementById("panelBody"),
    panelCloseBtn: document.getElementById("panelCloseBtn"),
    langBtn: document.getElementById("langBtn"),
    themeBtn: document.getElementById("themeBtn")
  };

  var panelDrag = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originLeft: 0,
    originTop: 0
  };

  function getUI() {
    return content.ui[state.lang];
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderMeta() {
    var ui = getUI();
    var caseData = content.caseData[state.lang];

    els.caseTitle.textContent = ui.caseTitle;
    els.caseGrid.innerHTML = caseData.map(function (item) {
      return (
        '<div class="meta-item">' +
        '<span class="meta-item__label" style="color:' + item.color + '">' + escapeHtml(item.label) + "</span>" +
        '<span class="meta-item__value">' + escapeHtml(item.value) + "</span>" +
        "</div>"
      );
    }).join("");
  }

  function centerPanel() {
    var panel = els.detailPanel;
    panel.style.left = "50%";
    panel.style.top = "50%";
    panel.style.transform = "translate(-50%, -50%)";
  }

  function clampPanelPosition(left, top) {
    var panel = els.detailPanel;
    var rect = panel.getBoundingClientRect();
    var maxLeft = Math.max(8, window.innerWidth - rect.width - 8);
    var maxTop = Math.max(8, window.innerHeight - rect.height - 8);

    return {
      left: Math.min(Math.max(8, left), maxLeft),
      top: Math.min(Math.max(8, top), maxTop)
    };
  }

  function setTextOrHide(element, text) {
    element.textContent = text || "";
    element.hidden = !text;
  }

  function renderTimeline() {
    var ui = getUI();
    var phases = content.phases[state.lang];

    els.phaseNav.innerHTML = phases.map(function (phase) {
      var selected = phase.num === state.phase;
      return (
        '<button class="phase-chip" type="button" role="tab" aria-selected="' + String(selected) + '" aria-controls="phContent" data-phase="' + phase.num + '">' +
        '<span class="phase-chip__icon">' + phase.icon + "</span>" +
        '<span class="phase-chip__label">' + escapeHtml(phase.label) + "</span>" +
        '<span class="phase-chip__name">' + escapeHtml(phase.name) + "</span>" +
        '<span class="phase-chip__duration">' + escapeHtml(phase.dur) + "</span>" +
        "</button>"
      );
    }).join("");

    var active = phases[state.phase - 1];
    els.phContent.innerHTML =
      '<h3 class="phase-detail__title">' + escapeHtml(active.title) + "</h3>" +
      '<p class="phase-detail__desc">' + escapeHtml(active.desc) + "</p>" +
      '<div class="phase-detail__example">' + active.ex + "</div>" +
      '<strong>' + escapeHtml(ui.propsLabel) + "</strong>" +
      '<ul class="phase-detail__list">' +
      active.props.map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      }).join("") +
      "</ul>";
  }

  function buildTheoryDiagramSvg(fr, activeBox) {
    var lightTheme = state.theme === "light";
    var lSeq = fr ? "Séquence primaire (valide avec ou sans IA)" : "Primary sequence (valid with or without AI)";
    var lFb = fr ? "Rétroaction fondée P→R" : "Grounded feedback P→R";
    var lAI = fr ? "⚡ Déstabilisations spécifiques à l'intégration IA" : "⚡ AI-specific destabilisations";
    var lR1 = fr ? "Valeur" : "Relational";
    var lR2 = fr ? "Relationnelle" : "Value";
    var lP1 = fr ? "Valeur" : "Processual";
    var lP2 = fr ? "Processuelle" : "Value";
    var lC1 = fr ? "Valeur" : "Cognitive";
    var lC2 = fr ? "Cognitive" : "Value";
    var lClick = fr ? "tap →" : "tap →";
    var lL1 = fr ? "Séquence primaire" : "Primary sequence";
    var lL2 = fr ? "Rétroaction fondée" : "Grounded feedback";
    var lL3 = fr ? "Déstabilisation IA" : "AI destabilisation";
    var palette = lightTheme ? {
      topFill: "#efe6d8",
      topText: "#8b7d69",
      topNeutral: "#8b7d69",
      topCapFill: "#fffaf2",
      riskFill: "#f8eee8",
      riskText: "#665844",
      legendFill: "#f3ebdf",
      legendStroke: "rgba(95, 74, 46, 0.16)",
      sequenceStroke: "#8b7d69",
      nodeText: {
        relational: "#7d3112",
        processual: "#4e43b1",
        cognitive: "#0f6e54"
      },
      nodeFill: {
        relational: "#f4ddd0",
        processual: "#e4defd",
        cognitive: "#daf1e7"
      },
      nodeStroke: {
        relational: "#a94a1f",
        processual: "#5850c8",
        cognitive: "#138563"
      },
      boxFills: {
        b1: "#fff4ee",
        b2: "#eef9f4",
        b3: "#f3efff"
      }
    } : {
      topFill: "#1a1f27",
      topText: "#8b949e",
      topNeutral: "#8b949e",
      topCapFill: "#161b22",
      riskFill: "#1c0a0a",
      riskText: "#8b949e",
      legendFill: "#21262d",
      legendStroke: "#30363d",
      sequenceStroke: "#8b949e",
      nodeText: {
        relational: "#f0997b",
        processual: "#afa9ec",
        cognitive: "#5dcaa5"
      },
      nodeFill: {
        relational: "#4a1b0c",
        processual: "#26215c",
        cognitive: "#04342c"
      },
      nodeStroke: {
        relational: "#993c1d",
        processual: "#534ab7",
        cognitive: "#1d9e75"
      },
      boxFills: {
        b1: "#2a0f08",
        b2: "#041a10",
        b3: "#160e26"
      }
    };
    var boxes = [
      {
        id: "b1",
        cx: 114,
        col: "#ef4444",
        fill: palette.boxFills.b1,
        t: fr ? "① R→P fragilisée" : "① R→P fragile",
        a: fr ? "Légitimité masquée (S2)" : "Masked legitimacy (S2)",
        b: fr ? "→ délégitimation rétrospective" : "→ retrospective delegitimisation",
        c: fr ? "Protecteur : P2 (transparence)" : "Protective: P2 (transparency)",
        tc: "#c9a090",
        cc: "#8b5cf6"
      },
      {
        id: "b2",
        cx: 320,
        col: "#1d9e75",
        fill: palette.boxFills.b2,
        t: fr ? "② P→C découplée" : "② P→C decoupled",
        a: fr ? "L'IA livre la connaissance" : "AI delivers knowledge",
        b: fr ? "sans engagement processuel réel" : "without processual engagement",
        c: fr ? "→ rupture structurellement nouvelle" : "→ structurally new rupture",
        tc: "#5dcaa5",
        cc: "#ef4444"
      },
      {
        id: "b3",
        cx: 526,
        col: "#534ab7",
        fill: palette.boxFills.b3,
        t: fr ? "③ Rétroaction P→R inversée" : "③ P→R feedback inverted",
        a: fr ? "Output IA remarquable" : "Spectacular AI output",
        b: fr ? "→ attribution à l'IA, pas au consultant" : "→ attribution to AI, not consultant",
        c: fr ? "Modérateur : P3 (AI literacy)" : "Moderator: P3 (AI literacy)",
        tc: "#afa9ec",
        cc: "#1d9e75"
      }
    ];
    var parts = [
      '<defs><marker id="arrD" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>'
    ];

    parts.push('<rect x="10" y="8" width="620" height="128" rx="10" fill="' + palette.topFill + '" opacity="0.96"/>');
    parts.push('<text x="320" y="26" text-anchor="middle" font-size="11" font-weight="600" fill="' + palette.topText + '" font-family="sans-serif">' + lSeq + "</text>");

    [
      { id: "relational", x: 28, l1: lR1, l2: lR2 },
      { id: "processual", x: 238, l1: lP1, l2: lP2 },
      { id: "cognitive", x: 448, l1: lC1, l2: lC2 }
    ].forEach(function (node) {
      var cx = node.x + 75;
      var stroke = palette.nodeStroke[node.id];
      var fill = palette.nodeFill[node.id];
      var text = palette.nodeText[node.id];
      parts.push('<g data-theory-dim="' + node.id + '" style="cursor:pointer">');
      parts.push('<rect x="' + node.x + '" y="36" width="150" height="68" rx="10" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2.5"/>');
      parts.push('<text x="' + cx + '" y="60" text-anchor="middle" font-size="13" font-weight="700" fill="' + text + '" font-family="sans-serif">' + node.l1 + "</text>");
      parts.push('<text x="' + cx + '" y="79" text-anchor="middle" font-size="13" font-weight="700" fill="' + text + '" font-family="sans-serif">' + node.l2 + "</text>");
      parts.push("</g>");
    });

    parts.push('<path d="M 178 70 L 238 70" fill="none" stroke="' + palette.sequenceStroke + '" stroke-width="2.5" marker-end="url(#arrD)"/>');
    parts.push('<path d="M 388 70 L 448 70" fill="none" stroke="' + palette.sequenceStroke + '" stroke-width="2.5" marker-end="url(#arrD)"/>');
    parts.push('<path d="M 313 108 C 313 130 103 130 103 108" fill="none" stroke="#993c1d" stroke-width="1.8" stroke-dasharray="6 3" marker-end="url(#arrD)"/>');
    parts.push('<rect x="168" y="112" width="116" height="14" rx="4" fill="' + palette.topCapFill + '"/>');
    parts.push('<text x="226" y="123" text-anchor="middle" font-size="9" fill="#993c1d" font-family="sans-serif">' + lFb + "</text>");
    parts.push('<rect x="10" y="150" width="620" height="268" rx="10" fill="' + palette.riskFill + '" opacity="0.96"/>');
    parts.push('<text x="320" y="172" text-anchor="middle" font-size="12" font-weight="700" fill="#ef4444" font-family="sans-serif">' + lAI + "</text>");

    [103, 313, 523].forEach(function (cx, index) {
      var cols = [palette.nodeStroke.relational, palette.nodeStroke.processual, palette.nodeStroke.cognitive];
      parts.push('<line x1="' + cx + '" y1="104" x2="' + cx + '" y2="198" stroke="' + cols[index] + '" stroke-width="2" stroke-dasharray="5 4"/>');
    });

    boxes.forEach(function (box) {
      var isActive = activeBox === box.id;
      var strokeWidth = isActive ? "3" : "2";
      var x = box.cx - 96;
      parts.push('<g data-diag-box="' + box.id + '" style="cursor:pointer">');
      parts.push('<rect x="' + x + '" y="185" width="192" height="202" rx="8" fill="' + box.fill + '" stroke="' + box.col + '" stroke-width="' + strokeWidth + '"/>');
      parts.push('<text x="' + box.cx + '" y="209" text-anchor="middle" font-size="11.5" font-weight="700" fill="' + box.col + '" font-family="sans-serif">' + box.t + '</text>');
      parts.push('<line x1="' + (x + 10) + '" y1="215" x2="' + (x + 182) + '" y2="215" stroke="' + box.col + '" stroke-width="0.5" opacity="0.5"/>');
      parts.push('<text x="' + box.cx + '" y="252" text-anchor="middle" font-size="11" fill="' + box.tc + '" font-family="sans-serif">' + box.a + '</text>');
      parts.push('<text x="' + box.cx + '" y="278" text-anchor="middle" font-size="11" fill="' + box.tc + '" font-family="sans-serif">' + box.b + '</text>');
      parts.push('<text x="' + box.cx + '" y="325" text-anchor="middle" font-size="11" font-weight="600" fill="' + box.cc + '" font-family="sans-serif">' + box.c + '</text>');
      parts.push('<text x="' + box.cx + '" y="380" text-anchor="middle" font-size="9" fill="' + box.col + '" opacity="0.7" font-family="sans-serif">' + lClick + '</text>');
      parts.push("</g>");
    });

    parts.push('<rect x="10" y="432" width="620" height="22" rx="6" fill="' + palette.legendFill + '" opacity="0.96" stroke="' + palette.legendStroke + '" stroke-width="0.5"/>');
    parts.push('<line x1="22" y1="443" x2="48" y2="443" stroke="' + palette.topNeutral + '" stroke-width="2.5" marker-end="url(#arrD)"/>');
    parts.push('<text x="54" y="447" font-size="10" fill="' + palette.riskText + '" font-family="sans-serif">' + lL1 + "</text>");
    parts.push('<line x1="186" y1="443" x2="212" y2="443" stroke="#993c1d" stroke-width="1.8" stroke-dasharray="6 3" marker-end="url(#arrD)"/>');
    parts.push('<text x="218" y="447" font-size="10" fill="' + palette.riskText + '" font-family="sans-serif">' + lL2 + "</text>");
    parts.push('<rect x="360" y="435" width="12" height="12" rx="2" fill="' + palette.riskFill + '" stroke="#ef4444" stroke-width="1.5"/>');
    parts.push('<text x="378" y="447" font-size="10" fill="' + palette.riskText + '" font-family="sans-serif">' + lL3 + "</text>");
    return parts.join("");
  }

  function buildTheoryDiagramBlock() {
    var ui = getUI();
    return (
      '<div class="diagram-card">' +
      "<h3>" + escapeHtml(ui.diagTitle) + "</h3>" +
      '<p class="diagram-card__hint">' + escapeHtml(ui.diagHint) + "</p>" +
      '<div style="overflow:auto;border:1px solid var(--line);border-radius:16px;background:var(--bg-strong)">' +
      '<svg viewBox="0 0 640 458" role="img" aria-label="' + escapeHtml(ui.diagTitle) + '">' +
      buildTheoryDiagramSvg(state.lang === "fr", state.diagBox) +
      "</svg>" +
      "</div>" +
      "</div>"
    );
  }

  function renderTheoryPanel() {
    var ui = getUI();
    var theory = content.theory[state.lang];
    var html = buildTheoryDiagramBlock();

    setTextOrHide(els.panelEyebrow, ui.panelTheoryEyebrow);
    els.panelTitle.textContent = ui.theoryTitle;

    theory.forEach(function (item) {
      html += '<article class="theory-card">';
      html += "<h3>" + escapeHtml(item.title) + "</h3>";
      html += '<p class="theory-card__intro">' + escapeHtml(item.intro) + "</p>";
      html += '<div class="theory-dimensions">';
      item.dims.forEach(function (dim, index) {
        var dimId = "";
        if (item.title.indexOf("Proposition 1") === 0) {
          if (index === 0) {
            dimId = ' id="theory-dim-relational"';
          } else if (index === 1) {
            dimId = ' id="theory-dim-processual"';
          } else if (index === 2) {
            dimId = ' id="theory-dim-cognitive"';
          }
        }
        html += '<div class="dimension"' + dimId + '>';
        html += "<strong>" + escapeHtml(dim.icon + " " + dim.label) + "</strong>";
        html += "<p>" + escapeHtml(dim.text) + "</p>";
        html += "</div>";
      });
      html += "</div>";
      html += '<div class="note-card' + (item.noteRed ? " note-card--warning" : "") + '">';
      html += "<strong>" + escapeHtml(ui.anchorLabel) + "</strong>";
      html += '<p class="theory-card__note">' + item.note + "</p>";
      html += '<p class="theory-card__anchor">' + item.anchor + "</p>";
      html += "</div>";
      html += "</article>";
    });

    els.panelBody.innerHTML = html;
  }

  function buildSphereModel() {
    var ui = getUI();
    var aiLabel = ui.sphereLegendAi;

    return (
      '<div class="sphere-model">' +
      '<div class="sphere-model__frame">' +
      '<div class="sphere-model__canvas">' +
      '<svg viewBox="0 0 980 760" role="img" aria-label="' + escapeHtml(ui.sphereModelFigureTitle) + '">' +
      "<defs>" +
      '<radialGradient id="aiBall" cx="30%" cy="30%"><stop offset="0%" stop-color="#b784ff"></stop><stop offset="100%" stop-color="#8a5cf6"></stop></radialGradient>' +
      '<radialGradient id="coBall" cx="30%" cy="30%"><stop offset="0%" stop-color="#ff77bb"></stop><stop offset="100%" stop-color="#e53e96"></stop></radialGradient>' +
      '<radialGradient id="clBall" cx="30%" cy="30%"><stop offset="0%" stop-color="#5fd8ff"></stop><stop offset="100%" stop-color="#18add0"></stop></radialGradient>' +
      "</defs>" +
      '<text x="490" y="28" text-anchor="middle" font-size="22" font-weight="700" fill="var(--text)" font-family="Fraunces">' + escapeHtml(ui.sphereModelFigureTitle) + "</text>" +
      '<ellipse cx="490" cy="270" rx="430" ry="225" fill="none" stroke="#16bb84" stroke-width="3"></ellipse>' +
      '<ellipse cx="490" cy="270" rx="270" ry="150" fill="none" stroke="#8a5cf6" stroke-width="3"></ellipse>' +
      '<ellipse cx="490" cy="270" rx="155" ry="84" fill="none" stroke="#f09400" stroke-width="3"></ellipse>' +
      '<line x1="490" y1="80" x2="286" y2="238" stroke="#5d5d5d" stroke-width="2.1"></line>' +
      '<line x1="490" y1="80" x2="694" y2="238" stroke="#5d5d5d" stroke-width="2.1"></line>' +
      '<line x1="490" y1="80" x2="440" y2="270" stroke="#5d5d5d" stroke-width="2.1"></line>' +
      '<line x1="490" y1="80" x2="540" y2="270" stroke="#5d5d5d" stroke-width="2.1"></line>' +
      '<line x1="294" y1="246" x2="440" y2="270" stroke="#5d5d5d" stroke-width="2.1"></line>' +
      '<line x1="686" y1="246" x2="540" y2="270" stroke="#5d5d5d" stroke-width="2.1"></line>' +
      '<line x1="472" y1="270" x2="508" y2="270" stroke="#5d5d5d" stroke-width="2.6"></line>' +
      '<circle cx="490" cy="80" r="28" fill="url(#aiBall)"></circle>' +
      '<circle cx="286" cy="240" r="22" fill="url(#aiBall)"></circle>' +
      '<circle cx="694" cy="240" r="22" fill="url(#aiBall)"></circle>' +
      '<circle cx="440" cy="270" r="32" fill="url(#coBall)"></circle>' +
      '<circle cx="540" cy="270" r="32" fill="url(#clBall)"></circle>' +
      '<text x="490" y="89" text-anchor="middle" font-size="21" font-weight="700" fill="#ffffff" font-family="IBM Plex Sans">' + aiLabel + "</text>" +
      '<text x="286" y="247" text-anchor="middle" font-size="19" font-weight="700" fill="#ffffff" font-family="IBM Plex Sans">' + aiLabel + "</text>" +
      '<text x="694" y="247" text-anchor="middle" font-size="19" font-weight="700" fill="#ffffff" font-family="IBM Plex Sans">' + aiLabel + "</text>" +
      '<text x="440" y="280" text-anchor="middle" font-size="23" font-weight="700" fill="#ffffff" font-family="IBM Plex Sans">CO</text>' +
      '<text x="540" y="280" text-anchor="middle" font-size="23" font-weight="700" fill="#ffffff" font-family="IBM Plex Sans">CL</text>' +
      '<g class="sphere-label" data-sphere-open="s1" role="button" aria-label="' + escapeHtml(ui.tabS1) + '">' +
      '<rect x="420" y="326" width="140" height="54" rx="27" fill="var(--bg-elevated)" stroke="#e18a00"></rect>' +
      '<text x="490" y="353" fill="#e18a00">S1</text>' +
      "</g>" +
      '<g class="sphere-label" data-sphere-open="s2" role="button" aria-label="' + escapeHtml(ui.tabS2) + '">' +
      '<rect x="420" y="393" width="140" height="54" rx="27" fill="var(--bg-elevated)" stroke="#8a5cf6"></rect>' +
      '<text x="490" y="420" fill="#8a5cf6">S2</text>' +
      "</g>" +
      '<g class="sphere-label" data-sphere-open="s3" role="button" aria-label="' + escapeHtml(ui.tabS3) + '">' +
      '<rect x="420" y="468" width="140" height="54" rx="27" fill="var(--bg-elevated)" stroke="#14b87d"></rect>' +
      '<text x="490" y="495" fill="#14b87d">S3</text>' +
      "</g>" +
      '<circle cx="250" cy="620" r="8" fill="#e53e96"></circle>' +
      '<text x="266" y="626" font-size="18" fill="var(--text-soft)" font-family="IBM Plex Sans">' + escapeHtml(ui.sphereLegendConsultant) + "</text>" +
      '<circle cx="455" cy="620" r="8" fill="#18add0"></circle>' +
      '<text x="471" y="626" font-size="18" fill="var(--text-soft)" font-family="IBM Plex Sans">' + escapeHtml(ui.sphereLegendClient) + "</text>" +
      '<circle cx="650" cy="620" r="8" fill="#8a5cf6"></circle>' +
      '<text x="666" y="626" font-size="18" fill="var(--text-soft)" font-family="IBM Plex Sans">' + escapeHtml(ui.sphereLegendAi) + "</text>" +
      '<g class="sphere-label" data-sphere-open="s1" role="button" aria-label="' + escapeHtml(ui.tabS1) + '">' +
      '<rect x="150" y="662" width="190" height="56" rx="28" fill="var(--bg-elevated)" stroke="#e18a00"></rect>' +
      '<text x="245" y="690" fill="#e18a00">' + escapeHtml(ui.tabS1) + "</text>" +
      "</g>" +
      '<g class="sphere-label" data-sphere-open="s2" role="button" aria-label="' + escapeHtml(ui.tabS2) + '">' +
      '<rect x="395" y="662" width="190" height="56" rx="28" fill="var(--bg-elevated)" stroke="#8a5cf6"></rect>' +
      '<text x="490" y="690" fill="#8a5cf6">' + escapeHtml(ui.tabS2) + "</text>" +
      "</g>" +
      '<g class="sphere-label" data-sphere-open="s3" role="button" aria-label="' + escapeHtml(ui.tabS3) + '">' +
      '<rect x="640" y="662" width="220" height="56" rx="28" fill="var(--bg-elevated)" stroke="#14b87d"></rect>' +
      '<text x="750" y="690" fill="#14b87d">' + escapeHtml(ui.tabS3) + "</text>" +
      "</g>" +
      "</svg>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function renderSpheresPanel() {
    var ui = getUI();
    var data = content.spheres[state.lang];
    var html = buildSphereModel();

    setTextOrHide(els.panelEyebrow, ui.panelSpheresEyebrow);
    els.panelTitle.textContent = ui.spheresTitle;

    html += '<div class="tabs" role="tablist" aria-label="' + escapeHtml(ui.spheresTitle) + '">';
    ["s1", "s2", "s3"].forEach(function (key) {
      var selected = key === state.sphere;
      html +=
        '<button class="tab-btn" type="button" role="tab" aria-selected="' + String(selected) + '" data-sphere="' + key + '">' +
        escapeHtml(ui["tab" + key.toUpperCase()]) +
        "</button>";
    });
    html += "</div>";

    if (!state.sphere) {
      html += '<p class="section-note">' + escapeHtml(ui.sdefault) + "</p>";
    } else {
      ["s1", "s2", "s3"].forEach(function (key) {
        var item = data[key];
        var dimmed = key === state.sphere ? "" : ' style="opacity:.74"';
        html += '<article class="sphere-card sphere-section" id="sphere-section-' + key + '" style="border-left:4px solid ' + item.color + '"' + dimmed + ">";
        html += "<h3>" + escapeHtml(item.title) + "</h3>";
        item.secs.forEach(function (section) {
          html += '<div class="dimension">';
          html += "<strong style=\"color:" + item.color + "\">" + escapeHtml(section.l) + "</strong>";
          html += "<p>" + escapeHtml(section.t) + "</p>";
          html += "</div>";
        });
        html += '<div class="note-card" style="white-space:pre-line">';
        html += "<strong>" + escapeHtml(ui.rqLabel) + "</strong>";
        html += "<p>" + escapeHtml(item.rq) + "</p>";
        html += "</div>";
        html += "</article>";
      });
    }

    els.panelBody.innerHTML = html;

    var target = document.getElementById("sphere-section-" + state.sphere);
    if (state.scrollSphere && target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    state.scrollSphere = false;
  }

  function openPanel(name, targetSphere) {
    state.panel = name;
    if (targetSphere) {
      state.sphere = targetSphere;
    }
    state.scrollSphere = Boolean(targetSphere);
    els.panelShell.hidden = false;
    els.html.style.overflow = "hidden";
    centerPanel();
    if (name === "theory") {
      renderTheoryPanel();
    } else {
      renderSpheresPanel();
    }
  }

  function closePanel() {
    state.panel = null;
    els.panelShell.hidden = true;
    els.html.style.overflow = "";
  }

  function syncTheme() {
    var ui = getUI();
    els.html.setAttribute("data-theme", state.theme);
    els.themeBtn.textContent = state.theme === "light" ? ui.themeDark : ui.themeLight;
  }

  function renderStaticUI() {
    var ui = getUI();

    els.html.lang = ui.htmlLang;
    els.mainTitle.textContent = ui.mainTitle;
    els.subtitle.textContent = ui.subtitle;
    els.introText.textContent = ui.intro;
    setTextOrHide(els.heroSignature, ui.heroSignature);
    els.btnTheory.textContent = ui.btnTheory;
    els.btnSpheres.textContent = ui.btnSpheres;
    setTextOrHide(els.timelineKicker, ui.timelineKicker);
    els.timelineHeading.textContent = ui.tlTitle;
    els.tlDesc.textContent = ui.tlDesc;
    els.panelCloseBtn.textContent = ui.panelClose;
    els.langBtn.textContent = ui.languageButton;

    renderMeta();
    renderTimeline();
    syncTheme();

    if (state.panel === "theory") {
      renderTheoryPanel();
    }
    if (state.panel === "spheres") {
      renderSpheresPanel();
    }
  }

  function bindEvents() {
    document.addEventListener("click", function (event) {
      var panelTrigger = event.target.closest("[data-panel-open]");
      if (panelTrigger) {
        openPanel(panelTrigger.getAttribute("data-panel-open"));
        return;
      }

      var sphereOpenTrigger = event.target.closest("[data-sphere-open]");
      if (sphereOpenTrigger) {
        openPanel("spheres", sphereOpenTrigger.getAttribute("data-sphere-open"));
        return;
      }

      if (event.target.closest("[data-panel-close]")) {
        closePanel();
        return;
      }

      var phaseTrigger = event.target.closest("[data-phase]");
      if (phaseTrigger) {
        state.phase = Number(phaseTrigger.getAttribute("data-phase"));
        renderTimeline();
        return;
      }

      var sphereTrigger = event.target.closest("[data-sphere]");
      if (sphereTrigger) {
        state.sphere = sphereTrigger.getAttribute("data-sphere");
        state.scrollSphere = true;
        renderSpheresPanel();
        return;
      }

      var diagramTrigger = event.target.closest("[data-diag-box]");
      if (diagramTrigger) {
        var boxId = diagramTrigger.getAttribute("data-diag-box");
        var targetMap = { b1: "td1", b2: "td2", b3: "td3" };
        state.diagBox = boxId;
        renderTheoryPanel();
        requestAnimationFrame(function () {
          var target = document.getElementById(targetMap[boxId]);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
        return;
      }

      var dimensionTrigger = event.target.closest("[data-theory-dim]");
      if (dimensionTrigger) {
        var dimTargetMap = {
          relational: "theory-dim-relational",
          processual: "theory-dim-processual",
          cognitive: "theory-dim-cognitive"
        };
        var dimTarget = document.getElementById(dimTargetMap[dimensionTrigger.getAttribute("data-theory-dim")]);
        if (dimTarget) {
          dimTarget.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });

    els.langBtn.addEventListener("click", function () {
      state.lang = state.lang === "fr" ? "en" : "fr";
      renderStaticUI();
    });

    els.themeBtn.addEventListener("click", function () {
      state.theme = state.theme === "light" ? "dark" : "light";
      syncTheme();
    });

    els.detailPanel.querySelector(".panel__header").addEventListener("pointerdown", function (event) {
      if (event.target.closest("button")) {
        return;
      }

      var rect = els.detailPanel.getBoundingClientRect();
      panelDrag.active = true;
      panelDrag.pointerId = event.pointerId;
      panelDrag.startX = event.clientX;
      panelDrag.startY = event.clientY;
      panelDrag.originLeft = rect.left;
      panelDrag.originTop = rect.top;

      els.detailPanel.style.transform = "none";
      els.detailPanel.style.left = rect.left + "px";
      els.detailPanel.style.top = rect.top + "px";
      event.currentTarget.setPointerCapture(event.pointerId);
    });

    els.detailPanel.querySelector(".panel__header").addEventListener("pointermove", function (event) {
      var next;

      if (!panelDrag.active || event.pointerId !== panelDrag.pointerId) {
        return;
      }

      next = clampPanelPosition(
        panelDrag.originLeft + (event.clientX - panelDrag.startX),
        panelDrag.originTop + (event.clientY - panelDrag.startY)
      );

      els.detailPanel.style.left = next.left + "px";
      els.detailPanel.style.top = next.top + "px";
    });

    function stopPanelDrag(event) {
      if (!panelDrag.active || event.pointerId !== panelDrag.pointerId) {
        return;
      }
      panelDrag.active = false;
      panelDrag.pointerId = null;
    }

    els.detailPanel.querySelector(".panel__header").addEventListener("pointerup", stopPanelDrag);
    els.detailPanel.querySelector(".panel__header").addEventListener("pointercancel", stopPanelDrag);

    window.addEventListener("resize", function () {
      if (!state.panel) {
        return;
      }

      if (els.detailPanel.style.transform === "none") {
        var rect = els.detailPanel.getBoundingClientRect();
        var next = clampPanelPosition(rect.left, rect.top);
        els.detailPanel.style.left = next.left + "px";
        els.detailPanel.style.top = next.top + "px";
      } else {
        centerPanel();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && state.panel) {
        closePanel();
      }
    });
  }

  bindEvents();
  renderStaticUI();
}());
