(function () {
  var content = window.ARTEFACT_CONTENT;
  var state = {
    lang: document.documentElement.getAttribute("lang") || "en",
    theme: document.documentElement.getAttribute("data-theme") || "dark",
    activePhase: 0,
    activeSection: content.locales.en.nav && content.locales.en.nav.length ? content.locales.en.nav[0].id : "why"
  };

  var els = {
    html: document.documentElement,
    main: document.getElementById("main"),
    skipLink: document.querySelector(".skip-link"),
    mainTitle: document.getElementById("mainTitle"),
    subtitle: document.getElementById("subtitle"),
    langBtn: document.getElementById("langBtn"),
    themeBtn: document.getElementById("themeBtn"),
    sectionNav: document.getElementById("sectionNav"),
    heroSignature: document.getElementById("heroSignature"),
    why: document.getElementById("why"),
    illustration: document.getElementById("illustration"),
    theory: document.getElementById("theory"),
    spheres: document.getElementById("spheres")
  };

  function getContent() {
    return content.locales[state.lang] || content.locales.en;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderHero() {
    var locale = getContent();

    els.html.setAttribute("lang", state.lang);
    document.title = locale.ui.pageTitle;
    els.skipLink.textContent = locale.ui.skipLink;
    els.sectionNav.setAttribute("aria-label", locale.ui.navAria);
    els.langBtn.setAttribute("aria-label", locale.ui.languageButtonAria);
    els.themeBtn.setAttribute("aria-label", locale.ui.themeToggleAria);
    els.mainTitle.textContent = locale.hero.title;
    els.subtitle.textContent = locale.hero.subtitle;
    els.heroSignature.textContent = locale.hero.signature;
    syncLanguageButton();
    syncThemeButton();
  }

  function syncThemeButton() {
    var locale = getContent();

    els.html.setAttribute("data-theme", state.theme);
    els.themeBtn.textContent = state.theme === "dark" ? locale.theme.lightLabel : locale.theme.darkLabel;
  }

  function syncLanguageButton() {
    var locale = getContent();

    els.langBtn.textContent = locale.ui.languageButtonLabel;
  }

  function renderNav() {
    var locale = getContent();

    els.sectionNav.setAttribute("role", "tablist");
    els.sectionNav.innerHTML = locale.nav.map(function (item) {
      var isActive = item.id === state.activeSection;
      return (
        '<button class="nav-btn' + (isActive ? " is-active" : "") + '" type="button" id="tab-' + item.id + '" role="tab" aria-selected="' + String(isActive) + '" aria-controls="' + item.id + '" tabindex="' + (isActive ? "0" : "-1") + '" data-target="' + item.id + '">' +
        escapeHtml(item.label) +
        "</button>"
      );
    }).join("");
  }

  function renderWhyResearch() {
    var why = getContent().whyResearch;

    els.why.innerHTML =
      '<p class="section-kicker">' + escapeHtml(why.kicker) + "</p>" +
      '<div class="stack">' +
      '<h2 class="section-title">' + escapeHtml(why.titleLines[0]) + '<br>' + escapeHtml(why.titleLines[1]) + "</h2>" +
      '<div class="callout question-callout">' +
      '<p class="panel-label">' + escapeHtml(why.questionLabel) + "</p>" +
      "<p>" + why.questionHtml + "</p>" +
      "</div>" +
      '<div class="callout">' +
      '<p class="panel-label">' + escapeHtml(why.whyLabel) + "</p>" +
      "<p>" + why.whyHtml + "</p>" +
      "</div>" +
      '<div class="callout gap-callout">' +
      '<p class="panel-label">' + escapeHtml(why.gapLabel) + "</p>" +
      "<p>" + why.gapHtml + "</p>" +
      "</div>" +
      "</div>";
  }

  function buildPhaseDetail(phase) {
    return (
      '<div class="timeline-detail">' +
      '<div class="timeline-detail__top">' +
      '<span class="timeline-detail__week">' + escapeHtml(phase.week) + "</span>" +
      '<span class="timeline-detail__badge tone-' + escapeHtml(phase.tone) + '">' + escapeHtml(phase.badge) + "</span>" +
      "</div>" +
      '<h3 class="timeline-detail__title">' + escapeHtml(phase.title) + "</h3>" +
      '<p class="timeline-detail__body">' + escapeHtml(phase.body) + "</p>" +
      '<p class="timeline-detail__observable">' + escapeHtml(phase.observable) + "</p>" +
      "</div>"
    );
  }

  function renderIllustration() {
    var data = getContent().illustration;
    var active = data.phases[state.activePhase];

    els.illustration.innerHTML =
      '<p class="section-kicker">' + escapeHtml(data.kicker) + "</p>" +
      '<div class="timeline-shell">' +
      '<div class="timeline-head">' +
      '<h2 class="section-title">' + escapeHtml(data.title) + "</h2>" +
      '<p class="timeline-label">' + escapeHtml(data.subtitle) + "</p>" +
      '<p class="timeline-intro">' + escapeHtml(data.intro) + "</p>" +
      "</div>" +
      '<div class="timeline-chips" role="tablist" aria-label="' + escapeHtml(data.subtitle) + '">' +
      data.phases.map(function (phase, index) {
        var chipClasses = ["timeline-chip"];

        if (index === state.activePhase) {
          chipClasses.push("is-active");
        }
        if (index === 0) {
          chipClasses.push("is-first");
        }
        if (index === data.phases.length - 1) {
          chipClasses.push("is-last");
        }

        return (
          '<button class="' + chipClasses.join(" ") + '" type="button" data-phase="' + index + '" role="tab" aria-selected="' + String(index === state.activePhase) + '">' +
          '<span class="timeline-chip__week">' + escapeHtml(phase.week) + "</span>" +
          '<span class="timeline-chip__badge tone-' + escapeHtml(phase.tone) + '">' + escapeHtml(phase.badge) + "</span>" +
          '<span class="timeline-chip__title">' + escapeHtml(phase.title) + "</span>" +
          "</button>"
        );
      }).join("") +
      "</div>" +
      buildPhaseDetail(active) +
      "</div>";
  }

  function buildGapBlock() {
    var theory = getContent().theory;
    var paragraphs = theory.researchGapParagraphs || [];

    return (
      '<article class="theory-block gap-block">' +
      '<p class="panel-label">' + escapeHtml(theory.gapLabel) + "</p>" +
      '<div class="gap-block__text">' +
      paragraphs.map(function (paragraph) {
        return "<p>" + paragraph + "</p>";
      }).join("") +
      "</div>" +
      "</article>"
    );
  }

  function buildDimensionCards() {
    var theory = getContent().theory;

    return (
      '<div class="dimension-grid">' +
      theory.dimensionCards.map(function (item) {
        return (
          '<article class="dimension-card">' +
          '<span class="dimension-card__tag tone-' + escapeHtml(item.tone) + '">' + escapeHtml(item.label) + "</span>" +
          '<div class="dimension-card__letter">' + escapeHtml(item.letter) + "</div>" +
          '<p>' + escapeHtml(item.text) + "</p>" +
          "</article>"
        );
      }).join("") +
      "</div>"
    );
  }

  function buildMiniCards() {
    var theory = getContent().theory;

    return (
      '<div class="proposition-grid">' +
      theory.propositionMiniCards.map(function (item) {
        return (
          '<article class="theory-block">' +
          '<span class="proposition-card__badge tone-' + escapeHtml(item.tone) + '">' + escapeHtml(item.label) + "</span>" +
          '<p>' + escapeHtml(item.text) + "</p>" +
          "</article>"
        );
      }).join("") +
      "</div>"
    );
  }

  function buildRpcDiagram() {
    var theory = getContent().theory;
    var data = theory.rpcDiagram;

    return (
      '<article class="theory-block diagram-shell">' +
      '<p class="panel-label">' + escapeHtml(data.title) + "</p>" +
      '<p>' + escapeHtml(data.intro) + "</p>" +
      '<div class="diagram-sequence">' +
      '<div class="diagram-node">' +
      '<div class="diagram-node__head"><span class="diagram-node__dot diagram-node__dot--r">R</span><span class="diagram-node__title">' + escapeHtml(data.nodeLabels.relational) + "</span></div>" +
      '<p>' + escapeHtml(theory.dimensionCards[0].text) + "</p>" +
      "</div>" +
      '<div class="diagram-sequence__arrow">→</div>' +
      '<div class="diagram-node">' +
      '<div class="diagram-node__head"><span class="diagram-node__dot diagram-node__dot--p">P</span><span class="diagram-node__title">' + escapeHtml(data.nodeLabels.processual) + "</span></div>" +
      '<p>' + escapeHtml(theory.dimensionCards[1].text) + "</p>" +
      "</div>" +
      '<div class="diagram-sequence__arrow">→</div>' +
      '<div class="diagram-node">' +
      '<div class="diagram-node__head"><span class="diagram-node__dot diagram-node__dot--c">C</span><span class="diagram-node__title">' + escapeHtml(data.nodeLabels.cognitive) + "</span></div>" +
      '<p>' + escapeHtml(theory.dimensionCards[2].text) + "</p>" +
      "</div>" +
      "</div>" +
      '<div class="link-grid">' +
      data.links.map(function (item) {
        return (
          '<article class="link-card">' +
          '<h3 class="link-card__title">' + escapeHtml(item.label) + "</h3>" +
          '<div class="link-card__meta">' +
          '<div class="is-positive"><strong>' + escapeHtml(data.metaLabels.positive) + "</strong><p>" + escapeHtml(item.positive) + "</p></div>" +
          '<div class="is-negative"><strong>' + escapeHtml(data.metaLabels.negative) + "</strong><p>" + escapeHtml(item.negative) + "</p></div>" +
          '<div class="is-contingent"><strong>' + escapeHtml(data.metaLabels.contingency) + "</strong><p>" + escapeHtml(item.contingency) + "</p></div>" +
          "</div>" +
          "</article>"
        );
      }).join("") +
      "</div>" +
      '<p class="findings-note">' + escapeHtml(data.footer) + "</p>" +
      "</article>"
    );
  }

  function buildDetailCards() {
    var theory = getContent().theory;

    return (
      '<div class="detail-stack">' +
      theory.propositionDetails.filter(function (item) {
        return item.tone !== "managerial";
      }).map(function (item) {
        return (
          '<article class="theory-block">' +
          '<span class="proposition-card__badge tone-' + escapeHtml(item.tone) + '">' + escapeHtml(item.badge) + "</span>" +
          '<h3 class="sphere-card__title">' + escapeHtml(item.title) + "</h3>" +
          '<p>' + escapeHtml(item.text) + "</p>" +
          "</article>"
        );
      }).join("") +
      "</div>"
    );
  }

  function buildManagerialCard() {
    var theory = getContent().theory;
    var item = theory.propositionDetails.find(function (detail) {
      return detail.tone === "managerial";
    });

    if (!item) {
      return "";
    }

    return (
      '<article class="theory-block managerial-block">' +
      '<span class="proposition-card__badge tone-' + escapeHtml(item.tone) + '">' + escapeHtml(item.badge) + "</span>" +
      '<h3 class="sphere-card__title">' + escapeHtml(item.title) + "</h3>" +
      '<p>' + escapeHtml(item.text) + "</p>" +
      "</article>"
    );
  }

  function buildObservationCard() {
    var obs = getContent().theory.observationalFramework;

    return (
      '<article class="theory-block observational-card">' +
      '<p class="panel-label">' + escapeHtml(obs.label) + "</p>" +
      '<p>' + escapeHtml(obs.text) + "</p>" +
      '<div class="chip-row">' +
      obs.chips.map(function (chip) {
        return '<span class="chip chip--' + escapeHtml(chip.tone) + '">' + escapeHtml(chip.text) + "</span>";
      }).join("") +
      "</div>" +
      "</article>"
    );
  }

  function buildPromptCard() {
    var prompt = getContent().theory.practitionerPrompt;

    return (
      '<article class="prompt-card">' +
      '<p class="panel-label">' + escapeHtml(prompt.label) + "</p>" +
      '<p>' + prompt.text + "</p>" +
      "</article>"
    );
  }

  function renderTheory() {
    var theory = getContent().theory;

    els.theory.innerHTML =
      '<p class="section-kicker">' + escapeHtml(theory.kicker) + "</p>" +
      '<div class="stack">' +
      '<p class="lede">' + theory.introHtml + "</p>" +
      buildGapBlock() +
      '<div class="theory-section">' +
      '<p class="panel-label">' + escapeHtml(theory.propositionsLabel) + "</p>" +
      buildDetailCards() +
      "</div>" +
      '<div class="theory-section">' +
      '<p class="panel-label">' + escapeHtml(theory.modelLabel) + "</p>" +
      buildDimensionCards() +
      '<div class="theory-block">' +
      '<div class="sequence-row">' + theory.sequenceHtml + "</div>" +
      "</div>" +
      buildRpcDiagram() +
      "</div>" +
      buildObservationCard() +
      buildManagerialCard() +
      buildPromptCard() +
      '<p class="findings-note">' + escapeHtml(theory.findingsNote) + "</p>" +
      "</div>";
  }

  function buildSphereModel() {
    var labels = getContent().spheres.diagramLabels;

    return (
      '<div class="sphere-figure">' +
      '<div class="sphere-figure__canvas">' +
      '<svg viewBox="0 0 980 760" role="img" aria-label="' + escapeHtml(labels.title) + '">' +
      "<defs>" +
      '<radialGradient id="aiBall" cx="30%" cy="30%"><stop offset="0%" stop-color="#b784ff"></stop><stop offset="100%" stop-color="#8a5cf6"></stop></radialGradient>' +
      '<radialGradient id="coBall" cx="30%" cy="30%"><stop offset="0%" stop-color="#ff77bb"></stop><stop offset="100%" stop-color="#e53e96"></stop></radialGradient>' +
      '<radialGradient id="clBall" cx="30%" cy="30%"><stop offset="0%" stop-color="#5fd8ff"></stop><stop offset="100%" stop-color="#18add0"></stop></radialGradient>' +
      "</defs>" +
      '<text x="490" y="28" text-anchor="middle" font-size="22" font-weight="700" fill="var(--text)" font-family="IBM Plex Sans">' + escapeHtml(labels.title) + "</text>" +
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
      '<text x="490" y="89" text-anchor="middle" font-size="21" font-weight="700" fill="#ffffff" font-family="IBM Plex Sans">' + escapeHtml(labels.ai) + "</text>" +
      '<text x="286" y="247" text-anchor="middle" font-size="19" font-weight="700" fill="#ffffff" font-family="IBM Plex Sans">' + escapeHtml(labels.ai) + "</text>" +
      '<text x="694" y="247" text-anchor="middle" font-size="19" font-weight="700" fill="#ffffff" font-family="IBM Plex Sans">' + escapeHtml(labels.ai) + "</text>" +
      '<text x="440" y="280" text-anchor="middle" font-size="23" font-weight="700" fill="#ffffff" font-family="IBM Plex Sans">CO</text>' +
      '<text x="540" y="280" text-anchor="middle" font-size="23" font-weight="700" fill="#ffffff" font-family="IBM Plex Sans">CL</text>' +
      '<g class="sphere-label" data-sphere-target="s1" role="button" aria-label="' + escapeHtml(labels.s1) + '">' +
      '<rect x="420" y="326" width="140" height="54" rx="27" fill="var(--bg)" stroke="#e18a00"></rect>' +
      '<text x="490" y="353" fill="#e18a00">S1</text>' +
      "</g>" +
      '<g class="sphere-label" data-sphere-target="s2" role="button" aria-label="' + escapeHtml(labels.s2) + '">' +
      '<rect x="420" y="393" width="140" height="54" rx="27" fill="var(--bg)" stroke="#8a5cf6"></rect>' +
      '<text x="490" y="420" fill="#8a5cf6">S2</text>' +
      "</g>" +
      '<g class="sphere-label" data-sphere-target="s3" role="button" aria-label="' + escapeHtml(labels.s3) + '">' +
      '<rect x="420" y="468" width="140" height="54" rx="27" fill="var(--bg)" stroke="#14b87d"></rect>' +
      '<text x="490" y="495" fill="#14b87d">S3</text>' +
      "</g>" +
      '<circle cx="250" cy="620" r="8" fill="#e53e96"></circle>' +
      '<text x="266" y="626" font-size="18" fill="var(--text-soft)" font-family="IBM Plex Sans">' + escapeHtml(labels.consultant) + "</text>" +
      '<circle cx="455" cy="620" r="8" fill="#18add0"></circle>' +
      '<text x="471" y="626" font-size="18" fill="var(--text-soft)" font-family="IBM Plex Sans">' + escapeHtml(labels.client) + "</text>" +
      '<circle cx="650" cy="620" r="8" fill="#8a5cf6"></circle>' +
      '<text x="666" y="626" font-size="18" fill="var(--text-soft)" font-family="IBM Plex Sans">' + escapeHtml(labels.ai) + "</text>" +
      "</svg>" +
      "</div>" +
      '<div class="sphere-scroll-row">' +
      '<button class="sphere-scroll-btn tone-s1" type="button" data-sphere-target="s1">' + escapeHtml(labels.s1) + "</button>" +
      '<button class="sphere-scroll-btn tone-s2" type="button" data-sphere-target="s2">' + escapeHtml(labels.s2) + "</button>" +
      '<button class="sphere-scroll-btn tone-s3" type="button" data-sphere-target="s3">' + escapeHtml(labels.s3) + "</button>" +
      "</div>" +
      "</div>"
    );
  }

  function renderSpheres() {
    var spheres = getContent().spheres;

    els.spheres.innerHTML =
      '<p class="section-kicker">' + escapeHtml(spheres.kicker) + "</p>" +
      '<div class="stack">' +
      '<div class="timeline-head">' +
      '<h2 class="section-title">' + escapeHtml(spheres.title) + "</h2>" +
      '<p class="section-subtitle">' + escapeHtml(spheres.intro) + "</p>" +
      "</div>" +
      '<div class="sphere-shell">' +
      buildSphereModel() +
      '<div class="sphere-cards">' +
      spheres.cards.map(function (item) {
        return (
          '<article class="sphere-card sphere-card--' + escapeHtml(item.key) + '" id="sphere-' + escapeHtml(item.key) + '">' +
          '<h2 class="sphere-card__title">' + escapeHtml(item.title) + "</h2>" +
          '<p>' + escapeHtml(item.text) + "</p>" +
          "</article>"
        );
      }).join("") +
      "</div>" +
      "</div>" +
      "</div>";
  }

  function setActiveNav(id) {
    Array.prototype.forEach.call(els.sectionNav.querySelectorAll(".nav-btn"), function (button) {
      var isActive = button.getAttribute("data-target") === id;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  }

  function updateSectionVisibility() {
    getContent().nav.forEach(function (item) {
      var section = document.getElementById(item.id);
      var isActive = item.id === state.activeSection;

      if (!section) {
        return;
      }

      section.hidden = !isActive;
      section.setAttribute("role", "tabpanel");
      section.setAttribute("aria-labelledby", "tab-" + item.id);
      section.setAttribute("aria-hidden", String(!isActive));
    });

    setActiveNav(state.activeSection);
  }

  function activateSection(id, shouldScroll) {
    if (!document.getElementById(id)) {
      return;
    }

    state.activeSection = id;
    updateSectionVisibility();

    if (shouldScroll) {
      els.main.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function bindEvents() {
    els.langBtn.addEventListener("click", function () {
      state.lang = state.lang === "en" ? "fr" : "en";
      renderApp();
    });

    els.themeBtn.addEventListener("click", function () {
      state.theme = state.theme === "dark" ? "light" : "dark";
      syncThemeButton();
    });

    els.sectionNav.addEventListener("click", function (event) {
      var button = event.target.closest("[data-target]");
      if (!button) {
        return;
      }

      activateSection(button.getAttribute("data-target"), true);
    });

    els.sectionNav.addEventListener("keydown", function (event) {
      var buttons = Array.prototype.slice.call(els.sectionNav.querySelectorAll(".nav-btn"));
      var currentIndex = buttons.findIndex(function (button) {
        return button.getAttribute("data-target") === state.activeSection;
      });
      var nextIndex = currentIndex;

      if (event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % buttons.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = buttons.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      buttons[nextIndex].focus();
      activateSection(buttons[nextIndex].getAttribute("data-target"), false);
    });

    document.addEventListener("click", function (event) {
      var phaseButton = event.target.closest("[data-phase]");
      if (phaseButton) {
        state.activePhase = Number(phaseButton.getAttribute("data-phase"));
        renderIllustration();
        return;
      }

      var sphereTarget = event.target.closest("[data-sphere-target]");
      if (sphereTarget) {
        var target = document.getElementById("sphere-" + sphereTarget.getAttribute("data-sphere-target"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  }

  function renderApp() {
    renderHero();
    renderNav();
    renderWhyResearch();
    renderTheory();
    renderSpheres();
    renderIllustration();
    updateSectionVisibility();
  }

  function init() {
    renderApp();
    bindEvents();
  }

  init();
})();
