var path = require("path");
var { pathToFileURL } = require("url");

async function loadGenerator() {
  try {
    return await import("../scripts/generate-content-document.mjs");
  } catch (error) {
    return import(pathToFileURL(path.join(process.cwd(), "scripts", "generate-content-document.mjs")).href);
  }
}

function getLanguage(req) {
  var value = req.query && req.query.lang;

  if (Array.isArray(value)) {
    value = value[0];
  }

  return value === "fr" ? "fr" : "en";
}

function getOrigin(req) {
  var proto = req.headers["x-forwarded-proto"] || "https";
  var host = req.headers["x-forwarded-host"] || req.headers.host || "s1s2s3.vercel.app";

  if (Array.isArray(proto)) {
    proto = proto[0];
  }

  if (Array.isArray(host)) {
    host = host[0];
  }

  return proto + "://" + host;
}

module.exports = async function handler(req, res) {
  var lang;
  var generator;
  var artefact;
  var origin;
  var figureAssets;
  var doc;
  var html;
  var filename;

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end("Method not allowed");
    return;
  }

  try {
    lang = getLanguage(req);
    generator = await loadGenerator();
    artefact = generator.loadArtefactContent();
    origin = getOrigin(req);
    figureAssets = {
      fr: {
        relativePath: "",
        fileUrl: origin + "/docs/assets/spheres-fr.png"
      },
      en: {
        relativePath: "",
        fileUrl: origin + "/docs/assets/spheres-en.png"
      }
    };
    doc = generator.buildLocaleDocument(artefact, lang, figureAssets);
    html = generator.renderWordHtml(doc.blocks);
    filename = lang === "fr" ? "DOCUMENT_COMPLEMENTAIRE_CONTENU_FR.doc" : "DOCUMENT_COMPLEMENTAIRE_CONTENU_EN.doc";

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/msword; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="' + filename + '"');
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.end(html);
  } catch (error) {
    console.error("Document generation failed", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("The Word document could not be regenerated right now.");
  }
};
