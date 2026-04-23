var fs = require("fs");
var path = require("path");

var academicNoteCache = null;
var artefactSourceCache = null;
var regenaSourceCache = null;
var chatbotConversationSourceCache = null;
var CHATBOT_MAX_OUTPUT_TOKENS = 1600;
var CHAT_DOCUMENT_LIMIT = 3;
var CHAT_DOCUMENT_MAX_CHARS = 12000;

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  var raw = "";
  var chunk;

  for await (chunk of req) {
    raw += chunk;
  }

  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
}

function getAcademicNote() {
  var candidates = [
    path.join(process.cwd(), "NOTE_ACADEMIQUE.md"),
    path.join(__dirname, "..", "NOTE_ACADEMIQUE.md")
  ];
  var i;

  if (academicNoteCache !== null) {
    return academicNoteCache;
  }

  academicNoteCache = "";

  for (i = 0; i < candidates.length; i += 1) {
    try {
      academicNoteCache = fs.readFileSync(candidates[i], "utf8").trim();
      if (academicNoteCache) {
        break;
      }
    } catch (error) {
      academicNoteCache = "";
    }
  }

  return academicNoteCache;
}

function getArtefactSource() {
  var candidates = [
    path.join(process.cwd(), "content.js"),
    path.join(__dirname, "..", "content.js")
  ];
  var i;

  if (artefactSourceCache !== null) {
    return artefactSourceCache;
  }

  artefactSourceCache = "";

  for (i = 0; i < candidates.length; i += 1) {
    try {
      artefactSourceCache = fs.readFileSync(candidates[i], "utf8").trim();
      if (artefactSourceCache) {
        break;
      }
    } catch (error) {
      artefactSourceCache = "";
    }
  }

  return artefactSourceCache;
}

function getRegenaSource() {
  var candidates = [
    path.join(process.cwd(), "sources", "REGENA_ATELIER_DOCTORAL_2025.md"),
    path.join(__dirname, "..", "sources", "REGENA_ATELIER_DOCTORAL_2025.md")
  ];
  var i;

  if (regenaSourceCache !== null) {
    return regenaSourceCache;
  }

  regenaSourceCache = "";

  for (i = 0; i < candidates.length; i += 1) {
    try {
      regenaSourceCache = fs.readFileSync(candidates[i], "utf8").trim();
      if (regenaSourceCache) {
        break;
      }
    } catch (error) {
      regenaSourceCache = "";
    }
  }

  return regenaSourceCache;
}

function getChatbotConversationSource() {
  var candidates = [
    path.join(process.cwd(), "research", "CHATBOT_CONVERSATIONS_PRODUCTION.md"),
    path.join(__dirname, "..", "research", "CHATBOT_CONVERSATIONS_PRODUCTION.md")
  ];
  var i;

  if (chatbotConversationSourceCache !== null) {
    return chatbotConversationSourceCache;
  }

  chatbotConversationSourceCache = "";

  for (i = 0; i < candidates.length; i += 1) {
    try {
      chatbotConversationSourceCache = fs.readFileSync(candidates[i], "utf8").trim();
      if (chatbotConversationSourceCache) {
        break;
      }
    } catch (error) {
      chatbotConversationSourceCache = "";
    }
  }

  return chatbotConversationSourceCache;
}

function normalizeText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function truncateText(text, maxChars) {
  var normalized = normalizeText(text);

  if (normalized.length <= maxChars) {
    return normalized;
  }

  return normalized.slice(0, maxChars) + " …[truncated]";
}

function buildArtefactSourceDigest(body, rawSource) {
  var artefactBundle = body.context || {};
  var current = artefactBundle.current || {};
  var theory = artefactBundle.theory || {};

  return {
    sourceFile: "content.js",
    sourceLoaded: Boolean(rawSource),
    sourceSizeChars: rawSource ? rawSource.length : 0,
    runtimeLanguage: artefactBundle.language || body.language || "",
    activePage: artefactBundle.activePage || {},
    currentLabels: {
      stage: current.stage || "",
      substep: current.substep || "",
      week: current.week || "",
      situation: current.situation || {},
      propositions: current.propositions || [],
      dimensions: current.dimensions || []
    },
    theoryDigest: {
      intro: theory.intro || "",
      propositions: (theory.propositions || []).map(function (item) {
        return {
          badge: item.badge,
          title: item.title
        };
      }),
      observationalFramework: theory.observationalFramework || {},
      model: theory.model || {}
    },
    sourcePreview: truncateText(rawSource, 3000)
  };
}

