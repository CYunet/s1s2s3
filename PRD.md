# PRD

## Product name

S1 / S2 / S3 Artefact

## Product type

Interactive doctoral research artefact.

## Product purpose

The product translates a doctoral research framework into an accessible, navigable and pedagogical application for academics, practitioners and informed non-specialists.

It has a dual goal:

- preserve theoretical rigor
- increase practitioner relevance and usability

## Core research object

The artefact explores perceived value co-creation in consulting in the AI era through:

- `P1`: what is reconfigured
- `P2`: the mediating mechanism
- `P3`: the moderation conditions
- `R / P / C`: relational, processual and cognitive dimensions of perceived value
- `S1 / S2 / S3`: the observational framework

## Primary audiences

### 1. Academic audience

- thesis supervisor
- doctoral jury members
- researchers in consulting, knowledge work, AI and service research

Needs:

- conceptual clarity
- traceable alignment between theory and illustration
- disciplined vocabulary

### 2. Practitioner audience

- consultants
- consulting partners or managers
- clients of consulting firms
- innovation and transformation professionals

Needs:

- readable explanations
- applied meaning
- step-by-step interpretation of the framework in a mission setting

## Product goals

### Goal 1

Make the theoretical framework understandable without flattening its rigor.

### Goal 2

Show how the framework can be read through a fictional consulting mission.

### Goal 3

Enable users to interrogate each section, and each mission step in `Illustration`, either through the framework itself or through clearly marked practical extrapolations derived from it.

### Goal 4

Provide a bilingual artefact with coherent UX in English and French.

## Non-goals

- generic consulting education
- generic AI education
- unbounded chatbot answers that blur thesis-grounded claims and speculative advice
- production consulting tool
- literature review platform

## Information architecture

The app is structured into four sections:

1. `Why this research`
2. `Theoretical framework`
3. `Observation framework`
4. `Illustration`

## Key product features

### 1. Bilingual content

The entire artefact is available in English and French.

Requirement:

- all sections, labels, tooltips and chatbot UI states must exist in both languages

### 2. Day / night theme

The app supports readable light and dark modes.

Requirement:

- both themes must preserve contrast and legibility of dense theoretical content

### 3. Theoretical visualization

The app renders:

- the `R -> P -> C` model
- the `S1 / S2 / S3` observational framework

Requirement:

- visuals must remain faithful to the validated conceptual structure

### 4. Fictional mission timeline

The illustration section maps the framework onto a fictional consulting mission.

Requirement:

- each sub-step must clearly expose:
  - observed situation
  - proposition(s) examined
  - value dimension(s) primarily examined

### 5. Contextual glossary

Tooltips explain acronyms such as:

- `S1/S2/S3`
- `P1/P2/P3`
- `R/P/C`

Requirement:

- definitions must stay concise but theoretically exact

### 6. Contextual cloud chatbot

The chatbot must answer questions from the currently active reading section. In `Illustration`, it must also answer from the currently active mission sub-step.

Primary sources:

- `sources/CADRE_EXPLORATOIRE_YUNES_CLEMENT_PRIMARY.md` as the sole validated framework source for chatbot answers about the exploratory framework

Secondary source:

- `research/CHATBOT_CONVERSATIONS_PRODUCTION.md`, used only as a conversational corpus for prior user questions, interpretive tensions and refinement needs

Supplementary user context:

- user-uploaded text documents, treated as secondary user-provided material rather than validated research sources

Requirement:

- it must know the active reading section at the moment of questioning
- it must know the active step context when the user is in `Illustration`
- it must answer in the language currently selected in the UI
- it must answer strictly from `sources/CADRE_EXPLORATOIRE_YUNES_CLEMENT_PRIMARY.md` when the user asks what the framework says
- it must cite the exploratory framework precisely by page when answering framework-bound questions
- it must not treat the secondary chatbot conversation corpus as a validated theoretical source
- it may use uploaded documents when the user explicitly asks to read, compare or reason from them
- it must not let uploaded documents override the validated framework when answering framework-bound questions
- it may provide practical extrapolations when the user asks for implications, examples, alternative scenarios or ideas
- it must explicitly distinguish bounded theoretical inference from practical extrapolation when answering hypotheticals
- it must treat the current page and current illustration step as contextual reading cues, not as additional primary sources

### 7. Downloadable companion documents

The app must provide direct access to the complete human-readable text of the artefact.

Requirement:

