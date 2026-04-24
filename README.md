# S1 / S2 / S3 Artefact

Interactive research artefact for a PhD project on perceived value co-creation in consulting in the AI era.

The application is bilingual (`EN` / `FR`) and presents:

- `Why this research`
- `Theoretical framework`
- `Observation framework`
- `Illustration`

It also includes a cloud chatbot, accessible through a floating AI assistant button, designed to answer with the current page as context without changing the active reading section: strictly from the exploratory framework source document when the user asks about the framework, and with clearly marked practical extrapolation when the user asks about implications or ideas beyond that framework.

## What the app does

- presents the doctoral framework through a navigable artefact
- visualizes the `R -> P -> C` model and the `S1 / S2 / S3` observational framework
- illustrates the framework through a fictional consulting mission
- allows step-by-step exploration of the mission timeline
- provides glossary tooltips for `S1/S2/S3`, `P1/P2/P3` and `R/P/C`
- lets users download the full app text as a language-specific Word document from the header
- offers a contextual chatbot tied to the current reading section and, in `Illustration`, to the currently active mission step
- lets users attach short text-based supplementary documents to the chatbot for contextual questioning

## Project structure

- `index.html`: main entry point
- `styles.css`: design tokens, theming, layout, responsive behavior
- `content.js`: bilingual content, theoretical copy, timeline data, chatbot labels
- `app.js`: rendering logic, navigation, interactions, chatbot frontend
- `api/chat.js`: server endpoint calling the OpenAI Responses API
- `S1-S2-S3_Artefact.html`: synchronized standalone HTML copy
- `NOTE_ACADEMIQUE.md`: complementary academic framing note for project documentation
- `docs/DOCUMENT_COMPLEMENTAIRE_CONTENU_FR.md`: French human-readable companion document containing the site texts organized by section
- `docs/DOCUMENT_COMPLEMENTAIRE_CONTENU_FR.doc` and `docs/DOCUMENT_COMPLEMENTAIRE_CONTENU_FR.docx`: Word-readable versions of the French companion document
- `docs/DOCUMENT_COMPLEMENTAIRE_CONTENU_EN.md`: English human-readable companion document containing the site texts organized by section
- `docs/DOCUMENT_COMPLEMENTAIRE_CONTENU_EN.doc` and `docs/DOCUMENT_COMPLEMENTAIRE_CONTENU_EN.docx`: Word-readable versions of the English companion document
- `docs/assets/spheres-fr.*` and `docs/assets/spheres-en.*`: generated diagram assets embedded in the companion Word documents
- `research/CHATBOT_CONVERSATIONS_PRODUCTION.md`: manually maintained secondary corpus of production chatbot conversations, with contextual metadata for research use
- `sources/CADRE_EXPLORATOIRE_YUNES_CLEMENT_PRIMARY.md`: sole primary source used by the chatbot for framework-grounded answers
- `sources/REGENA_ATELIER_DOCTORAL_2025.md`: archived working-document source kept for project memory
- `sources/originals/REGENA_ATELIER_DOCTORAL_2025.pptx`: archived original REGEN-A doctoral workshop deck
- `SUPERVISOR_COHERENCE_REPORT.md`: internal coherence review document

## Human-readable content companion

`docs/DOCUMENT_COMPLEMENTAIRE_CONTENU_FR.*` and `docs/DOCUMENT_COMPLEMENTAIRE_CONTENU_EN.*` are manually maintained companion documents.

The app exposes a language-aware download link in the header:

- French UI downloads `docs/DOCUMENT_COMPLEMENTAIRE_CONTENU_FR.docx`
- English UI downloads `docs/DOCUMENT_COMPLEMENTAIRE_CONTENU_EN.docx`

The visual design and placement of the header link remain identical across local and deployed modes; only the download target is static.

## Primary source library

The chatbot now uses one sole primary source for framework-grounded answers:

- `sources/CADRE_EXPLORATOIRE_YUNES_CLEMENT_PRIMARY.md`

This source is the normalized textual version of the exploratory framework document and includes page markers used for precise citation in chatbot answers.

The chatbot also receives:

- the active artefact page and active illustration step as contextual reading cues only
- user-uploaded supplementary text documents as secondary user-provided context
- `research/CHATBOT_CONVERSATIONS_PRODUCTION.md` only as a manually curated secondary research corpus when relevant to interpretation, never as a validated theoretical source

## Chatbot conversation corpus

`research/CHATBOT_CONVERSATIONS_PRODUCTION.md` records production chatbot conversations that are manually supplied for research purposes. Each entry should preserve the conversation verbatim and include contextual metadata such as active page, illustration step when applicable, situation, propositions and value dimensions.

This corpus is a secondary source for the chatbot, not a primary theoretical source. It can help identify user questions, interpretive tensions and possible refinement needs, but it must not override the exploratory framework source document.

