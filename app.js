(function () {
  var content = window.ARTEFACT_CONTENT;
  var state = {
    lang: document.documentElement.getAttribute("lang") || "en",
    theme: document.documentElement.getAttribute("data-theme") || "light",
    activePhase: 0,
    activeSection: content.locales.en.nav && content.locales.en.nav.length ? content.locales.en.nav[0].id : "why",
    chatSourceSection: content.locales.en.nav && content.locales.en.nav.length ? content.locales.en.nav[0].id : "why",
    chatOpen: false,
    chatHistories: {},
    chatPending: {},
    chatDocuments: {},
    chatUploadStatuses: {},
    blockPages: {}
  };

  var CHAT_DOCUMENT_LIMIT = 3;
  var CHAT_DOCUMENT_MAX_CHARS = 12000;
  var CHAT_DOCUMENT_TOTAL_MAX_CHARS = 24000;
  var CHAT_DOCUMENT_ACCEPT = ".txt,.md,.markdown,.csv,.json,.html,.htm,.xml,.yml,.yaml";

  var els = {
    html: document.documentElement,
    main: document.getElementById("main"),
    skipLink: document.querySelector(".skip-link"),
    mainTitle: document.getElementById("mainTitle"),
    subtitle: document.getElementById("subtitle"),
    downloadDocLink: document.getElementById("downloadDocLink"),
    langBtn: document.getElementById("langBtn"),
    themeBtn: document.getElementById("themeBtn"),
    floatingChatBtn: document.getElementById("floatingChatBtn"),
    chatbotHost: document.getElementById("chatbotHost"),
    sectionNav: document.getElementById("sectionNav"),
    heroSignature: document.getElementById("heroSignature"),
    why: document.getElementById("why"),
    bibliography: document.getElementById("bibliography"),
    illustration: document.getElementById("illustration"),
    theory: document.getElementById("theory"),
    propositions: document.getElementById("propositions"),
    spheres: document.getElementById("spheres")
  };

  function getContent() {
    return content.locales[state.lang] || content.locales.en;
  }

  function getPropositionContent() {
    var locale = getContent();
    return locale.propositions || locale.theory || {};
  }

  function getSectionLabel(sectionId) {
    var nav = getContent().nav || [];
    var i;

    for (i = 0; i < nav.length; i += 1) {
      if (nav[i].id === sectionId) {
        return nav[i].label;
      }
    }

    return sectionId || "";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function stripHtml(value) {
    return String(value || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function renderTextParagraphs(value) {
    return String(value || "")
      .split(/(?:<br\s*\/?>\s*){2,}|\n{2,}/i)
      .map(function (paragraph) {
        return paragraph
          .replace(/<br\s*\/?>/gi, " ")
          .replace(/\s+/g, " ")
          .trim();
      })
      .filter(Boolean)
      .map(function (paragraph) {
        return "<p>" + escapeHtml(paragraph) + "</p>";
      })
      .join("");
  }

  function splitHtmlParagraphs(value) {
    return String(value || "")
      .split(/(?:<br\s*\/?>\s*){2,}|\n{2,}/i)
      .map(function (paragraph) {
        return String(paragraph || "").trim();
      })
      .filter(Boolean);
  }

  function splitTextParagraphs(value) {
    return String(value || "")
      .split(/\n{2,}/)
      .map(function (paragraph) {
        return String(paragraph || "")
          .replace(/\n/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      })
      .filter(Boolean);
  }

  function renderPlainParagraphs(paragraphs) {
    return (paragraphs || []).map(function (paragraph) {
      return "<p>" + escapeHtml(paragraph) + "</p>";
    }).join("");
  }

  function getBlockPageIndex(key, total) {
    var current = Number(state.blockPages[key] || 0);

    if (current < 0) {
      current = 0;
    }

    if (current >= total) {
      current = Math.max(0, total - 1);
    }

    state.blockPages[key] = current;
    return current;
  }

  function groupParagraphs(paragraphs, pageSize) {
    var groups = [];
    var size = Math.max(1, Number(pageSize) || 1);
    var i;

    for (i = 0; i < paragraphs.length; i += size) {
      groups.push(paragraphs.slice(i, i + size));
    }

    return groups;
  }

  function buildPager(key, total, current) {
    var ui = getContent().ui || {};

    if (total <= 1) {
      return "";
    }

    return (
      '<div class="block-pager">' +
      '<button class="block-pager__btn" type="button" data-page-key="' + escapeHtml(key) + '" data-page-dir="-1"' + (current <= 0 ? " disabled" : "") + ' aria-label="' + escapeHtml(ui.pagePreviousAria || "Previous page") + '">' +
      escapeHtml(ui.pagePrevious || "Prev") +
      "</button>" +
      '<span class="block-pager__status">' + escapeHtml(String(current + 1) + " / " + String(total)) + "</span>" +
      '<button class="block-pager__btn" type="button" data-page-key="' + escapeHtml(key) + '" data-page-dir="1"' + (current >= total - 1 ? " disabled" : "") + ' aria-label="' + escapeHtml(ui.pageNextAria || "Next page") + '">' +
      escapeHtml(ui.pageNext || "Next") +
      "</button>" +
      "</div>"
    );
  }

  function buildPagedHtmlBody(html, key, pageSize) {
    var paragraphs = splitHtmlParagraphs(html);
    var pages = groupParagraphs(paragraphs, pageSize);
    var current = getBlockPageIndex(key, pages.length || 1);

    if (!pages.length) {
      return "";
    }

    return (
      '<div class="paged-copy">' +
      '<div class="paged-copy__body">' +
      pages[current].map(function (paragraph) {
        return "<p>" + paragraph + "</p>";
      }).join("") +
      "</div>" +
      buildPager(key, pages.length, current) +
      "</div>"
    );
  }

  function buildPagedTextBody(text, key, pageSize) {
    var paragraphs = splitTextParagraphs(text);
    var pages = groupParagraphs(paragraphs, pageSize);
    var current = getBlockPageIndex(key, pages.length || 1);

    if (!pages.length) {
      return "";
    }

    return (
      '<div class="paged-copy">' +
      '<div class="paged-copy__body">' + renderPlainParagraphs(pages[current]) + "</div>" +
      buildPager(key, pages.length, current) +
      "</div>"
    );
  }

  function buildPagedReferenceList(entries, key, pageSize) {
    var pages = groupParagraphs(entries || [], pageSize);
    var current = getBlockPageIndex(key, pages.length || 1);
    var startIndex;

    if (!pages.length) {
      return "";
    }

    startIndex = current * pageSize + 1;

    return (
      '<div class="paged-copy">' +
      '<ol class="bibliography-list" start="' + escapeHtml(String(startIndex)) + '">' +
      pages[current].map(function (entry) {
        return '<li class="bibliography-list__item">' + escapeHtml(entry) + "</li>";
      }).join("") +
      "</ol>" +
      buildPager(key, pages.length, current) +
      "</div>"
    );
  }

  function buildPanelLabel(label) {
    if (!label) {
      return "";
    }

    return '<p class="panel-label">' + escapeHtml(label) + "</p>";
  }

  function getDocumentFilename() {
    return "DOCUMENT_COMPLEMENTAIRE_CONTENU_FR.docx";
  }

  function syncDownloadLink() {
    var locale = getContent();
    var filename = getDocumentFilename();

    els.downloadDocLink.textContent = locale.ui.downloadDocLabel;
    els.downloadDocLink.setAttribute("aria-label", locale.ui.downloadDocAria);
    els.downloadDocLink.setAttribute("title", locale.ui.downloadDocAria);
    els.downloadDocLink.href = "./docs/" + filename;
    els.downloadDocLink.setAttribute("download", filename);
  }

  function renderHero() {
    var locale = getContent();

    els.html.setAttribute("lang", state.lang);
    document.title = locale.ui.pageTitle;
    els.skipLink.textContent = locale.ui.skipLink;
    els.sectionNav.setAttribute("aria-label", locale.ui.navAria);
    syncDownloadLink();
    els.langBtn.setAttribute("aria-label", locale.ui.languageButtonAria);
    els.themeBtn.setAttribute("aria-label", locale.ui.themeToggleAria);
    els.mainTitle.textContent = locale.hero.title;
    els.subtitle.textContent = locale.hero.subtitle;
    els.heroSignature.textContent = locale.hero.signature;
    if (els.floatingChatBtn) {
      els.floatingChatBtn.setAttribute("aria-label", (locale.illustration.chatbot || {}).title || "Open framework AI assistant");
      els.floatingChatBtn.setAttribute("title", (locale.illustration.chatbot || {}).title || "Open framework AI assistant");
    }
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
      buildPanelLabel(why.questionLabel) +
      buildPagedHtmlBody(why.questionHtml, "why-question:" + state.lang, 3) +
      "</div>" +
      '<div class="callout">' +
      buildPanelLabel(why.whyLabel) +
      buildPagedHtmlBody(why.whyHtml, "why-why:" + state.lang, 3) +
      "</div>" +
      '<div class="callout gap-callout">' +
      buildPanelLabel(why.gapLabel) +
      buildPagedHtmlBody(why.gapHtml, "why-gap:" + state.lang, 3) +
      "</div>" +
      "</div>";
  }

  function findIllustrationStage(data, stageId) {
    var stages = data.stages || [];
    var i;

    for (i = 0; i < stages.length; i += 1) {
      if (stages[i].id === stageId) {
        return stages[i];
      }
    }

    return null;
  }

  function buildMissionProcessStep(stage, isActive, extraClass) {
    var processClasses = ["mission-process__step"];

    if (extraClass) {
      processClasses.push(extraClass);
    }

    if (isActive) {
      processClasses.push("is-active");
    }

    return (
      '<div class="' + processClasses.join(" ") + '" aria-hidden="true">' +
      '<span class="mission-process__copy">' +
      '<span class="mission-process__heading">' +
      '<span class="mission-process__index">' + escapeHtml(stage.index) + ".</span>" +
      '<span class="mission-process__title">' + escapeHtml(stage.title) + "</span>" +
      "</span>" +
      '<span class="mission-process__span">' + escapeHtml(stage.span) + "</span>" +
      "</span>" +
      "</div>"
    );
  }

  function buildPhaseDetail(phase, stageLabel) {
    var detailLabels = getContent().illustration.detailLabels || {};
    var titleWithWeek = phase.week
      ? phase.title + " - " + phase.week
      : phase.title;

    return (
      '<div class="timeline-detail">' +
      '<div class="timeline-detail__top">' +
      (stageLabel
        ? '<span class="timeline-detail__stage">' + escapeHtml(stageLabel) + "</span>"
        : "") +
      "</div>" +
      '<h3 class="timeline-detail__title">' + escapeHtml(titleWithWeek) + "</h3>" +
      '<div class="timeline-detail__meta">' +
      '<div class="timeline-detail__meta-row">' +
      '<span class="timeline-detail__label">' + escapeHtml(detailLabels.situation || "") + "</span>" +
      '<div class="timeline-detail__value">' +
      buildSituationBadge(phase.badge, phase.tone, true) +
      "</div>" +
      "</div>" +
      '<div class="timeline-detail__meta-row">' +
      '<span class="timeline-detail__label">' + escapeHtml(detailLabels.propositions || "") + "</span>" +
      '<div class="timeline-detail__value">' +
      buildPropositionPills(phase.propositions, "timeline-detail__props", true) +
      "</div>" +
      "</div>" +
      '<div class="timeline-detail__meta-row">' +
      '<span class="timeline-detail__label">' + escapeHtml(detailLabels.dimensions || "") + "</span>" +
      '<div class="timeline-detail__value">' +
      buildDimensionPills(phase.dimensions, true) +
      "</div>" +
      "</div>" +
      "</div>" +
      '<p class="timeline-detail__body">' + escapeHtml(phase.body) + "</p>" +
      '<p class="timeline-detail__observable">' + escapeHtml(phase.observable) + "</p>" +
      "</div>"
    );
  }

  function buildPropositionPills(items, className) {
    var glossary = ((getContent().illustration || {}).glossary || {}).propositions || {};

    if (!items || !items.length) {
      return "";
    }

    return (
      '<span class="' + className + '">' +
      items.map(function (item) {
        return buildExplainableToken("timeline-prop", item, glossary[item]);
      }).join("") +
      "</span>"
    );
  }

  function buildDimensionPills(items) {
    var glossary = ((getContent().illustration || {}).glossary || {}).dimensions || {};

    if (!items || !items.length) {
      return "";
    }

    return (
      '<span class="timeline-dimensions">' +
      items.map(function (item) {
        var key = String(item).toLowerCase();
        return buildExplainableToken("timeline-dimension timeline-dimension--" + key, item, glossary[item]);
      }).join("") +
      "</span>"
    );
  }

  function buildSituationBadge(label, tone, isDetail) {
    var glossary = ((getContent().illustration || {}).glossary || {}).situations || {};
    var classes = isDetail
      ? "timeline-detail__badge tone-" + tone
      : "timeline-chip__badge tone-" + tone;

    return buildExplainableToken(classes, label, glossary[label]);
  }

  function buildExplainableToken(className, label, definition) {
    var attrs = "";

    if (definition) {
      attrs += ' title="' + escapeHtml(definition) + '"';
      attrs += ' aria-label="' + escapeHtml(label + ". " + definition) + '"';
      attrs += ' class="' + escapeHtml(className) + ' is-explainable"';
    } else {
      attrs += ' class="' + escapeHtml(className) + '"';
    }

    return '<span' + attrs + '>' + escapeHtml(label) + "</span>";
  }

  function getChatContextSectionId() {
    return state.chatSourceSection || state.activeSection || "illustration";
  }

  function getChatHistoryKey() {
    var sectionId = getChatContextSectionId();
    var phaseSuffix = sectionId === "illustration" ? ":" + String(state.activePhase) : "";

    return state.lang + ":" + sectionId + phaseSuffix;
  }

  function getChatHistory() {
    return state.chatHistories[getChatHistoryKey()] || [];
  }

  function isChatPending() {
    return Boolean(state.chatPending[getChatHistoryKey()]);
  }

  function getChatDocuments() {
    return state.chatDocuments[getChatHistoryKey()] || [];
  }

  function setChatDocuments(documents) {
    state.chatDocuments[getChatHistoryKey()] = documents || [];
  }

  function getChatUploadStatus() {
    return state.chatUploadStatuses[getChatHistoryKey()] || "";
  }

  function setChatUploadStatus(message) {
    state.chatUploadStatuses[getChatHistoryKey()] = message || "";
  }

  function getChatExtension(filename) {
    var match = String(filename || "").toLowerCase().match(/(\.[a-z0-9]+)$/);
    return match ? match[1] : "";
  }

  function isSupportedChatDocument(file) {
    return CHAT_DOCUMENT_ACCEPT.split(",").indexOf(getChatExtension(file && file.name)) !== -1;
  }

  function normalizeChatDocumentText(text) {
    return String(text || "")
      .replace(/\u0000/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();
  }

  function formatChatDocumentSize(chars) {
    return String(Math.max(1, Math.round(Number(chars || 0) / 1000))) + "k";
  }

  function buildChatDocumentChip(documentItem, index, chat) {
    var aria = (chat.uploadRemove || "") + " " + (documentItem.name || "");

    return (
      '<li class="chatbot-upload__doc">' +
      '<span class="chatbot-upload__doc-meta">' +
      '<span class="chatbot-upload__doc-name">' + escapeHtml(documentItem.name || "") + "</span>" +
      '<span class="chatbot-upload__doc-size">' + escapeHtml(formatChatDocumentSize(documentItem.charCount)) + "</span>" +
      "</span>" +
      '<button class="chatbot-upload__doc-remove" type="button" data-chat-doc-remove="' + index + '" aria-label="' + escapeHtml(aria) + '">' +
      escapeHtml(chat.uploadRemove || "") +
      "</button>" +
      "</li>"
    );
  }

  function getChatRoleLabel(role) {
    if (role === "assistant") {
      return "AI";
    }

    return state.lang === "fr" ? "Vous" : "You";
  }

  function formatMessageText(text) {
    return String(text || "")
      .split(/\n{2,}/)
      .map(function (paragraph) {
        return "<p>" + escapeHtml(paragraph).replace(/\n/g, "<br>") + "</p>";
      })
      .join("");
  }

  function buildChatMessage(message) {
    var roleClass = message.role === "user" ? "chatbot-message--user" : "chatbot-message--assistant";
    var pendingClass = message.pending ? " chatbot-message--pending" : "";
    var roleLabel = message.role === "user" ? getChatRoleLabel(message.role) : "";
    var roleHtml = roleLabel
      ? '<div class="chatbot-message__role">' + escapeHtml(roleLabel) + "</div>"
      : "";

    return (
      '<article class="chatbot-message ' + roleClass + pendingClass + '">' +
      roleHtml +
      '<div class="chatbot-message__bubble">' + formatMessageText(message.text) + "</div>" +
      "</article>"
    );
  }

  function buildActivePageContext(sectionId) {
    var locale = getContent();
    var why = locale.whyResearch || {};
    var theory = locale.theory || {};
    var propositions = locale.propositions || theory;
    var spheres = locale.spheres || {};
    var illustration = locale.illustration || {};

    if (sectionId === "why") {
      return {
        id: "why",
        label: getSectionLabel("why"),
        role: "research positioning and practitioner relevance",
        title: (why.titleLines || []).join(" "),
        excerpts: {
          question: stripHtml(why.questionHtml || ""),
          whyItMatters: stripHtml(why.whyHtml || ""),
          researchGap: stripHtml(why.gapHtml || "")
        }
      };
    }

    if (sectionId === "theory") {
      return {
        id: "theory",
        label: getSectionLabel("theory"),
        role: "theoretical framework",
        title: theory.title || "",
        excerpts: {
          overview: (theory.overviewBlocks || []).map(function (item) {
            return {
              label: item.label,
              text: item.text
            };
          })
        }
      };
    }

    if (sectionId === "propositions") {
      return {
        id: "propositions",
        label: getSectionLabel("propositions"),
        role: "propositional framework",
        title: propositions.title || "",
        excerpts: {
          intro: stripHtml(propositions.introHtml || ""),
          researchGap: (propositions.researchGapParagraphs || []).join(" "),
          propositions: (propositions.propositionDetails || []).map(function (item) {
            return {
              badge: item.badge,
              title: item.title,
              text: item.text
            };
          }),
          model: (propositions.rpcDiagram || {}).intro || ""
        }
      };
    }

    if (sectionId === "spheres") {
      return {
        id: "spheres",
        label: getSectionLabel("spheres"),
        role: "S1/S2/S3 observational framework",
        title: spheres.title || "",
        intro: spheres.intro || "",
        cards: (spheres.cards || []).map(function (item) {
          return {
            title: item.title,
            text: item.text
          };
        })
      };
    }

    if (sectionId === "bibliography") {
      return {
        id: "bibliography",
        label: getSectionLabel("bibliography"),
        role: "bibliography and cited references",
        title: (locale.bibliography || {}).title || "",
        intro: (locale.bibliography || {}).intro || "",
        entries: ((locale.bibliography || {}).entries || []).slice(0, 12)
      };
    }

    return {
      id: "illustration",
      label: getSectionLabel("illustration"),
      role: "fictional mission illustration and active sub-step",
      title: illustration.title || "",
      intro: illustration.intro || ""
    };
  }

  function buildChatbotFrameworkBundle(data, active, activeStage, activeStageLabel) {
    var theory = getContent().theory;
    var propositions = getPropositionContent();
    var glossary = data.glossary || {};
    var sourceSectionId = getChatContextSectionId();
    var currentContext = null;

    if (sourceSectionId === "illustration") {
      currentContext = {
        stage: activeStageLabel,
        stageId: active.stage,
        stageSummary: activeStage ? activeStage.summary : "",
        substep: active.title,
        week: active.week,
        situation: {
          code: active.badge,
          definition: ((glossary.situations || {})[active.badge]) || ""
        },
        propositions: (active.propositions || []).map(function (item) {
          return {
            code: item,
            definition: ((glossary.propositions || {})[item]) || ""
          };
        }),
        dimensions: (active.dimensions || []).map(function (item) {
          return {
            code: item,
            definition: ((glossary.dimensions || {})[item]) || ""
          };
        }),
        body: active.body,
        observable: active.observable
      };
    }

    return {
      language: state.lang,
      activePage: buildActivePageContext(sourceSectionId),
      current: currentContext,
      illustration: {
        stages: (data.stages || []).map(function (stage) {
          return {
            id: stage.id,
            index: stage.index,
            title: stage.title,
            span: stage.span,
            summary: stage.summary
          };
        }),
        postMission: data.postMission || {},
        phases: (data.phases || []).map(function (phase) {
          var phaseStage = findIllustrationStage(data, phase.stage);
          return {
            stage: phaseStage ? phaseStage.title : (data.postMission && data.postMission.label) || "",
            stageId: phase.stage,
            title: phase.title,
            week: phase.week,
            situation: {
              code: phase.badge,
              definition: ((glossary.situations || {})[phase.badge]) || ""
            },
            propositions: (phase.propositions || []).map(function (item) {
              return {
                code: item,
                definition: ((glossary.propositions || {})[item]) || ""
              };
            }),
            dimensions: (phase.dimensions || []).map(function (item) {
              return {
                code: item,
                definition: ((glossary.dimensions || {})[item]) || ""
              };
            }),
            body: phase.body,
            observable: phase.observable
          };
        })
      },
      theory: {
        intro: stripHtml(theory.introHtml),
        overview: (theory.overviewBlocks || []).map(function (item) {
          return {
            label: item.label,
            text: item.text
          };
        }),
        propositions: (propositions.propositionDetails || []).map(function (item) {
          return {
            badge: item.badge,
            title: item.title,
            text: item.text
          };
        }),
        observationalFramework: {
          text: (theory.observationalFramework || {}).text || "",
          chips: ((theory.observationalFramework || {}).chips || []).map(function (chip) {
            return chip.text;
          })
        },
        model: {
          intro: (propositions.rpcDiagram || {}).intro || "",
          links: ((propositions.rpcDiagram || {}).links || []).map(function (item) {
            return {
              label: item.label,
              positive: item.positive,
              negative: item.negative,
              contingency: item.contingency
            };
          })
        }
      }
    };
  }

  function buildChatbotPanel(data, active, activeStageLabel, activeStage) {
    var chat = data.chatbot || {};
    var history = getChatHistory();
    var documents = getChatDocuments();
    var uploadStatus = getChatUploadStatus();
    var pending = isChatPending();
    var messagesHtml = history.length
      ? history.map(buildChatMessage).join("")
      : "";
    var suggestions = chat.suggestions || [];

    if (pending) {
      messagesHtml += buildChatMessage({
        role: "assistant",
        text: chat.thinking || "",
        pending: true
      });
    }

    return (
      '<aside class="chatbot-panel">' +
      '<div class="chatbot-panel__head">' +
      '<span class="chatbot-panel__icon" aria-hidden="true">AI</span>' +
      '<div class="chatbot-panel__copy">' +
      '<h3 class="chatbot-panel__title">' + escapeHtml(chat.title || "") + "</h3>" +
      '<p class="chatbot-panel__note">' + escapeHtml(chat.note || "") + "</p>" +
      "</div>" +
      "</div>" +
      '<div class="chatbot-suggestions">' +
      '<p class="chatbot-suggestions__label">' + escapeHtml(chat.suggestionsLabel || "") + "</p>" +
      '<div class="chatbot-suggestions__list">' +
      suggestions.map(function (question) {
        return '<button class="chatbot-suggestion" type="button" data-chat-suggestion="' + escapeHtml(question) + '"' + (pending ? " disabled" : "") + '>' + escapeHtml(question) + "</button>";
      }).join("") +
      "</div>" +
      "</div>" +
      '<div class="chatbot-upload">' +
      '<div class="chatbot-upload__head">' +
      '<p class="chatbot-suggestions__label">' + escapeHtml(chat.uploadLabel || "") + "</p>" +
      '<label class="chatbot-upload__button"' + (pending ? ' aria-disabled="true"' : "") + '>' +
      escapeHtml(chat.uploadButton || "") +
      '<input class="chatbot-upload__input" type="file" accept="' + CHAT_DOCUMENT_ACCEPT + '" multiple' + (pending ? " disabled" : "") + ">" +
      "</label>" +
      "</div>" +
      '<p class="chatbot-upload__hint">' + escapeHtml(chat.uploadHint || "") + "</p>" +
      (documents.length
        ? '<div class="chatbot-upload__loaded">' +
          '<p class="chatbot-upload__loaded-label">' + escapeHtml(chat.uploadLoadedLabel || "") + "</p>" +
          '<ul class="chatbot-upload__docs">' +
          documents.map(function (documentItem, index) {
            return buildChatDocumentChip(documentItem, index, chat);
          }).join("") +
          "</ul>" +
          "</div>"
        : "") +
      (uploadStatus
        ? '<p class="chatbot-upload__status">' + escapeHtml(uploadStatus) + "</p>"
        : "") +
      "</div>" +
      '<div class="chatbot-messages" aria-live="polite">' + messagesHtml + "</div>" +
      '<form class="chatbot-form">' +
      '<label class="chatbot-form__label" for="chatbotQuestion">' + escapeHtml(chat.inputLabel || "") + "</label>" +
      '<div class="chatbot-form__row">' +
      '<textarea class="chatbot-form__input" id="chatbotQuestion" name="question" rows="4" placeholder="' + escapeHtml(chat.placeholder || "") + '"' + (pending ? " disabled" : "") + "></textarea>" +
      '<button class="chatbot-form__button" type="submit"' + (pending ? " disabled" : "") + ">" + escapeHtml(chat.send || "") + "</button>" +
      "</div>" +
      "</form>" +
      "</aside>"
    );
  }

  function focusChatInput() {
    var input = els.chatbotHost ? els.chatbotHost.querySelector(".chatbot-form__input") : null;
    if (input) {
      input.focus();
    }
  }

  function renderChatbotHost() {
    var data = getContent().illustration;
    var active = data.phases[state.activePhase];
    var activeStage = findIllustrationStage(data, active.stage);
    var activeStageLabel = activeStage
      ? activeStage.index + ". " + activeStage.title
      : (data.postMission && data.postMission.label) || "";

    if (!els.chatbotHost) {
      els.chatbotHost = document.createElement("section");
      els.chatbotHost.className = "chatbot-host";
      els.chatbotHost.id = "chatbotHost";
      els.chatbotHost.hidden = true;
      els.main.appendChild(els.chatbotHost);
    }

    if (!state.chatOpen) {
      els.chatbotHost.hidden = true;
      els.chatbotHost.innerHTML = "";
      return;
    }

    els.chatbotHost.hidden = false;
    els.chatbotHost.innerHTML = buildChatbotPanel(data, active, activeStageLabel, activeStage);
  }

  function openChatbotPanel() {
    var sourceSectionId = state.activeSection;

    state.chatSourceSection = sourceSectionId;
    state.chatOpen = true;
    renderChatbotHost();

    if (els.chatbotHost) {
      els.chatbotHost.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    window.setTimeout(focusChatInput, 260);
  }

  function removeChatDocument(index) {
    var data = getContent().illustration;
    var chat = data.chatbot || {};
    var documents = getChatDocuments().slice();

    documents.splice(index, 1);
    setChatDocuments(documents);
    setChatUploadStatus(chat.uploadStatusRemoved || "");
    renderChatbotHost();
  }

  function loadChatDocuments(fileList) {
    var data = getContent().illustration;
    var chat = data.chatbot || {};
    var files = Array.prototype.slice.call(fileList || []);
    var existing = getChatDocuments().slice();
    var remainingChars = CHAT_DOCUMENT_TOTAL_MAX_CHARS - existing.reduce(function (sum, item) {
      return sum + Number(item.charCount || 0);
    }, 0);

    if (!files.length) {
      return Promise.resolve();
    }

    return files.reduce(function (chain, file) {
      return chain.then(function () {
        var extension;

        if (existing.length >= CHAT_DOCUMENT_LIMIT) {
          setChatUploadStatus(chat.uploadStatusTooMany || "");
          return;
        }

        if (!isSupportedChatDocument(file)) {
          setChatUploadStatus(chat.uploadStatusUnsupported || "");
          return;
        }

        extension = getChatExtension(file.name).replace(/^\./, "");

        return file.text().then(function (rawText) {
          var normalized = normalizeChatDocumentText(rawText);
          var keptText;
          var keptChars;

          if (!normalized) {
            setChatUploadStatus(chat.uploadStatusEmpty || "");
            return;
          }

          keptChars = Math.min(normalized.length, CHAT_DOCUMENT_MAX_CHARS, Math.max(0, remainingChars));

          if (!keptChars) {
            setChatUploadStatus(chat.uploadStatusTooMany || "");
            return;
          }

          keptText = normalized.slice(0, keptChars);
          existing.push({
            name: file.name,
            type: extension || file.type || "text",
            text: keptText,
            charCount: keptText.length
          });
          remainingChars -= keptText.length;
          setChatUploadStatus(
            normalized.length > keptText.length
              ? (chat.uploadStatusTooLarge || "")
              : (chat.uploadStatusLoaded || "")
          );
        }).catch(function () {
          setChatUploadStatus(chat.uploadStatusEmpty || "");
        });
      });
    }, Promise.resolve()).then(function () {
      setChatDocuments(existing);
      renderChatbotHost();
      focusChatInput();
    });
  }

  function submitChatQuestion(question) {
    var data = getContent().illustration;
    var chat = data.chatbot || {};
    var trimmed = String(question || "").trim();
    var key = getChatHistoryKey();
    var active = data.phases[state.activePhase];
    var activeStage = findIllustrationStage(data, active.stage);
    var activeStageLabel = activeStage
      ? activeStage.index + ". " + activeStage.title
      : (data.postMission && data.postMission.label) || "";
    var previousHistory;

    if (!trimmed || state.chatPending[key]) {
      return;
    }

    previousHistory = getChatHistory().slice();
    previousHistory.push({ role: "user", text: trimmed });
    state.chatHistories[key] = previousHistory;
    state.chatPending[key] = true;
    renderChatbotHost();

    if (window.location.protocol === "file:") {
      state.chatHistories[key] = previousHistory.concat([{ role: "assistant", text: chat.localMode || "" }]);
      state.chatPending[key] = false;
      renderChatbotHost();
      focusChatInput();
      return;
    }

    fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        language: state.lang,
        question: trimmed,
        history: previousHistory.slice(0, -1).slice(-6),
        context: buildChatbotFrameworkBundle(data, active, activeStage, activeStageLabel),
        documents: getChatDocuments().map(function (item) {
          return {
            name: item.name,
            type: item.type,
            text: item.text
          };
        })
      })
    }).then(function (response) {
      return response.json().catch(function () {
        return {};
      }).then(function (payload) {
        if (!response.ok || !payload.answer) {
          throw new Error(payload.error || "backend");
        }

        return payload.answer;
      });
    }).then(function (answer) {
      state.chatHistories[key] = (state.chatHistories[key] || []).concat([
        { role: "assistant", text: answer }
      ]);
    }).catch(function () {
      state.chatHistories[key] = (state.chatHistories[key] || []).concat([
        { role: "assistant", text: chat.backendError || "" }
      ]);
    }).finally(function () {
      state.chatPending[key] = false;
      renderChatbotHost();
      focusChatInput();
    });
  }

  function renderIllustration() {
    var data = getContent().illustration;
    var active = data.phases[state.activePhase];
    var activeStage = findIllustrationStage(data, active.stage);
    var activeStageLabel = activeStage
      ? activeStage.index + ". " + activeStage.title
      : (data.postMission && data.postMission.label) || "";
    var missionPhases = data.phases.filter(function (phase) {
      return phase.stage !== "postmission";
    });
    var postPhase = null;
    var postIndex = -1;

    data.phases.forEach(function (phase, index) {
      if (phase.stage === "postmission") {
        postPhase = phase;
        postIndex = index;
      }
    });

    els.illustration.innerHTML =
      '<p class="section-kicker">' + escapeHtml(data.kicker) + "</p>" +
      '<div class="timeline-shell">' +
      '<div class="timeline-head">' +
      '<h2 class="section-title">' + escapeHtml(data.title) + "</h2>" +
      '<p class="timeline-label">' + escapeHtml(data.subtitle) + "</p>" +
      '<p class="timeline-intro">' + escapeHtml(data.intro) + "</p>" +
      '<p class="timeline-legend">' + escapeHtml(data.legend) + "</p>" +
      "</div>" +
      '<div class="mission-process" aria-hidden="true">' +
      (data.stages || []).map(function (stage) {
        return buildMissionProcessStep(stage, active.stage === stage.id, "");
      }).join("") +
      "</div>" +
      '<div class="timeline-map" role="tablist" aria-label="' + escapeHtml(data.subtitle) + '">' +
      '<div class="timeline-groups">' +
      (data.stages || []).map(function (stage, stageIndex) {
        var groupClasses = ["timeline-group", "timeline-group--" + stage.id];
        var stagePhases = missionPhases.filter(function (phase) {
          return phase.stage === stage.id;
        });
        var stepCount = stagePhases.length;
        var groupWeight = stepCount + 1;
        var stepsHtml = stagePhases.map(function (phase, sequenceIndex) {
          var chipClasses = ["timeline-chip"];
          var realIndex = data.phases.indexOf(phase);

          if (realIndex === state.activePhase) {
            chipClasses.push("is-active");
          }

          return (
            '<div class="timeline-substep">' +
            '<button class="' + chipClasses.join(" ") + '" type="button" data-phase="' + realIndex + '" role="tab" aria-selected="' + String(realIndex === state.activePhase) + '">' +
            '<span class="timeline-chip__title">' + escapeHtml(phase.title) + "</span>" +
            '<span class="timeline-chip__week">' + escapeHtml(phase.week) + "</span>" +
            '<span class="timeline-chip__meta">' +
            '<span class="timeline-chip__meta-row timeline-chip__meta-row--situation">' +
            buildSituationBadge(phase.badge, phase.tone, false) +
            "</span>" +
            '<span class="timeline-chip__meta-row timeline-chip__meta-row--propositions">' +
            buildPropositionPills(phase.propositions, "timeline-chip__props", false) +
            "</span>" +
            "</span>" +
            "</button>" +
            (sequenceIndex < stagePhases.length - 1
              ? '<span class="timeline-substep__connector" aria-hidden="true"></span>'
              : "") +
            "</div>"
          );
        }).join("");

        if (active.stage === stage.id) {
          groupClasses.push("is-active");
        }

        return (
          '<div class="timeline-group-wrap" style="--group-weight:' + groupWeight + ';">' +
          buildMissionProcessStep(stage, active.stage === stage.id, "timeline-group__process") +
          '<section class="' + groupClasses.join(" ") + '">' +
          '<div class="timeline-group__head">' +
          '<p class="timeline-group__summary">' + escapeHtml(stage.summary) + "</p>" +
          "</div>" +
          '<div class="timeline-group__steps">' + stepsHtml + "</div>" +
          "</section>" +
          (stageIndex < (data.stages || []).length - 1
            ? '<span class="timeline-group__transfer" aria-hidden="true"></span>'
            : "") +
          "</div>"
        );
      }).join("") +
      "</div>" +
      (postPhase
        ? '<div class="timeline-postscript">' +
          '<div class="timeline-postscript__head">' +
          '<p class="timeline-postscript__label">' + escapeHtml(data.postMission.label) + "</p>" +
          '<p class="timeline-postscript__summary">' + escapeHtml(data.postMission.summary) + "</p>" +
          '</div>' +
          '<div class="timeline-postscript__flow">' +
          '<span class="timeline-postscript__connector" aria-hidden="true"></span>' +
          '<button class="timeline-chip timeline-chip--postscript' + (postIndex === state.activePhase ? ' is-active' : '') + '" type="button" data-phase="' + postIndex + '" role="tab" aria-selected="' + String(postIndex === state.activePhase) + '">' +
          '<span class="timeline-chip__title">' + escapeHtml(postPhase.title) + "</span>" +
          '<span class="timeline-chip__week">' + escapeHtml(postPhase.week) + "</span>" +
          '<span class="timeline-chip__meta">' +
          '<span class="timeline-chip__meta-row timeline-chip__meta-row--situation">' +
          buildSituationBadge(postPhase.badge, postPhase.tone, false) +
          "</span>" +
          '<span class="timeline-chip__meta-row timeline-chip__meta-row--propositions">' +
          buildPropositionPills(postPhase.propositions, "timeline-chip__props", false) +
          "</span>" +
          "</span>" +
          "</button>" +
          "</div>" +
          "</div>"
        : "") +
      "</div>" +
      buildPhaseDetail(active, activeStageLabel) +
      "</div>";
  }

  function buildGapBlock() {
    var theory = getPropositionContent();

    return (
      '<article class="theory-block gap-block">' +
      buildPanelLabel(theory.gapLabel) +
      '<div class="gap-block__text">' + buildPagedTextBody((theory.researchGapParagraphs || []).join("\n\n"), "propositions-gap:" + state.lang, 4) + "</div>" +
      "</article>"
    );
  }

  function buildDimensionCards() {
    var theory = getPropositionContent();

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
    var theory = getPropositionContent();

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
    var theory = getPropositionContent();
    var data = theory.rpcDiagram;

    return (
      '<article class="theory-block diagram-shell">' +
      '<p class="panel-label">' + escapeHtml(data.title) + "</p>" +
      '<p>' + escapeHtml(data.intro) + "</p>" +
      '<div class="diagram-sequence">' +
      '<div class="diagram-node">' +
      '<div class="diagram-node__head"><span class="diagram-node__dot diagram-node__dot--r">R</span><span class="diagram-node__title">' + escapeHtml(data.nodeLabels.relational) + "</span></div>" +
      "</div>" +
      '<div class="diagram-sequence__arrow">→</div>' +
      '<div class="diagram-node">' +
      '<div class="diagram-node__head"><span class="diagram-node__dot diagram-node__dot--p">P</span><span class="diagram-node__title">' + escapeHtml(data.nodeLabels.processual) + "</span></div>" +
      "</div>" +
      '<div class="diagram-sequence__arrow">→</div>' +
      '<div class="diagram-node">' +
      '<div class="diagram-node__head"><span class="diagram-node__dot diagram-node__dot--c">C</span><span class="diagram-node__title">' + escapeHtml(data.nodeLabels.cognitive) + "</span></div>" +
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
    var theory = getPropositionContent();

    return (
      '<div class="detail-stack">' +
      theory.propositionDetails.filter(function (item) {
        return item.tone !== "managerial";
      }).map(function (item) {
        return (
          '<article class="theory-block">' +
          '<span class="proposition-card__badge tone-' + escapeHtml(item.tone) + '">' + escapeHtml(item.badge) + "</span>" +
          '<h3 class="sphere-card__title">' + escapeHtml(item.title) + "</h3>" +
          '<div class="proposition-detail__body">' + buildPagedTextBody(item.text, "propositions-detail:" + state.lang + ":" + item.badge, 3) + "</div>" +
          "</article>"
        );
      }).join("") +
      "</div>"
    );
  }

  function buildManagerialCard() {
    var theory = getPropositionContent();
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
      '<div class="proposition-detail__body">' + buildPagedTextBody(item.text, "propositions-detail:" + state.lang + ":" + item.badge, 2) + "</div>" +
      "</article>"
    );
  }

  function buildObservationCard() {
    var obs = getContent().theory.observationalFramework;

    return (
      '<article class="theory-block observational-card">' +
      buildPanelLabel(obs.label) +
      buildPagedTextBody(obs.text, "theory-observation:" + state.lang, 2) +
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
      buildPanelLabel(prompt.label) +
      buildPagedHtmlBody(prompt.text, "theory-prompt:" + state.lang, 2) +
      "</article>"
    );
  }

  function renderTheory() {
    var theory = getContent().theory;
    var overviewBlocks = theory.overviewBlocks || [];

    els.theory.innerHTML =
      '<p class="section-kicker">' + escapeHtml(theory.kicker) + "</p>" +
      '<div class="stack">' +
      (theory.title ? '<h2 class="section-title">' + escapeHtml(theory.title) + "</h2>" : "") +
      overviewBlocks.map(function (block, index) {
        return (
          '<article class="callout">' +
          buildPanelLabel(block.label) +
          buildPagedTextBody(block.text, "theory-overview:" + state.lang + ":" + String(index), 3) +
          "</article>"
        );
      }).join("") +
      "</div>";
  }

  function renderPropositions() {
    var theory = getPropositionContent();

    if (!els.propositions) {
      return;
    }

    els.propositions.innerHTML =
      '<p class="section-kicker">' + escapeHtml(theory.kicker) + "</p>" +
      '<div class="stack">' +
      (theory.title ? '<h2 class="section-title">' + escapeHtml(theory.title) + "</h2>" : "") +
      (theory.introHtml ? '<article class="callout">' + buildPagedHtmlBody(theory.introHtml, "propositions-intro:" + state.lang, 3) + "</article>" : "") +
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
      (theory.findingsNote ? '<p class="findings-note">' + escapeHtml(theory.findingsNote) + "</p>" : "") +
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
      "</div>" +
      '<article class="callout">' + buildPagedTextBody(spheres.intro, "spheres-intro:" + state.lang, 3) + "</article>" +
      '<div class="sphere-shell">' +
      buildSphereModel() +
      '<div class="sphere-cards">' +
      spheres.cards.map(function (item) {
        return (
          '<article class="sphere-card sphere-card--' + escapeHtml(item.key) + '" id="sphere-' + escapeHtml(item.key) + '">' +
          '<h2 class="sphere-card__title">' + escapeHtml(item.title) + "</h2>" +
          buildPagedTextBody(item.text, "sphere-card:" + state.lang + ":" + item.key, 3) +
          "</article>"
        );
      }).join("") +
      "</div>" +
      "</div>" +
      "</div>";
  }

  function renderBibliography() {
    var bibliography = getContent().bibliography || {};

    if (!els.bibliography) {
      return;
    }

    els.bibliography.innerHTML =
      '<p class="section-kicker">' + escapeHtml(bibliography.kicker || "") + "</p>" +
      '<div class="stack">' +
      '<div class="timeline-head">' +
      '<h2 class="section-title">' + escapeHtml(bibliography.title || "") + "</h2>" +
      '<p class="section-subtitle">' + escapeHtml(bibliography.intro || "") + "</p>" +
      "</div>" +
      '<article class="callout bibliography-card">' +
      buildPagedReferenceList(bibliography.entries || [], "bibliography:" + state.lang, 5) +
      "</article>" +
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

    if (els.floatingChatBtn) {
      els.floatingChatBtn.addEventListener("click", openChatbotPanel);
    }

    els.sectionNav.addEventListener("click", function (event) {
      var button = event.target.closest("[data-target]");
      var targetId;
      if (!button) {
        return;
      }

      targetId = button.getAttribute("data-target");
      state.chatSourceSection = targetId;
      activateSection(targetId, true);
      renderChatbotHost();
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
      state.chatSourceSection = buttons[nextIndex].getAttribute("data-target");
      activateSection(buttons[nextIndex].getAttribute("data-target"), false);
      renderChatbotHost();
    });

    document.addEventListener("click", function (event) {
      var suggestionButton = event.target.closest("[data-chat-suggestion]");
      var removeButton;
      var pageButton = event.target.closest("[data-page-key]");

      if (pageButton) {
        var pageKey = pageButton.getAttribute("data-page-key");
        var direction = Number(pageButton.getAttribute("data-page-dir") || 0);
        state.blockPages[pageKey] = Math.max(0, Number(state.blockPages[pageKey] || 0) + direction);
        renderApp();
        return;
      }

      if (suggestionButton) {
        submitChatQuestion(suggestionButton.getAttribute("data-chat-suggestion"));
        return;
      }

      removeButton = event.target.closest("[data-chat-doc-remove]");
      if (removeButton) {
        removeChatDocument(Number(removeButton.getAttribute("data-chat-doc-remove")));
        return;
      }

      var phaseButton = event.target.closest("[data-phase]");
      if (phaseButton) {
        state.activePhase = Number(phaseButton.getAttribute("data-phase"));
        state.chatSourceSection = "illustration";
        renderIllustration();
        renderChatbotHost();
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

    document.addEventListener("submit", function (event) {
      var form = event.target.closest(".chatbot-form");
      var input;

      if (!form) {
        return;
      }

      event.preventDefault();
      input = form.querySelector(".chatbot-form__input");

      if (!input) {
        return;
      }

      submitChatQuestion(input.value);
    });

    document.addEventListener("change", function (event) {
      var uploadInput = event.target.closest(".chatbot-upload__input");
      var files;

      if (!uploadInput) {
        return;
      }

      files = uploadInput.files;
      uploadInput.value = "";
      loadChatDocuments(files);
    });

    document.addEventListener("keydown", function (event) {
      var input = event.target.closest(".chatbot-form__input");
      var form;

      if (!input || event.key !== "Enter" || event.shiftKey || event.isComposing) {
        return;
      }

      event.preventDefault();
      form = input.closest(".chatbot-form");

      if (form && typeof form.requestSubmit === "function") {
        form.requestSubmit();
      } else if (form) {
        submitChatQuestion(input.value);
      }
    });
  }

  function renderApp() {
    renderHero();
    renderNav();
    renderWhyResearch();
    renderTheory();
    renderPropositions();
    renderSpheres();
    renderIllustration();
    renderBibliography();
    renderChatbotHost();
    updateSectionVisibility();
  }

  function init() {
    renderApp();
    bindEvents();
  }

  init();
})();
