window.ARTEFACT_CONTENT = {
  ui: {
    fr: {
      htmlLang: "fr",
      mainTitle: "Les 3 sphères de la co-création de valeur du conseil à l'ère de l'IA",
      subtitle: "Les 3 sphères de la co-création de valeur du conseil à l'ère de l'IA constituent notre cadre d'observation empirique, pour illustrer comment la valeur perçue co-créée évolue dans le conseil à travers une mission fictive d'audit de plateforme digitale de 10 semaines impliquant Thomas (consultant), Marie (cliente) et une IA. L'usage de l'IA varie selon les étapes de la mission, en un continuum articulé autour de trois situations caractéristiques de co-création entre consultant, client et IA : S1 (sans IA) - S2 (IA en silo) - S3 (Co-création tripartite)",
      intro: "Cas d'illustration : une mission fictive de 10 semaines où les régimes S1, S2 et S3 se succèdent selon les étapes du conseil.",
      heroSignature: "Yunes Clément — Université de Bordeaux (France)",
      caseTitle: "📋 Cas d'illustration",
      btnTheory: "📚 Cadre Théorique",
      btnSpheres: "🔵 Les 3 Sphères",
      tlTitle: "📅 Timeline de la Mission",
      tlDesc: "Cliquez sur une phase pour voir les détails",
      theoryTitle: "📚 Cadre Théorique",
      spheresTitle: "🔵 Les 3 Sphères",
      anchorLabel: "📖 Ancrage théorique",
      diagTitle: "🔗 Diagramme R→P→C et déstabilisations IA",
      diagHint: "Tapez sur une case pour accéder à l'explication",
      tabS1: "🔵 S1 — Sans IA",
      tabS2: "🟣 S2 — IA en silo",
      tabS3: "🟢 S3 — Co-création",
      sdefault: "Sélectionnez une sphère ci-dessus",
      propsLabel: "Propositions :",
      rqLabel: "Questions de recherche",
      panelClose: "Fermer",
      themeLight: "Thème clair",
      themeDark: "Thème nuit",
      languageButton: "FR | EN",
      timelineKicker: "",
      panelTheoryEyebrow: "",
      panelSpheresEyebrow: "",
      sphereModelFigureTitle: "Les 3 sphères de co-création consultant-client-IA",
      sphereLegendConsultant: "CO = Consultant",
      sphereLegendClient: "CL = Client",
      sphereLegendAi: "IA"
    },
    en: {
      htmlLang: "en",
      mainTitle: "The 3 Spheres of Value Co-Creation in Consulting in the AI Era",
      subtitle: "The S1, S2, S3 Continuum",
      intro: "Illustrates how co-created perceived value evolves depending on the role given to AI — through a fictional 10-week digital platform audit involving Thomas (consultant), Marie (client) and an AI.",
      heroSignature: "Yunes Clément — University of Bordeaux (France)",
      caseTitle: "📋 Illustrative Case",
      btnTheory: "📚 Theoretical Framework",
      btnSpheres: "🔵 The 3 Spheres",
      tlTitle: "📅 Mission Timeline",
      tlDesc: "Click a phase to see details",
      theoryTitle: "📚 Theoretical Framework",
      spheresTitle: "🔵 The 3 Spheres",
      anchorLabel: "📖 Theoretical Anchor",
      diagTitle: "🔗 R→P→C Diagram & AI destabilisations",
      diagHint: "Tap a destabilisation box to jump to its explanation",
      tabS1: "🔵 S1 — No AI",
      tabS2: "🟣 S2 — AI in silos",
      tabS3: "🟢 S3 — Co-creation",
      sdefault: "Select a sphere above",
      propsLabel: "Propositions:",
      rqLabel: "Research questions",
      panelClose: "Close",
      themeLight: "Light theme",
      themeDark: "Night theme",
      languageButton: "FR | EN",
      timelineKicker: "",
      panelTheoryEyebrow: "",
      panelSpheresEyebrow: "",
      sphereModelFigureTitle: "The 3 spheres of consultant-client-AI co-creation",
      sphereLegendConsultant: "CO = Consultant",
      sphereLegendClient: "CL = Client",
      sphereLegendAi: "AI"
    }
  },
  caseData: {
    fr: [
      { label: "Mission", value: "Audit de plateforme digitale", color: "var(--s1)" },
      { label: "Durée", value: "10 semaines", color: "var(--s2)" },
      { label: "Client", value: "Marie (Directrice TechX)", color: "var(--p1)" },
      { label: "Consultant", value: "Thomas", color: "var(--p2)" }
    ],
    en: [
      { label: "Mission", value: "Digital Platform Audit", color: "var(--s1)" },
      { label: "Duration", value: "10 weeks", color: "var(--s2)" },
      { label: "Client", value: "Marie (Director, TechX)", color: "var(--p1)" },
      { label: "Consultant", value: "Thomas", color: "var(--p2)" }
    ]
  },
  phases: {
    fr: [
      {
        num: 1,
        icon: "🔄",
        label: "S1+S2",
        name: "Exploration",
        dur: "Sem 1-2",
        title: "Semaines 1-2 : Exploration Terrain",
        desc: "Phase découverte combinant S1 (entretiens) et S2 (traitement IA masqué).",
        ex: "<strong>S1 :</strong> 12 entretiens avec les cadres dirigeants de TechX.<br><strong>S2 :</strong> Synthèse IA des entretiens — masqué à Marie.",
        props: [
          "P1 (Relationnelle) : S1 ancre la légitimité — fondation relationnelle conditionnant toute co-création ultérieure",
          "P2 : Transparence nulle en S2 — quel effet si découverte ?",
          "P3 : Niveau de référence AI literacy du client à établir"
        ]
      },
      {
        num: 2,
        icon: "🔒",
        label: "S2",
        name: "Analyse",
        dur: "Sem 3",
        title: "Semaine 3 : Analyse Préliminaire",
        desc: "Structuration des données et cartographie IA — consultant seul.",
        ex: "<strong>S2 solo :</strong> Thomas utilise l'IA pour structurer les données et créer des catégories analytiques.",
        props: [
          "P1 (Processuelle) : client exclu — valeur processuelle absente",
          "P2 : Aucune médiation substantielle déployée",
          "P3 : Attribution 100% consultant par défaut"
        ]
      },
      {
        num: 3,
        icon: "🤖",
        label: "S3",
        name: "Co-création",
        dur: "Sem 4-6",
        title: "Semaines 4-6 : Analyse Collaborative",
        desc: "Co-création tripartite — transparence maximale — fenêtre d'observation centrale.",
        ex: "<strong>S3 :</strong> Thomas prompt l'IA de manière visible, Marie challenge les outputs, recommandations co-construites.",
        props: [
          "P1 : Les 3 dimensions (R, P, C) se reconfigurent-elles simultanément ? Observable ici",
          "P2 : Transparence substantielle déployée — l'explicitation renforce-t-elle la valeur perçue ?",
          "P3 : L'AI literacy de Marie modère-t-elle l'attribution correcte des contributions ?"
        ]
      },
      {
        num: 4,
        icon: "⚡",
        label: "S2+S3",
        name: "Revue",
        dur: "Sem 7-8",
        title: "Semaines 7-8 : Revue",
        desc: "Alternance simulations S2 et validation collective S3.",
        ex: "<strong>S2 :</strong> Thomas réalise des simulations de scénarios en solo.<br><strong>S3 :</strong> Sessions de validation collective avec Marie.",
        props: [
          "P1 (Cognitive+Processuelle) : l'alternance de régime affecte-t-elle la richesse des connaissances ?",
          "P2 : Transparence maintenue à travers les transitions de régime ?",
          "P3 : Stabilité de l'attribution testée sur l'alternance S2/S3"
        ]
      },
      {
        num: 5,
        icon: "🔒",
        label: "S1+S2",
        name: "Prép. COMEX",
        dur: "Sem 9",
        title: "Semaine 9 : Préparation COMEX",
        desc: "Usage IA parallèle — sans session conjointe.",
        ex: "Thomas finalise les recommandations avec l'IA. Marie prépare indépendamment sa présentation avec l'IA.",
        props: [
          "P1 (Relationnelle) : l'usage IA parallèle mais séparé affecte-t-il la légitimité relationnelle ?",
          "P2 : Aucune transparence substantielle entre les parties — chacun en silo S2",
          "P3 : Marie peut-elle défendre un processus qu'elle ne connaît que partiellement ?"
        ]
      },
      {
        num: 6,
        icon: "🎯",
        label: "S1",
        name: "COMEX",
        dur: "Sem 10",
        title: "Semaine 10 : Présentation COMEX",
        desc: "Moment politique pur — IA entièrement absente.",
        ex: "<strong>S1 pur :</strong> Thomas et Marie face aux décideurs. Aucune IA utilisée.",
        props: [
          "P1 (Relationnelle) : test de légitimité maximale — l'ancrage S1 initial tient-il ?",
          "P2 : La transparence substantielle S3 antérieure conditionne la capacité de défense de Marie",
          "P3 : Le COMEX peut utiliser l'IA pour contre-analyser les recommandations (voir phase 7)"
        ]
      },
      {
        num: 7,
        icon: "⚠️",
        label: "Post",
        name: "Post-COMEX",
        dur: "Post",
        title: "Semaine Post-COMEX : Évaluation Rétrospective",
        desc: "Les membres du COMEX challengent les recommandations avec leur propre IA.",
        ex: "Si Thomas et Marie ont co-créé en S3 (semaines 4-6), Marie peut défendre la robustesse méthodologique. Sans S3 préalable, elle ne peut pas défendre ce qu'elle ne connaît pas.",
        props: [
          "P1 (Relationnelle) : la légitimité construite tout au long de la mission résiste-t-elle aux contre-analyses IA ?",
          "P2 : La transparence substantielle S3 antérieure agit comme protection rétroactive",
          "P3 : L'AI literacy du client (Marie + membres COMEX) détermine si les contre-analyses sont des menaces crédibles"
        ]
      }
    ],
    en: [
      {
        num: 1,
        icon: "🔄",
        label: "S1+S2",
        name: "Exploration",
        dur: "Wk 1-2",
        title: "Weeks 1-2: Field Exploration",
        desc: "Discovery combining S1 interviews and S2 masked AI processing.",
        ex: "<strong>S1:</strong> 12 interviews with TechX executives.<br><strong>S2:</strong> AI synthesis of transcripts — masked from Marie.",
        props: [
          "P1 (Relational): S1 anchors legitimacy — the relational foundation for all subsequent co-creation",
          "P2: Zero transparency in S2 — what effect if discovered later?",
          "P3: Client AI literacy baseline to establish"
        ]
      },
      {
        num: 2,
        icon: "🔒",
        label: "S2",
        name: "Analysis",
        dur: "Wk 3",
        title: "Week 3: Preliminary Analysis",
        desc: "Data structuring and AI mapping — consultant alone, no client visibility.",
        ex: "<strong>Solo S2:</strong> Thomas uses AI to structure data and create analytical categories.",
        props: [
          "P1 (Processual): client excluded — processual value absent",
          "P2: No substantive mediation deployed",
          "P3: 100% consultant attribution by default"
        ]
      },
      {
        num: 3,
        icon: "🤖",
        label: "S3",
        name: "Co-creation",
        dur: "Wk 4-6",
        title: "Weeks 4-6: Collaborative Analysis",
        desc: "Tripartite co-creation — maximum transparency — core observational window.",
        ex: "<strong>S3:</strong> Thomas prompts AI visibly, Marie challenges outputs, recommendations co-constructed.",
        props: [
          "P1: Do all 3 dimensions (R, P, C) reconfigure simultaneously? Observable here",
          "P2: Substantive transparency deployed — does explicitation strengthen perceived value?",
          "P3: Does Marie's AI literacy moderate correct attribution of contributions?"
        ]
      },
      {
        num: 4,
        icon: "⚡",
        label: "S2+S3",
        name: "Review",
        dur: "Wk 7-8",
        title: "Weeks 7-8: Review",
        desc: "Alternating S2 simulations and S3 collective validation.",
        ex: "<strong>S2:</strong> Thomas runs scenario simulations solo.<br><strong>S3:</strong> Collective validation sessions with Marie.",
        props: [
          "P1 (Cognitive+Processual): does alternating regime affect knowledge richness?",
          "P2: Transparency maintained across regime transitions?",
          "P3: Attribution stability tested across S2/S3 alternation"
        ]
      },
      {
        num: 5,
        icon: "🔒",
        label: "S1+S2",
        name: "COMEX Prep",
        dur: "Wk 9",
        title: "Week 9: COMEX Preparation",
        desc: "Parallel AI use — no joint session.",
        ex: "Thomas finalises recommendations with AI. Marie independently prepares her presentation with AI.",
        props: [
          "P1 (Relational): does parallel but separate AI use affect relational legitimacy?",
          "P2: No substantive transparency between parties — each in S2 silo",
          "P3: Can Marie defend a process she only partially knows?"
        ]
      },
      {
        num: 6,
        icon: "🎯",
        label: "S1",
        name: "COMEX",
        dur: "Wk 10",
        title: "Week 10: COMEX Presentation",
        desc: "Pure political moment — AI entirely absent.",
        ex: "<strong>Pure S1:</strong> Thomas and Marie face decision-makers. No AI used.",
        props: [
          "P1 (Relational): maximum legitimacy test — does prior S1 anchoring hold?",
          "P2: Prior S3 transparency conditions Marie's ability to defend",
          "P3: COMEX may use AI to counter-analyse recommendations (see phase 7)"
        ]
      },
      {
        num: 7,
        icon: "⚠️",
        label: "Post",
        name: "Post-COMEX",
        dur: "Post",
        title: "Post-COMEX: Retrospective Assessment",
        desc: "COMEX members challenge recommendations using their own AI.",
        ex: "If Thomas and Marie co-created in S3 (weeks 4-6), Marie can defend methodological robustness. Without prior S3, she cannot defend what she does not know.",
        props: [
          "P1 (Relational): does legitimacy built across the mission survive external AI counter-analysis?",
          "P2: Prior substantive transparency (S3) acts as retroactive protection",
          "P3: Client AI literacy (Marie + COMEX) determines whether counter-analyses are credible threats"
        ]
      }
    ]
  },
  theory: {
    fr: [
      {
        title: "Proposition 1 (P1) – Reconfiguration multidimensionnelle de la valeur perçue",
        intro: "L'intégration de l'IA dans les missions de conseil reconfigure la valeur perçue par le client selon trois dimensions interdépendantes :",
        dims: [
          {
            icon: "🤝",
            label: "Valeur relationnelle",
            text: "légitimité du consultant, activement produite par des activités de valorisation — activités dont la visibilité et la crédibilité sont perturbées lorsque l'IA médie l'interaction. Des données empiriques issues de contextes grand public suggèrent que l'usage de l'IA affecte la crédibilité perçue en fonction de la modalité de divulgation (Bourgoin, 2014 ; Raisch & Krakowski, 2020 ; Khan & Mishra, 2024)"
          },
          {
            icon: "⚙️",
            label: "Valeur processuelle",
            text: "l'expérience de résolution conjointe de problèmes et de dialogue itératif entre consultant et client — son rythme, sa texture émotionnelle et la distribution des rôles — reconfigurée lorsque l'IA entre comme troisième acteur doté d'une agence déléguable (Grönroos & Voima, 2013 ; Baird & Maruping, 2021)"
          },
          {
            icon: "💡",
            label: "Valeur cognitive",
            text: "nouvelles connaissances managériales et capacités co-créées dans la relation de conseil, dont la diversité et la nouveauté sont amplifiées par la générativité de l'IA — mais dont la paternité devient contestée (Turner, 1982 ; Ciampi, 2017 ; Harfouche et al., 2023)"
          }
        ],
        note: "Ces trois dimensions suivent une séquence primaire — <strong>Relationnelle → Processuelle → Cognitive</strong> — avec une boucle de rétroaction fondée (Processuelle → Relationnelle), valide avec ou sans IA.<br><br><span id='td1'></span>① <strong>R→P fragilisée :</strong> en S2 (usage IA masqué), la légitimité repose sur une fondation invisible pour le client. Si découverte, l'engagement processuel est rétrospectivement délégitimé. La transparence (P2) est le mécanisme protecteur.<br><br><span id='td2'></span>② <strong>P→C découplée :</strong> l'IA peut livrer des outputs cognitifs sans engagement processuel réel. C'est structurellement nouveau et spécifique à l'intégration de l'IA.<br><br><span id='td3'></span>③ <strong>Rétroaction P→R risque d'inversion :</strong> des outputs IA remarquables peuvent être attribués à l'IA plutôt qu'au consultant. L'AI literacy du client, l'aversion à l'algorithme et la lisibilité des contributions (P3) sont les conditions modératrices.<br><br><strong>Condition limite :</strong> lorsque P2 et P3 échouent simultanément, les trois relations s'effondrent, déclenchant la co-destruction de valeur (Plé & Cáceres, 2010 ; Lumivalo et al., 2024).",
        anchor: "SDL (Vargo & Lusch, 2004, 2016) · Co-création de valeur (Grönroos & Voima, 2013) · Nature cognitive du conseil (Turner, 1982 ; Ciampi, 2017) · Augmentation de la connaissance (Harfouche et al., 2023) · Production de légitimité (Bourgoin, 2014) · Chaîne relationnelle (Rivière & Mencarelli, 2012) · Floutage des contributions (Raisch & Krakowski, 2020) · Usage IA et crédibilité perçue (Khan & Mishra, 2024) · IA comme acteur agentique (Baird & Maruping, 2021) · Co-destruction comme condition limite (Plé & Cáceres, 2010 ; Lumivalo et al., 2024)"
      },
      {
        title: "Proposition 2 (P2) – Médiation épistémique et transparence substantielle",
        intro: "La transparence sur l'usage de l'IA constitue le mécanisme médiateur central entre intégration de l'IA et valeur perçue. Elle opère à deux niveaux distincts :",
        dims: [
          {
            icon: "📢",
            label: "Transparence performative",
            text: "divulgation de l'usage de l'IA, favorisant une confiance procédurale limitée — nécessaire mais insuffisante"
          },
          {
            icon: "🔍",
            label: "Transparence substantielle (médiation épistémique)",
            text: "explicitation par le consultant du processus de génération, des limites et de la contextualisation des outputs IA — condition d'une appropriation cognitive forte et d'une attribution lisible (P3). Des données empiriques convergentes suggèrent que la modalité de divulgation conditionne la crédibilité perçue des outputs IA (Khan & Mishra, 2024)."
          }
        ],
        note: "L'effet de la transparence sur la valeur perçue n'est pas linéaire : la transparence performative seule peut réduire la valeur perçue si elle n'est pas accompagnée d'une médiation substantielle.",
        anchor: "Limites de la transparence algorithmique (Ananny & Crawford, 2018) · Transparence organisationnelle (Albu & Flyverbom, 2019) · Théorie de l'agence épistémique (Origgi, 2022) · Usage IA et crédibilité perçue (Khan & Mishra, 2024)"
      },
      {
        title: "Proposition 3 (P3) – Conditions modératrices de l'attribution",
        intro: "L'effet protecteur de la transparence (P2) n'est pas inconditionnel. Trois catégories de contingence déterminent si la transparence produit effectivement une attribution correcte :",
        dims: [
          {
            icon: "🏛️",
            label: "Contingences relationnelles (littérature pré-IA)",
            text: "le capital de confiance préalable et l'historique relationnel conditionnent la réception des divulgations de transparence (Bourgoin, 2014 ; Rivière & Mencarelli, 2012)."
          },
          {
            icon: "📍",
            label: "Contingences situationnelles (littérature pré-IA)",
            text: "la phase de mission et les enjeux politiques conditionnent si la transparence est déployée et reçue de manière appropriée. L'aversion à l'algorithme — méfiance envers les outputs algorithmiques même objectivement supérieurs (Dietvorst et al., 2015) — opère également à ce niveau : déclenchée situationnellement et indépendante de l'AI literacy."
          },
          {
            icon: "🎓",
            label: "Contingence actorielle — AI literacy du client (cette thèse)",
            text: "la maîtrise conceptuelle préalable de l'IA par le client conditionne directement si les divulgations transparentes peuvent être correctement interprétées. L'AI literacy (compétence) et l'aversion à l'algorithme (attitude) sont théoriquement indépendantes — les deux conditionnent l'attribution par des mécanismes distincts (Long & Magerko, 2020 ; Dietvorst et al., 2015)."
          }
        ],
        noteRed: true,
        note: "<strong>Sélection justifiée de la contingence focale :</strong> (1) Originalité théorique — l'AI literacy du client comme contingence de l'efficacité de la transparence est nouvelle et absente des cadres existants. (2) Tractabilité méthodologique — observable dans un seul cas qualitatif exploratoire.<br><br>⚠️ Lorsque l'AI literacy est faible et l'aversion à l'algorithme élevée, le mécanisme de P2 échoue même correctement déployé. Lorsque l'AI literacy est faible et la lisibilité insuffisante, le biais d'automatisation domine. Les deux constituent des voies d'entrée dans la co-destruction de valeur (Plé & Cáceres, 2010 ; Lumivalo et al., 2024).",
        anchor: "Théorie de la contingence (Lawrence & Lorsch, 1967 ; Donaldson, 2001) · Floutage des contributions (Raisch & Krakowski, 2020) · Attribution de valeur dans le conseil (Bourgoin, 2014) · Chaîne relationnelle de confiance (Rivière & Mencarelli, 2012) · AI literacy (Long & Magerko, 2020) · Aversion à l'algorithme (Dietvorst et al., 2015) · Biais d'automatisation (Skitka et al., 1999)"
      },
      {
        title: "Implication managériale — Orchestration dynamique S1/S2/S3",
        intro: "P1, P2 et P3 convergent vers une implication managériale centrale : la valeur perçue résulte de l'orchestration temporelle des régimes de co-création, en fonction :",
        dims: [
          {
            icon: "📅",
            label: "Des phases de la mission",
            text: "découverte (S1 pour l'ancrage relationnel), analyse (S2/S3 pour la valeur cognitive), validation stratégique (retour S1 pour l'autorité décisionnelle)"
          },
          {
            icon: "🎯",
            label: "Des attentes du client",
            text: "appétence pour la co-construction, niveau de contrôle souhaité, culture organisationnelle et AI literacy"
          },
          {
            icon: "⚖️",
            label: "Des enjeux de transparence et d'attribution",
            text: "chaque transition de régime renforce (P2) ou érode (P3) la valeur perçue — l'orchestration est un acte de médiation épistémique autant que managérial"
          }
        ],
        note: "Les transitions entre régimes génèrent des coûts cognitifs et relationnels asymétriques (S1→S3 > S3→S1). Une orchestration mal gérée active les conditions de co-destruction (Plé & Cáceres, 2010).",
        anchor: "Sphère de co-création (Grönroos & Voima, 2013) · Délégation à l'IA agentique (Baird & Maruping, 2021) · Co-destruction comme condition limite (Plé & Cáceres, 2010 ; Lumivalo et al., 2024)"
      }
    ],
    en: [
      {
        title: "Proposition 1 (P1) – Multidimensional Reconfiguration of Perceived Value",
        intro: "The integration of AI into consulting missions reconfigures client perceived value along three interdependent dimensions:",
        dims: [
          {
            icon: "🤝",
            label: "Relational Value",
            text: "consultant legitimacy, actively produced through valuation activities — activities whose visibility and credibility are disrupted when AI mediates the interaction. Empirical evidence from adjacent consumer contexts suggests that AI use affects perceived credibility as a function of disclosure modality (Bourgoin, 2014 ; Raisch & Krakowski, 2020 ; Khan & Mishra, 2024)"
          },
          {
            icon: "⚙️",
            label: "Processual Value",
            text: "the experience of joint problem-solving and iterative dialogue between consultant and client — its rhythm, emotional texture and role distribution — reshaped when AI enters as a third actor with delegable agency (Grönroos & Voima, 2013 ; Baird & Maruping, 2021)"
          },
          {
            icon: "💡",
            label: "Cognitive Value",
            text: "new managerial knowledge and capabilities co-created through the consulting relationship, whose diversity and novelty are amplified by AI generativity — but whose authorship becomes contested (Turner, 1982 ; Ciampi, 2017 ; Harfouche et al., 2023)"
          }
        ],
        note: "These three dimensions follow a primary sequence — <strong>Relational → Processual → Cognitive</strong> — with one grounded feedback loop (Processual → Relational), valid with or without AI.<br><br><span id='td1'></span>① <strong>R→P becomes fragile:</strong> in S2 (masked AI use), relational legitimacy rests on a foundation invisible to the client. If discovered, processual engagement is retrospectively delegitimised. Transparency (P2) is the protective mechanism.<br><br><span id='td2'></span>② <strong>P→C becomes decoupled:</strong> AI can deliver cognitive outputs without genuine processual engagement — the client receives knowledge without having co-produced it. Structurally new and specific to AI integration.<br><br><span id='td3'></span>③ <strong>P→R feedback risks inversion:</strong> spectacular AI outputs may be attributed to AI rather than to the consultant's orchestration. Client AI literacy, algorithm aversion, and contribution readability (P3) are the moderating conditions.<br><br><strong>Boundary condition:</strong> when P2 and P3 fail simultaneously, all three relationships collapse, triggering value co-destruction (Plé & Cáceres, 2010 ; Lumivalo et al., 2024).",
        anchor: "SDL (Vargo & Lusch, 2004, 2016) · Value co-creation (Grönroos & Voima, 2013) · Cognitive nature of consulting (Turner, 1982 ; Ciampi, 2017) · Knowledge augmentation (Harfouche et al., 2023) · Legitimacy production (Bourgoin, 2014) · Relational value chain (Rivière & Mencarelli, 2012) · Blurring of contributions (Raisch & Krakowski, 2020) · AI and perceived credibility (Khan & Mishra, 2024) · AI as agentic actor (Baird & Maruping, 2021) · Co-destruction as boundary condition (Plé & Cáceres, 2010 ; Lumivalo et al., 2024)"
      },
      {
        title: "Proposition 2 (P2) – Epistemic Mediation and Substantive Transparency",
        intro: "Transparency regarding AI use constitutes the central mediating mechanism between AI integration and perceived value. It operates at two distinct levels:",
        dims: [
          {
            icon: "📢",
            label: "Performative Transparency",
            text: "disclosure of AI use, fostering limited procedural trust — necessary but insufficient"
          },
          {
            icon: "🔍",
            label: "Substantive Transparency (epistemic mediation)",
            text: "the consultant's explicitation of the generation process, limitations and contextualisation of AI outputs — condition for strong cognitive appropriation and legible attribution (P3). Convergent empirical evidence suggests disclosure modality significantly conditions perceived credibility (Khan & Mishra, 2024)."
          }
        ],
        note: "The effect of transparency on perceived value is not linear: performative transparency alone may reduce perceived value if not accompanied by substantive mediation.",
        anchor: "Limits of algorithmic transparency (Ananny & Crawford, 2018) · Organisational transparency (Albu & Flyverbom, 2019) · Theory of epistemic agency (Origgi, 2022) · AI disclosure and perceived credibility (Khan & Mishra, 2024)"
      },
      {
        title: "Proposition 3 (P3) – Moderating Conditions on Attribution",
        intro: "The protective effect of transparency (P2) is not unconditional. Three categories of contingency determine whether transparency produces correct attribution:",
        dims: [
          {
            icon: "🏛️",
            label: "Relational contingencies (pre-AI consulting literature)",
            text: "prior trust capital and relational history condition how transparency disclosures are received (Bourgoin, 2014 ; Rivière & Mencarelli, 2012)."
          },
          {
            icon: "📍",
            label: "Situational contingencies (pre-AI consulting literature)",
            text: "mission phase and political stakes condition whether transparency is deployed and received appropriately. Algorithm aversion — distrust of algorithmic outputs even when objectively superior (Dietvorst et al., 2015) — also operates at this level: situationally triggered and independent of AI literacy."
          },
          {
            icon: "🎓",
            label: "Actor-level contingency — Client AI literacy (this thesis)",
            text: "the client's prior conceptual mastery of AI directly conditions whether transparent disclosures can be interpreted correctly. AI literacy (competence) and algorithm aversion (attitude) are theoretically independent — both condition attribution through distinct mechanisms (Long & Magerko, 2020 ; Dietvorst et al., 2015)."
          }
        ],
        noteRed: true,
        note: "<strong>Justified selection of focal contingency:</strong> (1) Theoretical originality — client AI literacy as a contingency on transparency effectiveness is novel and absent from existing frameworks. (2) Methodological tractability — observable within a single exploratory qualitative case, unlike relational or situational contingencies.<br><br>⚠️ When AI literacy is low and algorithm aversion high, P2's mechanism fails even when correctly deployed. When AI literacy is low and readability weak, automation bias dominates. Both are entry points into value co-destruction (Plé & Cáceres, 2010 ; Lumivalo et al., 2024).",
        anchor: "Contingency theory (Lawrence & Lorsch, 1967 ; Donaldson, 2001) · Blurring of contributions (Raisch & Krakowski, 2020) · Value attribution in consulting (Bourgoin, 2014) · Relational trust chain (Rivière & Mencarelli, 2012) · AI literacy (Long & Magerko, 2020) · Algorithm aversion (Dietvorst et al., 2015) · Automation bias (Skitka et al., 1999)"
      },
      {
        title: "Managerial Implication — Dynamic S1/S2/S3 Orchestration",
        intro: "P1, P2 and P3 converge toward a central managerial implication: perceived value results from the consultant's temporal orchestration of co-creation regimes, depending on:",
        dims: [
          {
            icon: "📅",
            label: "Mission Phases",
            text: "discovery (S1 for relational anchoring), analysis (S2/S3 for cognitive value), strategic validation (return to S1 for decisional authority)"
          },
          {
            icon: "🎯",
            label: "Client Expectations",
            text: "appetite for co-construction, desired control level, organisational culture and AI literacy"
          },
          {
            icon: "⚖️",
            label: "Transparency and Attribution Stakes",
            text: "each regime transition reinforces (P2) or erodes (P3) perceived value — orchestration is an act of epistemic mediation as much as a managerial one"
          }
        ],
        note: "Regime transitions generate asymmetric cognitive and relational costs (S1→S3 > S3→S1). Poorly managed orchestration activates co-destruction conditions (Plé & Cáceres, 2010).",
        anchor: "Co-creation sphere (Grönroos & Voima, 2013) · Delegation to agentic AI (Baird & Maruping, 2021) · Co-destruction as boundary condition (Plé & Cáceres, 2010 ; Lumivalo et al., 2024)"
      }
    ]
  },
  spheres: {
    fr: {
      s1: {
        title: "🔵 S1 — Conseil sans IA",
        color: "#f59e0b",
        secs: [
          {
            l: "📌 Configuration",
            t: "Interaction consultant-client traditionnelle, sans IA générative. La médiation est exclusivement humaine."
          },
          {
            l: "📋 Marie-Thomas (Sem. 1-2)",
            t: "Entretiens face-à-face avec les cadres dirigeants de TechX. Permet d'observer la construction de la confiance relationnelle initiale sans médiation technologique."
          },
          {
            l: "✅ Exemples",
            t: "Entretiens découverte · Négociations sensibles · Présentation COMEX"
          }
        ],
        rq: "P1 : Construction confiance et légitimité en phase découverte"
      },
      s2: {
        title: "🟣 S2 — IA en silo",
        color: "#8b5cf6",
        secs: [
          {
            l: "📌 Configuration",
            t: "Consultant et client utilisent chacun l'IA dans leur propre sphère, sans coordination ni visibilité mutuelle."
          },
          {
            l: "📋 Marie-Thomas (Sem. 3)",
            t: "Thomas structure les entretiens avec l'IA ; Marie prépare ses questions avec l'IA. Leurs outputs ne sont pas confrontés."
          },
          {
            l: "✅ Exemples",
            t: "Préparation solo avec IA · Structuration parallèle · Hypothèses non confrontées"
          }
        ],
        rq: "P2 : Quel impact de l'absence de coordination sur la valeur perçue ?\nP3 : Comment s'opère l'attribution quand chaque partie a ses propres outputs IA ?"
      },
      s3: {
        title: "🟢 S3 — Co-création tripartite",
        color: "#10b981",
        secs: [
          {
            l: "📌 Configuration",
            t: "Configuration collaborative : consultant, client ET IA comme acteurs simultanés et visibles. Transparence substantielle totale."
          },
          {
            l: "📋 Marie-Thomas (Sem. 4-6)",
            t: "Sessions hebdomadaires tripartites : Thomas prompt l'IA de manière visible, Marie challenge les outputs, co-construction en temps réel."
          },
          {
            l: "✅ Exemples",
            t: "Ateliers collaboratifs tripartites · Consultant prompt IA en direct · Validation collective"
          }
        ],
        rq: "P1 : Les 3 dimensions de valeur perçue sont-elles reconfigurées ?\nP2 : La transparence substantielle influence-t-elle la valeur perçue ?\nP3 : Comment s'opère l'attribution entre consultant et IA ?"
      }
    },
    en: {
      s1: {
        title: "🔵 S1 — Consulting without AI",
        color: "#f59e0b",
        secs: [
          {
            l: "📌 Configuration",
            t: "Traditional consultant-client interaction, no generative AI. Mediation is exclusively human."
          },
          {
            l: "📋 Marie-Thomas (Wk. 1-2)",
            t: "Face-to-face interviews with TechX executives. Enables observation of initial relational trust-building without technological mediation."
          },
          {
            l: "✅ Examples",
            t: "Discovery interviews · Sensitive negotiations · COMEX presentation"
          }
        ],
        rq: "P1: Trust and legitimacy building in the discovery phase"
      },
      s2: {
        title: "🟣 S2 — AI in silos",
        color: "#8b5cf6",
        secs: [
          {
            l: "📌 Configuration",
            t: "Consultant and client each use AI in their own sphere, without coordination or mutual visibility."
          },
          {
            l: "📋 Marie-Thomas (Wk. 3)",
            t: "Thomas structures interviews with AI; Marie prepares questions with AI. Their outputs are not confronted."
          },
          {
            l: "✅ Examples",
            t: "Solo AI preparation · Parallel data structuring · Non-confronted hypotheses"
          }
        ],
        rq: "P2: Impact of absent coordination on perceived value?\nP3: Attribution when each party has their own AI outputs?"
      },
      s3: {
        title: "🟢 S3 — Tripartite Co-creation",
        color: "#10b981",
        secs: [
          {
            l: "📌 Configuration",
            t: "Collaborative configuration: consultant, client AND AI as simultaneous, visible actors. Full substantive transparency."
          },
          {
            l: "📋 Marie-Thomas (Wk. 4-6)",
            t: "Weekly tripartite sessions: Thomas visibly prompts AI, Marie challenges outputs, real-time co-construction."
          },
          {
            l: "✅ Examples",
            t: "Collaborative workshops · Consultant prompts AI live · Client challenges outputs"
          }
        ],
        rq: "P1: Are the 3 dimensions of perceived value effectively reconfigured?\nP2: Does substantive transparency influence perceived value?\nP3: How does attribution operate between consultant and AI?"
      }
    }
  }
};