The current app does not automatically persist chatbot conversations. Any future automated collection should include explicit user information, limited data capture and an appropriate research-governance process.

## Runtime modes

### 1. Local reading mode

Open `index.html` or `S1-S2-S3_Artefact.html` directly in a browser.

What works:

- full reading experience
- language toggle
- theme toggle
- diagrams
- timeline interactions
- glossary tooltips

What does not work:

- cloud chatbot

Reason:

- when the app is opened through `file://`, there is no server endpoint available for `/api/chat`

### 2. Full deployed mode

To use the cloud chatbot, the artefact must be served from an environment that:

- serves the static frontend files
- exposes the server endpoint `/api/chat`
- provides `OPENAI_API_KEY`

The current repository structure is compatible with deployments that support static assets plus server-side API routes.

## Chatbot architecture

The chatbot is context-aware and intentionally bounded, but not mechanically rigid.

It receives:

- the current reading section (`Why this research`, `Theoretical framework`, `Observation framework`, or `Illustration`)
- the current active mission step
- the current stage
- the current situation (`S1/S2/S3`)
- the propositions associated with that step
- the value dimensions associated with that step
- the illustration overview
- the server-loaded exploratory framework source document
- optional user-uploaded supplementary text documents for contextual reading

It must answer:

- strictly within the exploratory framework source document when the user asks what the framework says, asks for definitions, or asks about `P1/P2/P3`, `R/P/C` or `S1/S2/S3`
- with precise page citations when the answer is framework-bound
- with clearly marked practical extrapolation when the user asks for implications, alternative scenarios, examples or ideas
- by treating uploaded documents as user-provided supplementary material rather than as validated theoretical sources
- in the language selected in the UI
- with priority given to the current reading section
- with priority given to the clicked mission sub-step when the user is in `Illustration`
- without introducing outside academic citations or presenting extrapolations as thesis findings
- with concise signalling when the answer is a bounded inference or a practical extrapolation

The frontend never calls OpenAI directly.

Instead:

1. `app.js` sends a request to `/api/chat`
2. `api/chat.js` builds a constrained prompt
3. the server calls the OpenAI Responses API
4. the answer is returned to the UI

### Supplementary chatbot documents

The chatbot can receive a small set of user-uploaded supplementary documents.

Current supported formats:

- `.txt`
- `.md`
- `.markdown`
- `.csv`
- `.json`
- `.html`
- `.htm`
- `.xml`
- `.yml`
- `.yaml`

Current limits:

- up to 3 documents per active chatbot context
- text-based formats only
- each document is truncated before being sent to the server

These documents are treated as supplementary user context. They can help the assistant read or compare material supplied by the user, but they must not override the primary research sources when the user asks what the framework says.

## Environment variables

Required:

- `OPENAI_API_KEY`

Optional:

- `OPENAI_MODEL`

Default model if unspecified:

- `gpt-5.4`

## Deployment note

Static-only hosting is sufficient for the reading artefact, but not for the chatbot.

That means:

- `GitHub Pages` can host the reading experience
- `GitHub Pages` alone cannot run `/api/chat`
- for the chatbot, use a deployment target that supports both static hosting and server-side routes, or connect the frontend to an external backend

## Content and theoretical integrity

The artefact is not a generic AI explainer.

Its core constraints are:

- `P1`, `P2`, `P3` are exploratory theoretical propositions
- `S1`, `S2`, `S3` form an observational framework, not a prescriptive recipe
- `R`, `P`, `C` are the perceived value dimensions mobilized by the framework
- the chatbot must preserve this conceptual perimeter when explaining the research framework
- practical ideas must be clearly distinguished from what the framework itself establishes

## Current status

Implemented:

- section-based navigation
- bilingual content
- dark/light theme
- theoretical diagrams
- observation framework diagram
- mission timeline with active-step detail panel
- glossary tooltips
- floating contextual cloud-chatbot UI
- page-aware chatbot context
- supplementary document upload for the chatbot
- server endpoint for OpenAI Responses API
- Vercel Web Analytics via `/_vercel/insights/script.js`
- Simple Analytics privacy-first tracking via `https://scripts.simpleanalyticscdn.com/latest.js`
- language-aware Word document download from the app header

Not yet included:

- deployment configuration file for a specific hosting provider
- authoring CMS
- automated tests

## Recommended next step

Before public deployment:

- choose the target hosting platform for `/api/chat`
- configure `OPENAI_API_KEY`
- run an end-to-end visual and conversational validation
- verify that framework answers remain grounded in `sources/CADRE_EXPLORATOIRE_YUNES_CLEMENT_PRIMARY.md`, with page citations when needed, and that practical extrapolations are clearly labelled in both languages
