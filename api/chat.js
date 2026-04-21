var fs = require("fs");
var path = require("path");

var academicNoteCache = null;
var artefactSourceCache = null;

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

function buildInstructions(language) {
  var targetLanguage = language === "fr" ? "French" : "English";

  return [
    "You are the AI reading assistant embedded in a doctoral artefact about perceived value co-creation in AI-era consulting.",
    "You must answer strictly from three primary sources only: the academic note loaded by the server, the artefact content bundle provided in the user message, and the server-loaded content.js artefact source.",
    "Use the academic note as the conceptual anchor for the research problem, propositions, observational framework and illustrative case.",
    "Use the artefact content bundle as the displayed source of truth for the active step, the current illustration, the propositions, the dimensions and the observational situation shown to the user.",
    "Use content.js as a primary wording and coherence source for the artefact's internal content, labels, glossary and section texts.",
    "Do not introduce outside theories, citations, examples, concepts, or facts not present in the supplied material.",
    "Treat P1, P2 and P3 as exploratory theoretical propositions; treat S1, S2 and S3 as an observational framework; treat R, P and C as perceived value dimensions.",
    "If the supplied sources differ in level of detail, reconcile them conservatively: preserve the academic note for conceptual framing, the artefact bundle for the current-screen context, and content.js for the artefact's exact internal wording.",
    "If the user asks about a scenario not directly present in the illustration, answer as a bounded theoretical inference and say so explicitly.",
    "If the illustration contains a close counterpart, mention it explicitly.",
    "Never claim empirical proof or certainty beyond the supplied exploratory framework.",
    "Keep the answer concise and structured with short labels or short sections such as: Current step, Framework reading, Closest counterpart or bounded inference, Boundary of answer.",
    "Respond entirely in " + targetLanguage + ".",
    "Return plain text only."
  ].join(" ");
}

function buildPrompt(body) {
  var academicNote = getAcademicNote();
  var artefactSource = getArtefactSource();
  var artefactBundle = body.context || {};

  return [
    "User question:",
    body.question,
    "",
    "Co-primary source 1 - Academic note (NOTE_ACADEMIQUE.md):",
    academicNote || "[Academic note unavailable]",
    "",
    "Co-primary source 2 - Artefact content bundle (current display context):",
    JSON.stringify(artefactBundle, null, 2),
    "",
    "Co-primary source 3 - content.js artefact source:",
    artefactSource || "[content.js unavailable]",
    "",
    "Current active context shortcut:",
    JSON.stringify(artefactBundle.current || {}, null, 2)
  ].join("\n");
}

function toResponsesMessages(history) {
  return (history || []).filter(function (item) {
    return item && (item.role === "user" || item.role === "assistant") && item.text;
  }).slice(-6).map(function (item) {
    return {
      role: item.role,
      content: [
        {
          type: "input_text",
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
        input: messages
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

  answer = extractOutputText(payload);

  if (!answer) {
    return sendJson(res, 502, { error: "Empty model response" });
  }

  return sendJson(res, 200, { answer: answer });
};
