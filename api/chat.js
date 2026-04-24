var fs = require("fs");
var path = require("path");

var exploratoryFrameworkCache = null;
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

function getExploratoryFrameworkSource() {
  var candidates = [
    path.join(process.cwd(), "sources", "CADRE_EXPLORATOIRE_YUNES_CLEMENT_PRIMARY.md"),
    path.join(__dirname, "..", "sources", "CADRE_EXPLORATOIRE_YUNES_CLEMENT_PRIMARY.md")
  ];
  var i;

  if (exploratoryFrameworkCache !== null) {
    return exploratoryFrameworkCache;
  }

  exploratoryFrameworkCache = "";

  for (i = 0; i < candidates.length; i += 1) {
    try {
      exploratoryFrameworkCache = fs.readFileSync(candidates[i], "utf8").trim();
      if (exploratoryFrameworkCache) {
        break;
      }
    } catch (error) {
      exploratoryFrameworkCache = "";
    }
  }

  return exploratoryFrameworkCache;
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

function buildInstructions(language) {
  var targetLanguage = language === "fr" ? "French" : "English";

  return [
    "You are the AI assistant embedded in a doctoral artefact about perceived value co-creation in AI-era consulting.",
    "The sole primary source is the exploratory framework document provided in the user message.",
    "If the user explicitly asks about the framework, the document, the propositions, the model, the S1/S2/S3 observation framework, or asks you to stay within the framework, answer strictly from that primary source and cite it precisely with the page markers available in the source, for example '(Cadre exploratoire, p. 8)'.",
    "In strict framework mode, do not introduce concepts, claims, distinctions or citations that are not present in the exploratory framework source.",
    "The active page and the active illustration step are contextual reading cues only. They help you understand where the user is in the artefact, but they are not additional primary sources.",
    "User-uploaded documents are supplementary user-provided context. Use them only when they help answer the user's question, and never let them override the exploratory framework on questions about the framework itself.",
    "If the user asks for ideas, implications, scenarios, design options or practical exploration beyond the framework, you may reason more freely. In that case, clearly distinguish what comes from the exploratory framework and what is your extrapolation beyond it.",
    "Whenever you go beyond the framework, say so explicitly in natural language, for example 'Beyond the exploratory framework, a practical implication would be...' or the French equivalent.",
    "If the answer is framework-bound and the requested point is not stated in the exploratory framework, say so clearly rather than inventing it.",
    "Treat P1, P2 and P3 as exploratory theoretical propositions; treat S1, S2 and S3 as an observational framework; treat R, P and C as dimensions of perceived value.",
    "If the user is on the Illustration page, use the active step as the immediate reading context. Otherwise, use the current section as the reading context.",
    "Mention the current reading context briefly and naturally only when it helps orient the answer.",
    "Keep the answer readable and direct. Prefer short paragraphs or a few bullets rather than dense academic prose.",
    "Always finish with a complete sentence.",
    "Respond entirely in " + targetLanguage + ", matching the user's selected UI language.",
    "Return plain text only."
  ].join(" ");
}

function buildPrompt(body) {
  var exploratoryFramework = getExploratoryFrameworkSource();
  var artefactBundle = body.context || {};
  var documents = normalizeDocuments(body.documents);

  return [
    "User question:",
    body.question,
    "",
    "Primary source - Exploratory framework document:",
    exploratoryFramework || "[Exploratory framework source unavailable]",
    "",
    "Current active page context:",
    JSON.stringify(artefactBundle.activePage || {}, null, 2),
    "",
    "Current active illustration context:",
    JSON.stringify(artefactBundle.current || {}, null, 2),
    "",
    "Displayed illustration structure:",
    JSON.stringify(artefactBundle.illustration || {}, null, 2),
    "",
    "Supplementary user-provided documents:",
    documents.length
      ? JSON.stringify(documents, null, 2)
      : "[No supplementary documents provided]"
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