function buildInstructions(language) {
  var targetLanguage = language === "fr" ? "French" : "English";

  return [
    "You are the AI reading assistant embedded in a doctoral artefact about perceived value co-creation in AI-era consulting.",
    "Use four primary sources as the foundation: the academic note loaded by the server, the artefact content bundle provided in the user message, the server-loaded content.js artefact source, and the REGEN-A doctoral workshop source.",
    "Use the academic note as the conceptual anchor for the research problem, propositions, observational framework and illustrative case.",
    "Use the artefact content bundle as the displayed source of truth for the active page, active step, propositions, dimensions and observational situation shown to the user.",
    "Use content.js as a wording and coherence source for the artefact's internal content, labels, glossary and section texts.",
    "Use the REGEN-A source as a working-document source for research trajectory, background, methodology, practitioner relevance and earlier S1/S2/S3 reasoning; do not let it override the current academic note or artefact wording.",
    "Use the chatbot conversation corpus only as a secondary source about prior user questions, tensions and clarifications. Because user conversations are not controlled theoretical material, do not use them to establish the framework and do not let them override the academic note, artefact wording, content.js or REGEN-A source. Treat them only as research material that can reveal interpretive issues or refinement needs.",
    "If user-uploaded supplementary documents are provided, treat them as user-supplied secondary context. Use them when the user explicitly asks you to read, compare, interpret or reason from them, but do not let them override the primary research sources for claims about the framework itself.",
    "Always take the activePage object as the user's current reading context. Use it silently by default, and mention the active page briefly and naturally only when it helps orient the answer.",
    "If activePage.id is illustration, use the clicked mission sub-step as the operational context.",
    "If activePage.id is why, theory, or spheres, prioritize that section's role and excerpts; do not assume the user is asking from a mission sub-step.",
    "Apply two answer modes. Framework mode: if the user asks what the framework says, asks for definitions, asks about P1/P2/P3, R/P/C, S1/S2/S3, citations, the thesis logic, or asks to stay within the framework, answer strictly from the primary sources. Generative mode: if the user asks for practical implications, alternative scenarios, facilitation ideas, examples, or creative exploration, you may go beyond the supplied sources with cautious practical reasoning.",
    "In generative mode, clearly separate what is anchored in the research framework from what is your practical extrapolation. Do not present extrapolations as findings of the thesis.",
    "Do not add outside academic citations, named theories, or empirical claims unless they are present in the supplied material. Practical examples may be invented only as illustrative possibilities.",
    "Treat P1, P2 and P3 as exploratory theoretical propositions; treat S1, S2 and S3 as an observational framework; treat R, P and C as perceived value dimensions.",
    "If the supplied sources differ in level of detail, reconcile them conservatively: preserve the academic note for conceptual framing, the artefact bundle for the current-screen context, content.js for the artefact's exact internal wording, and the REGEN-A source as earlier working material.",
    "If the user asks about a scenario not directly present in the illustration and the question is framework-bound, answer as a bounded theoretical inference and say so briefly. If the question is generative, present it as a practical extrapolation.",
    "If the illustration contains a close counterpart, mention it only if useful; do not force a recurring 'closest counterpart' section.",
    "Never claim empirical proof or certainty beyond the supplied exploratory framework.",
    "Keep the answer concise, natural and useful. Prefer 2 to 4 short paragraphs or 3 to 5 bullets. Avoid heavy templates, repeated context recaps, and mandatory boundary sections.",
    "Always finish with a complete sentence. If the answer would become too long, shorten it rather than starting a point that cannot be completed.",
    "Use clear, practitioner-friendly wording while preserving academic precision.",
    "Respond entirely in " + targetLanguage + ", matching the user's selected UI language.",
    "Return plain text only."
  ].join(" ");
}

function normalizeDocuments(documents) {
  return (documents || []).filter(function (item) {
    return item && item.name && item.text;
  }).slice(0, CHAT_DOCUMENT_LIMIT).map(function (item) {
    return {
      name: truncateText(item.name, 240),
      type: truncateText(item.type || "text", 60),
      text: truncateText(item.text, CHAT_DOCUMENT_MAX_CHARS)
    };
  });
}

function buildPrompt(body) {
  var academicNote = getAcademicNote();
  var artefactSource = getArtefactSource();
  var regenaSource = getRegenaSource();
  var chatbotConversationSource = getChatbotConversationSource();
  var artefactBundle = body.context || {};
  var artefactSourceDigest = buildArtefactSourceDigest(body, artefactSource);
  var documents = normalizeDocuments(body.documents);

  return [
    "User question:",
    body.question,
    "",
    "Co-primary source 1 - Academic note (NOTE_ACADEMIQUE.md):",
    truncateText(academicNote || "[Academic note unavailable]", 16000),
    "",
    "Co-primary source 2 - Artefact content bundle (current display context):",
    JSON.stringify(artefactBundle, null, 2),
    "",
    "Co-primary source 3 - content.js artefact digest:",
    JSON.stringify(artefactSourceDigest, null, 2),
    "",
    "Co-primary source 4 - REGEN-A doctoral workshop working source:",
    truncateText(regenaSource || "[REGEN-A source unavailable]", 12000),
    "",
    "Secondary source - Chatbot conversation corpus:",
    truncateText(chatbotConversationSource || "[Chatbot conversation corpus unavailable]", 12000),
    "",
    "User-uploaded supplementary documents:",
    documents.length
      ? JSON.stringify(documents, null, 2)
      : "[No user-uploaded documents provided]",
    "",
    "Current active page shortcut:",
    JSON.stringify(artefactBundle.activePage || {}, null, 2),
    "",
    "Current active context shortcut:",
    JSON.stringify(artefactBundle.current || {}, null, 2)
  ].join("\n");
}

