# S1 / S2 / S3 Artefact

Interactive research artefact for a PhD project on perceived value co-creation in consulting in the AI era.

The application is bilingual (`EN` / `FR`) and presents:

- `Why this research`
- `Theoretical framework`
- `Observation framework`
- `Illustration`

It also includes a cloud chatbot, accessible through a floating AI assistant button, designed to answer with the current page as context without changing the active reading section: strictly from the research framework when the user asks about the framework, and with clearly marked practical extrapolation when the user asks for implications or ideas.

## What the app does

- presents the doctoral framework through a navigable artefact
- visualizes the `R -> P -> C` model and the `S1 / S2 / S3` observational framework
- illustrates the framework through a fictional consulting mission
- allows step-by-step exploration of the mission timeline
- provides glossary tooltips for `S1/S2/S3`, `P1/P2/P3` and `R/P/C`
- offers a contextual chatbot tied to the current reading section and, in `Illustration`, to the currently active mission step

## Project structure

- `index.html`: main entry point
- `styles.css`: design tokens, theming, layout, responsive behavior
- `content.js`: bilingual content, theoretical copy, timeline data, chatbot labels
- `app.js`: rendering logic, navigation, interactions, chatbot frontend
- `api/chat.js`: server endpoint calling the OpenAI Responses API
- `S1-S2-S3_Artefact.html`: synchronized standalone HTML copy
- `NOTE_ACADEMIQUE.md`: academic framing text on the research stakes, theoretical framework, observational framework, and illustrative situation
- `sources/REGENA_ATELIER_DOCTORAL_2025.md`: primary working-document source extracted and synthesized from the REGEN-A doctoral workshop deck
- `sources/originals/REGENA_ATELIER_DOCTORAL_2025.pptx`: archived original REGEN-A doctoral workshop deck
- `SUPERVISOR_COHERENCE_REPORT.md`: internal coherence review document

## Primary source library

The chatbot uses four co-primary sources:

- `NOTE_ACADEMIQUE.md` as the current conceptual anchor
- the active artefact content bundle sent by the frontend as the current-screen source of truth
- `content.js` as the exact wording and coherence source for the artefact
- `sources/REGENA_ATELIER_DOCTORAL_2025.md` as a working-document source for research trajectory, background, methodology, practitioner relevance and earlier `S1/S2/S3` reasoning

The original PowerPoint is archived in `sources/originals/REGENA_ATELIER_DOCTORAL_2025.pptx`. The chatbot uses the Markdown extraction, treated conservatively: it enriches the research background but does not override the current academic note or artefact wording.

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
- the relevant theoretical framework excerpts
- the server-loaded primary source library

It must answer:

- strictly within the framework of this research when the user asks what the framework says, asks for definitions, or asks about `P1/P2/P3`, `R/P/C` or `S1/S2/S3`
- with clearly marked practical extrapolation when the user asks for implications, alternative scenarios, examples or ideas
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
- server endpoint for OpenAI Responses API
- Vercel Web Analytics via `/_vercel/insights/script.js`
- Simple Analytics privacy-first tracking via `https://scripts.simpleanalyticscdn.com/latest.js`

Not yet included:

- deployment configuration file for a specific hosting provider
- authoring CMS
- automated tests

## Recommended next step

Before public deployment:

- choose the target hosting platform for `/api/chat`
- configure `OPENAI_API_KEY`
- run an end-to-end visual and conversational validation
- verify that framework answers remain source-grounded and that practical extrapolations are clearly labelled in both languages