- a header link must download the French Word document when the UI is in French
- a header link must download the English Word document when the UI is in English
- the link must point to manually maintained static `.docx` files
- the French static `.docx` is the deposited source document that governs the current French app text
- companion Word documents must remain language-specific and downloadable without changing the header design

## Chatbot product requirements

### Functional requirements

- display the chatbot in an independent host so opening it never changes the active reading section
- display a persistent floating AI assistant button across the app
- keep the current context implicit in the UI, while sending it to the server prompt
- when useful, let the assistant mention the active page or active illustration step naturally in the answer
- allow free-form questions
- allow `Enter` to submit and `Shift+Enter` to insert a line break
- provide suggestion chips
- support loading a small number of text-based supplementary documents into the current chatbot context
- allow removal of loaded documents before or after a question is sent
- preserve short conversation history per active page, active step and language
- support a manually maintained research corpus of selected production conversations with contextual metadata
- call a server endpoint rather than OpenAI directly from the browser
- paginate long textual blocks in the reading UI so denser source-driven copy remains readable without shrinking the type

### Theoretical guardrails

The chatbot must not:

- import outside academic concepts or citations as if they belonged to the thesis framework
- cite literature not already embedded in the artefact prompt context
- answer as if the framework were statistically validated
- confuse the observational framework with a prescriptive managerial recipe
- present practical extrapolations as findings of the research
- use prior chatbot conversations to override the validated framework

The chatbot must:

- use `P1 / P2 / P3`
- use `R / P / C`
- use `S1 / S2 / S3`
- reason from the active reading section
- reason from the active illustration step when the user is in `Illustration`
- treat the conversation corpus as secondary evidence of user interpretation, not as primary theory
- keep answers concise and avoid repeatedly reciting the active context unless it is useful
- explicitly signal when an answer goes beyond the exploratory framework

### Technical requirements

- model class: cloud LLM compatible with `gpt-5.4`
- API style: server-side OpenAI Responses API call
- secret handling: API key server-side only
- uploaded documents must be read client-side, truncated, and sent server-side only as supplementary prompt material

## UX requirements

### General

- high readability for dense theoretical content
- clear visual hierarchy
- coherent reading flow in both languages
- no major layout collisions on desktop or mobile

### Timeline

- macro-phases must remain legible at a glance
- sub-steps must be visually contained within their parent phase
- the active step must be clearly identifiable

### Chatbot

- the floating assistant button must remain visible without obstructing reading
- context must be used by the assistant without forcing a visible technical context block
- the active reading page must be passed to the chatbot request
- responses must be readable in long-form text
- responses should feel natural and practitioner-friendly, not like a repeated template
- loading and failure states must be explicit

## Content governance requirements

Any new text added to the app should satisfy both:

- supervisor-level coherence with the theoretical framework
- practitioner-level readability

That means:

- terminological consistency around `perceived value`
- clear distinction between propositions, dimensions and situations
- no hidden shift from exploratory proposition to established fact

## Technical architecture

### Frontend

- `index.html`
- `styles.css`
- `content.js`
- `app.js`

### Backend

- `api/chat.js`

### Runtime split

- static reading mode works locally
- chatbot requires deployed server mode

## Deployment requirements

### Minimum

- static asset hosting
- server route support for `/api/chat`
- environment variable support

### Environment variables

- `OPENAI_API_KEY` required
- `OPENAI_MODEL` optional, default `gpt-5.4`

## Success criteria

The artefact is successful if:

- a supervisor recognizes theoretical consistency across sections
- a practitioner can understand the main logic without prior exposure to the thesis
- the timeline clarifies how theory becomes observable in the mission
- the chatbot gives source-grounded framework answers and clearly labelled practical extrapolations
- both English and French remain coherent in content and UX
- the French and English human-readable companion documents remain aligned with the site content and are updated when documentation is updated
- the language-aware Word download provides the correct static companion document from the app header in both local and deployed modes

## Risks

### Risk 1

The chatbot may blur the boundary between framework-grounded answers and practical extrapolation.

Mitigation:

- conditional server-side instructions by user intent
- send artefact-grounded context for anchoring
- require clear labelling of practical extrapolations

### Risk 2

Theoretical compression may oversimplify propositions.

Mitigation:

- maintain a distinction between short-card summaries and long-form theory blocks

### Risk 3

Static-only deployment may create false expectations about chatbot availability.

Mitigation:

- explicit UI message when opened through `file://`
- explicit README documentation

## Open product questions

- which hosting target will be used for the production deployment of `/api/chat`?
- should conversation history persist across reloads, or remain session-only?
- should chatbot answers be exportable for pedagogical use, or remain ephemeral?
