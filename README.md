# S1 / S2 / S3 Artefact

Interactive research artefact for a PhD project on perceived value co-creation in consulting in the AI era.

The application is bilingual (`EN` / `FR`) and presents:

- `Why this research`
- `Theoretical framework`
- `Observation framework`
- `Illustration`

It also includes a cloud chatbot, accessible through a floating AI assistant button, designed to answer only through the research framework used in the artefact.

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
- `SUPERVISOR_COHERENCE_REPORT.md`: internal coherence review document

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

The chatbot is intentionally constrained.

It receives:

- the current reading section (`Why this research`, `Theoretical framework`, `Observation framework`, or `Illustration`)
- the current active mission step
- the current stage
- the current situation (`S1/S2/S3`)
- the propositions associated with that step
- the value dimensions associated with that step
- the illustration overview
- the relevant theoretical framework excerpts

It must answer:

- only within the framework of this research
- in the language selected in the UI
- with priority given to the current reading section
- with priority given to the clicked mission sub-step when the user is in `Illustration`
- without introducing outside theories or concepts
- with explicit bounded inference when the user asks about a hypothetical case not directly illustrated

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
- the chatbot must remain inside this conceptual perimeter

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

Not yet included:

- deployment configuration file for a specific hosting provider
- analytics
- authoring CMS
- automated tests

## Recommended next step

Before public deployment:

- choose the target hosting platform for `/api/chat`
- configure `OPENAI_API_KEY`
- run an end-to-end visual and conversational validation
- verify that chatbot answers remain inside the research framework in both languages