function toResponsesMessages(history) {
  return (history || []).filter(function (item) {
    return item && (item.role === "user" || item.role === "assistant") && item.text;
  }).slice(-6).map(function (item) {
    var contentType = item.role === "assistant" ? "output_text" : "input_text";

    return {
      role: item.role,
      content: [
        {
          type: contentType,
          text: String(item.text)
        }
      ]
    };
  });
}

function extractOutputText(payload) {
  var text = payload && payload.output_text;
  var output = payload && payload.output;
  var i;
  var j;
  var item;
  var content;

  if (typeof text === "string" && text.trim()) {
    return text.trim();
  }

  if (!Array.isArray(output)) {
    return "";
  }

  for (i = 0; i < output.length; i += 1) {
    item = output[i];
    if (!item || !Array.isArray(item.content)) {
      continue;
    }

    for (j = 0; j < item.content.length; j += 1) {
      content = item.content[j];
      if (content && typeof content.text === "string" && content.text.trim()) {
        return content.text.trim();
      }
    }
  }

  return "";
}

function responseWasTruncated(payload) {
  return Boolean(
    payload &&
    payload.status === "incomplete" &&
    payload.incomplete_details &&
    payload.incomplete_details.reason === "max_output_tokens"
  );
}

function trimToCompleteBoundary(text) {
  var clean = String(text || "").trim();
  var sentenceEnd = Math.max(
    clean.lastIndexOf("."),
    clean.lastIndexOf("!"),
    clean.lastIndexOf("?"),
    clean.lastIndexOf("…")
  );
  var wordBoundary;

  if (!clean) {
    return "";
  }

  if (sentenceEnd > clean.length * 0.45) {
    return clean.slice(0, sentenceEnd + 1).trim();
  }

  wordBoundary = clean.lastIndexOf(" ");
  if (wordBoundary > clean.length * 0.45) {
    return clean.slice(0, wordBoundary).trim() + "…";
  }

  return clean;
}

function finalizeAnswer(answer, payload, language) {
  var clean = String(answer || "").trim();
  var notice;

  if (!responseWasTruncated(payload)) {
    return clean;
  }

  notice = language === "fr"
    ? "Réponse écourtée par limite technique. Vous pouvez demander une suite ou reformuler la question."
    : "Answer shortened by a technical limit. You can ask for a continuation or rephrase the question.";

  return trimToCompleteBoundary(clean) + "\n\n" + notice;
}

module.exports = async function handler(req, res) {
  var apiKey = process.env.OPENAI_API_KEY;
  var model = process.env.OPENAI_MODEL || "gpt-5.4";
  var body;
  var response;
  var payload;
  var answer;
  var messages;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  if (!apiKey) {
    return sendJson(res, 500, { error: "Missing OPENAI_API_KEY" });
  }

  try {
    body = await readJson(req);
  } catch (error) {
    return sendJson(res, 400, { error: "Invalid JSON body" });
  }

    if (!body || !body.question || !body.context) {
      return sendJson(res, 400, { error: "Missing question or context" });
    }

  messages = toResponsesMessages(body.history);
  messages.push({
    role: "user",
    content: [
      {
        type: "input_text",
        text: buildPrompt(body)
      }
    ]
  });

  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: model,
        instructions: buildInstructions(body.language),
        input: messages,
        max_output_tokens: CHATBOT_MAX_OUTPUT_TOKENS,
        reasoning: {
          effort: "low"
        }
      })
    });
  } catch (error) {
    return sendJson(res, 502, { error: "OpenAI request failed" });
  }

  try {
    payload = await response.json();
  } catch (error) {
    payload = {};
  }

  if (!response.ok) {
    return sendJson(res, response.status, {
      error: (payload && payload.error && payload.error.message) || "OpenAI API error"
    });
  }

  answer = finalizeAnswer(extractOutputText(payload), payload, body.language);

  if (!answer) {
    return sendJson(res, 502, { error: "Empty model response" });
  }

  return sendJson(res, 200, { answer: answer });
};
