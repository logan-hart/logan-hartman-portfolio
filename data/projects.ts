import { redEyeMetrics } from "@/data/redEyeMetrics";

export type DemoComponentKey =
  | "red-eye-workflows"
  | "red-eye-automation"
  | "cats-carousel"
  | "heartbeat"
  | "generic-motion";

export type Screenshot = {
  src: string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  description: string;
  roleLabel?: string;
  period?: string;
  engagementLabel?: string;
  tags: string[];
  metrics?: string[];
  image: string;
  featured?: boolean;
  liveUrl?: string;
  liveUrlLabel?: string;
  archivedDemoUrl?: string;
  screenshots?: Screenshot[];
  videoDemo?: string;
  interactiveDemoComponent?: DemoComponentKey;
  permissionsNote?: string;
  caseStudy?: {
    overview: string;
    problem?: string;
    constraints?: string[];
    role?: string;
    usersAndWorkflows?: string[];
    platformAreas?: string[];
    built?: string[];
    improvements?: string[];
    decisions?: string[];
    architectureNotes?: string[];
    productArtifacts?: ProductArtifact[];
    techStack?: string[];
    outcomes?: string[];
    shows?: string;
    motionNotes?: string[];
    interactionNotes?: string[];
    contributionNotes?: string[];
    lessons?: string[];
  };
};

export type ProductArtifact = {
  title: string;
  context: string;
  flow: string[];
  decision: string;
  outcome: string;
};

export const operatingManualPrinciples = [
  {
    title: "Map the real workflow",
    description:
      "I start with the people, handoffs, constraints, and moments where work breaks down.",
  },
  {
    title: "Turn ambiguity into structure",
    description:
      "I convert loose goals into user flows, product decisions, implementation plans, and usable interfaces.",
  },
  {
    title: "Ship systems people trust",
    description:
      "I care about whether the system is clear, reliable, maintainable, and practical for the people using it.",
  },
];

export const demoLibraryCards = [
  {
    title: "Red Eye workflow demos",
    label: "Workflow systems",
    description:
      "Audited Red Eye workflow evidence with product captures and an optional controlled demo app using safe fixtures.",
    href: "/work/red-eye-tickets/",
  },
  {
    title: "CATS carousel",
    label: "Design engineering",
    description:
      "A scoped interaction demo showing responsive behavior and implementation judgment without whole-site dependence.",
    href: "/demos/#cats",
  },
  {
    title: "The Heart animation",
    label: "Interaction system",
    description:
      "A restrained motion module showing how animation can support story and hierarchy.",
    href: "/demos/#heart",
  },
  {
    title: "Red Eye automation loop",
    label: "AI-assisted operations",
    description:
      "A self-contained demo of a local-first repair loop, policy gates, CI triage, and release evidence.",
    href: "/demos/#red-eye-automation",
  },
  {
    title: "Interaction pattern proof",
    label: "Design engineering",
    description:
      "A compact module for preserving interaction behavior without copying proprietary production pages.",
    href: "/demos/#motion",
  },
];

export const productThinkingArticles = [
  {
    title: "Workflow Before Interface",
    description: "Start with what people are trying to do, where they lose context, and what the system must make clear.",
  },
  {
    title: "Trust Is a Product Requirement",
    description: "Checkout, refunds, support, and check-in flows need explicit states because ambiguity creates operational cost.",
  },
  {
    title: "AI Needs Boundaries",
    description: "AI is useful when it accelerates repair, documentation, and iteration while policy and judgment stay explicit.",
  },
];

export const impactMetrics = redEyeMetrics.map(({ value, label }) => ({ value, label }));

export const proofPoints = [
  "Production ticketing platform serving 15K+ buyer identities",
  "Payments, refunds, ticketing, and admissions workflows",
  "Research visualization and technical UI refinement",
  "Stakeholder communication systems",
  "AI-assisted delivery with release gates",
];

export const projects: Project[] = [
  {
    slug: "red-eye-tickets",
    title: "Red Eye Tickets",
    category: "Event Commerce Workflow Platform",
    roleLabel: "Co-Founder & CTO",
    period: "March 2025–present",
    engagementLabel: "Production platform",
    description:
      "Built the platform behind a live ticketing business, spanning checkout, payments, admissions, producer tools, refunds, and reporting.",
    tags: ["Product Engineering", "Workflow Design", "Payments", "Operations", "Rails", "React"],
    metrics: [
      "Served 15K+ buyer identities across the platform",
      "Processed 19K+ completed orders",
      "Issued 29K+ tickets across 240+ ticketed events",
      "Handled $900K+ in gross payment volume",
      "Expanded checkout with Apple Pay and Google Pay wallet payment flows",
    ],
    image: "/images/red-eye/social-preview.webp",
    featured: true,
    interactiveDemoComponent: "red-eye-workflows",
    screenshots: [
      {
        src: "/images/red-eye/checkin-mobile-scanner-admit.webp",
        alt: "Red Eye Tickets mobile check-in scanner admit state",
        caption: "The successful scan state gives door staff an immediate, unambiguous admission decision.",
        width: 646,
        height: 1400,
      },
      {
        src: "/images/red-eye/checkin-mobile-event-menu.webp",
        alt: "Red Eye Tickets mobile check-in event menu",
        caption: "Manual entry and event controls provide a recovery path when camera scanning is unavailable or inappropriate.",
        width: 646,
        height: 1400,
      },
    ],
    permissionsNote:
      "Owned product work. The production repository and customer data remain private; this case study uses self-hosted Red Eye assets, audited product captures, and a portfolio-safe snapshot. The case remains complete when the separately deployed interactive demo is disabled or unavailable.",
    caseStudy: {
      overview:
        "Red Eye started as a ticketing business with a WordPress-based MVP. That validated demand, but it could not support the reliability, operational control, or workflow specificity the business needed. I rebuilt the product as a full-stack platform around buyers, producers, admins, and door staff.",
      problem:
        "The original stack made checkout reliability, payment options, event operations, and support work too hard to change. The business needed a system that matched live-event operations instead of forcing teams through generic commerce tools.",
      constraints: [
        "Payments, refunds, and ticket validation had to be deterministic and auditable.",
        "Door staff needed mobile workflows that worked under time pressure at live events.",
        "Producers needed useful reporting without exposing admin-level complexity.",
        "The system had to improve while real events, orders, and support issues continued running.",
      ],
      role:
        "Co-Founder and CTO responsible for product direction, architecture, full-stack implementation, payment workflows, operational tooling, and ongoing iteration with producers and event staff.",
      usersAndWorkflows: [
        "Ticket buyers: clear checkout, mobile tickets, trust, confirmations",
        "Producers: event setup, visibility, sales reporting, inventory control",
        "Admins: support tools, refunds, edits, issue resolution",
        "Door staff: fast check-in, QR scanning, mobile usability, low-friction workflows",
      ],
      platformAreas: [
        "Commerce: event listings, checkout, wallet payments, confirmations",
        "Admissions: QR tickets, scanner states, mobile check-in, entry confidence",
        "Operations: event setup, inventory, reporting, support edits",
        "Finance: refunds, payment reliability, settlement visibility",
        "Fraud and support: validation, issue resolution, operational audit trails",
        "Notifications and analytics: buyer communication, event performance, producer reporting",
      ],
      built: [
        "Custom event setup and publishing flows",
        "Checkout, wallet payments, QR ticketing, and confirmations",
        "Role-based admin and producer dashboards",
        "Refund, reporting, and support workflows",
        "Mobile check-in with scanner pause/resume and battery-saver controls",
        "Local prototype: automation that turns production reports, urgent alerts, and CI failures into bounded repair tasks",
        "Local prototype: AI-assisted triage with planner, executor, reviewer, policy gate, proof, rollback, and PR evidence artifacts",
      ],
      improvements: [
        "Served 15K+ buyer identities across 240+ ticketed events",
        "Handled $900K+ in gross payment volume",
        "Added Apple Pay and Google Pay as provider-specific checkout paths",
        "Replaced the original WordPress experience with a custom application and faster homepage delivery",
        "Processed 19K+ completed orders and issued 29K+ tickets",
        "Improved reliability and confidence for door staff working live events",
      ],
      decisions: [
        "Separated buyer-facing checkout clarity from admin-facing operational density",
        "Prioritized mobile-first check-in flows for live event conditions",
        "Built deterministic operational tools where support and money movement required trust",
        "Used AI-assisted development for prototyping, debugging, and documentation while keeping payment and ticketing logic explicit",
        "Kept automation local-first and evidence-driven so AI could prepare fixes while release decisions stayed policy-controlled",
      ],
      architectureNotes: [
        "Separated public buyer flows from producer/admin operational workflows so each surface could optimize for a different level of density and control.",
        "Modeled events as an operational lifecycle instead of a static content object: setup, approval, sales, admissions, conclusion, reporting, and archive.",
        "Kept payment, refund, and ticket validation behavior explicit because money movement and door operations needed deterministic handling.",
        "Used documentation and AI-assisted iteration to make edge cases visible before they became support problems.",
        "Prototyped a local-first automation plane where Render evidence can feed local planner/executor/reviewer passes and GitHub remains the proposed enforcement gate; this is not presented as a production-deployed repair service.",
        "The local prototype classifies repair work into deploy lanes: staged nightly fixes, urgent safe hotfixes, approval-required urgent fixes, and block/escalate outcomes.",
      ],
      productArtifacts: [
        {
          title: "Event lifecycle workflow",
          context:
            "Events moved through multiple operational states before, during, and after sales. The platform needed to make those states clear to admins and producers.",
          flow: ["Draft", "Approved", "On sale", "Live admissions", "Concluded", "Reported"],
          decision:
            "Treat event setup as a lifecycle with explicit states rather than a generic publish/unpublish toggle.",
          outcome:
            "Producers and admins had clearer expectations for what could be edited, sold, checked in, refunded, or reported at each stage.",
        },
        {
          title: "Ticket check-in workflow",
          context:
            "Door staff needed to validate tickets quickly in crowded live-event conditions while preserving confidence and reducing device strain.",
          flow: ["Producer", "Door staff", "Scanner", "Ticket validation", "Attendance reporting"],
          decision:
            "Build a mobile-first scanner with pause/resume and battery-saver controls instead of assuming continuous camera use was acceptable.",
          outcome:
            "The check-in experience became more practical for real doors, long lines, and staff who were not sitting at a desktop.",
        },
        {
          title: "Refund and support workflow",
          context:
            "Support questions often involved buyer records, payments, ticket status, event context, and producer communication.",
          flow: ["Buyer request", "Admin review", "Payment action", "Ticket status update", "Producer visibility"],
          decision:
            "Keep support actions connected to payment and ticket state so the operator could understand the consequence before making a change.",
          outcome:
            "Support workflows became easier to reason about and less dependent on manual cross-checking.",
        },
        {
          title: "Controlled repair prototype",
          context:
            "Production reports, urgent alert issues, and CI failures needed to become useful engineering tasks without allowing automation to make uncontrolled product or payment changes.",
          flow: ["Telemetry", "Task generation", "Planner", "Executor", "Reviewer", "Policy gate", "PR or escalation"],
          decision:
            "Keep automation local-first, evidence-driven, and release-gated, with every run producing plan, diff, verification, review, rollback, and impact artifacts.",
          outcome:
            "The local prototype demonstrated how bounded repairs could be prepared while preserving human control for financial, security, visual, and uncertain changes; production rollout is not claimed.",
        },
        {
          title: "CI failure intake",
          context:
            "Merge-gate failures needed to be converted into reproducible repair candidates instead of noisy action history.",
          flow: ["Failed run", "Signal extraction", "Suggested repro", "Risk flag", "Human review", "Repair task"],
          decision:
            "Parse recent failed runs into bounded tasks with suspect paths, reproduction commands, and explicit review flags before attempting changes.",
          outcome:
            "The local prototype made CI candidates easier to inspect and prioritize, especially when a failure was not safe for unattended mutation.",
        },
      ],
      techStack: [
        "Rails",
        "React",
        "Redux",
        "PostgreSQL",
        "Authorize.Net",
        "Apple Pay",
        "Google Pay",
        "QR workflows",
        "Render",
        "GitHub Actions",
        "Codex automation",
        "Local-first agent workflows",
        "AI-assisted development workflows",
      ],
      outcomes: [
        "15K+ buyer identities served",
        "19K+ completed orders processed",
        "29K+ tickets issued",
        "$900K+ gross payment volume handled",
        "240+ ticketed events supported",
        "More reliable checkout and buyer payment options",
        "Operational control for event setup, support, reporting, refunds, and check-in",
      ],
      lessons: [
        "Payment and support workflows need deterministic structure because small ambiguities become real operational costs.",
        "The best product decisions came from watching buyers, producers, admins, and door staff use the system in different live-event conditions.",
        "Performance, trust, and operational tooling mattered more than adding surface-level features.",
      ],
      shows:
        "This project shows product judgment, full-stack implementation, payment workflow thinking, and practical operational design under real business constraints.",
    },
  },
  {
    slug: "spotlight-strategies",
    title: "Spotlight Strategies",
    category: "Client Workflow & Communication Systems",
    roleLabel: "Founder",
    engagementLabel: "Self-owned client practice",
    description:
      "Turned unclear client goals into structured messaging, decision-ready artifacts, and implementation plans.",
    tags: ["Discovery", "Workflow Mapping", "Stakeholder Communication", "Implementation", "Systems Thinking"],
    image: "/images/projects/spotlight-studio.svg",
    screenshots: [
      {
        src: "/images/spotlight/spotlight-banner.webp",
        alt: "Spotlight Strategies web and brand positioning banner",
        caption: "Self-hosted Spotlight Strategies positioning banner and service-system visual.",
        width: 1800,
        height: 354,
      },
      {
        src: "/images/projects/spotlight-studio.svg",
        alt: "Spotlight Strategies discovery through implementation workflow visual",
        caption: "Case-study visual showing discovery, structure, and implementation flow.",
        width: 1280,
        height: 720,
      },
    ],
    permissionsNote:
      "Self-owned Spotlight Strategies materials. Client-specific confidential details are summarized at the workflow and deliverable level.",
    caseStudy: {
      overview:
        "Spotlight Strategies was a project-based practice for clients who needed help turning unclear goals into usable communication systems and implementation-ready plans.",
      problem:
        "Clients often arrived with scattered materials, vague positioning, and too many disconnected deliverables. The work was to clarify the decision path before designing or building anything.",
      constraints: [
        "Client inputs were often incomplete, subjective, or owned by multiple stakeholders.",
        "Deliverables had to be useful after handoff, not dependent on ongoing interpretation.",
        "Public examples needed to avoid confidential client details.",
        "The work had to connect strategy, copy, structure, and implementation without becoming a pure branding exercise.",
      ],
      role:
        "Founder responsible for discovery, positioning, content structure, visual direction, implementation planning, delivery, and client communication.",
      usersAndWorkflows: [
        "Founders and client leads: clarify the message and make decisions faster",
        "Prospective customers: understand the offer, proof, and next step",
        "Internal teams: use reusable language, decks, and web assets",
      ],
      built: [
        "Discovery workflows and message hierarchy",
        "Reusable copy, page structures, decks, and presentation systems",
        "Implementation-ready website and content plans",
        "Client-ready digital materials that connected story, design, and delivery",
      ],
      decisions: [
        "Started with audience, offer, and proof before visual styling",
        "Kept deliverables editable and reusable for clients after handoff",
        "Used AI-assisted drafting and iteration where it accelerated structure without replacing judgment",
      ],
      outcomes: [
        "Clearer client messaging and digital presence",
        "More coherent stakeholder-ready presentation materials",
        "Reusable systems for ongoing communication and engagement",
      ],
      lessons: [
        "Most client work is a workflow problem before it is a design problem.",
        "The strongest deliverables make the next decision easier for the client, not just the final screen prettier.",
      ],
      shows:
        "This work shows client-facing communication, ambiguity reduction, UX structure, and implementation planning.",
    },
  },
  {
    slug: "the-season-flyer",
    title: "The Season / Flyer",
    category: "Launch Workflow & Interaction Systems",
    roleLabel: "Design engineering contributor",
    engagementLabel: "Composite contribution case",
    description:
      "Implemented responsive launch systems for entertainment teams under firm creative, stakeholder, and release constraints.",
    tags: ["Design Engineering", "Launch Systems", "Interaction Design", "Implementation", "Stakeholders"],
    image: "/images/projects/season-flyer.svg",
    screenshots: [
      {
        src: "/images/projects/season-flyer.svg",
        alt: "Entertainment website launch system visual",
        caption: "Self-hosted visual summarizing entertainment launch, motion, and responsive implementation work.",
        width: 1280,
        height: 720,
      },
    ],
    interactiveDemoComponent: "generic-motion",
    permissionsNote:
      "Self-hosted demo modules recreate interaction patterns without relying on client-hosted production sites.",
    caseStudy: {
      overview:
        "The Season / Flyer represents implementation work for entertainment launches where approved direction, audience expectations, and release timelines all mattered.",
      problem:
        "Entertainment launch teams need pages that feel polished, adapt responsively, and survive late-stage stakeholder changes without breaking the experience.",
      constraints: [
        "Approved direction needed precise execution.",
        "Launch timelines required quick iteration without fragile implementation.",
        "Pages needed to support editors and stakeholders after launch.",
        "Portfolio evidence had to be self-hosted because production sites can change.",
      ],
      role:
        "Design engineering and interaction implementation support, translating approved direction into responsive behavior.",
      usersAndWorkflows: [
        "Marketing teams: launch and update campaign pages",
        "Producers and stakeholders: review polished, on-brand experiences",
        "Audiences: understand the show, feel the tone, and find the next action quickly",
        "Site editors: maintain content without breaking the experience",
      ],
      built: [
        "Responsive page sections",
        "Motion and interaction patterns",
        "WordPress-friendly implementation details",
        "Self-hosted recreated demos that preserve interaction proof",
      ],
      decisions: [
        "Used motion to support hierarchy instead of burying key information",
        "Balanced visual polish with maintainable launch workflows",
        "Preserved interaction proof through self-hosted demos rather than depending on live client sites",
      ],
      outcomes: [
        "Polished launch-ready entertainment pages",
        "Responsive interactions that supported approved direction",
        "Reusable self-hosted evidence of implementation contribution",
      ],
      lessons: [
        "Launch pages still have operators, editors, and approval workflows behind them.",
        "The best launch work makes the approved direction feel effortless while staying practical for teams who maintain it.",
      ],
      shows:
        "This work shows design engineering judgment and the ability to support high-visibility, stakeholder-driven launches.",
    },
  },
  {
    slug: "cats-the-jellicle-ball",
    title: "CATS: The Jellicle Ball",
    category: "Responsive Interaction System",
    roleLabel: "Design engineering contributor",
    engagementLabel: "Scoped production contribution",
    description:
      "Preserved a theatrical carousel as a responsive, self-hosted interaction demo with clear contribution boundaries.",
    tags: ["Design Engineering", "Responsive Behavior", "Interaction Design", "Implementation"],
    image: "/images/projects/cats-hero.svg",
    screenshots: [
      {
        src: "/images/cats-live/cats-combo.webp",
        alt: "CATS: The Jellicle Ball hero artwork",
        caption: "Self-hosted hero artwork from the production visual system.",
        width: 1671,
        height: 1363,
      },
      {
        src: "/images/cats-live/cats-image-2.webp",
        alt: "CATS carousel artwork",
        caption: "Carousel image treatment preserved in the self-hosted demo.",
        width: 720,
        height: 840,
      },
    ],
    interactiveDemoComponent: "cats-carousel",
    permissionsNote:
      "Permissioned portfolio case study using self-hosted copies of public production assets and a scoped recreation of the carousel interaction pattern. The self-hosted archive is canonical because the former public production URL is no longer reliable.",
    caseStudy: {
      overview:
        "This case study preserves a focused interaction contribution through a self-hosted demo based on the production carousel layout, visual system, and responsive behavior.",
      problem:
        "The work needed to preserve theatrical impact while keeping the interaction modular, responsive, and reviewable after the production site changed.",
      constraints: [
        "The public production site could change independently after launch.",
        "The demo needed to use permissioned/self-hosted assets and avoid implying ownership of the full site.",
        "Responsive behavior had to work across browser and mobile contexts.",
        "The interaction needed to support the approved direction without turning the portfolio into an entertainment microsite.",
      ],
      role:
        "Design engineering contributor responsible for the carousel interaction and responsive behavior. The broader visual direction and production site were collaborative client work.",
      usersAndWorkflows: [
        "Audience visitors: browse feature moments without losing the theatrical tone",
        "Stakeholders: preserve approved direction across desktop and mobile",
        "Site maintainers: keep interaction behavior modular and easier to update",
      ],
      contributionNotes: [
        "Design engineering implementation",
        "Carousel interaction",
        "Responsive behavior",
        "Theatrical visual direction support",
      ],
      built: [
        "Pure CSS marquee carousel with repeated image sets for a seamless loop",
        "Self-hosted production artwork and typography",
        "Responsive browser and mobile presentation based on the live site layout",
        "Self-hosted screenshots and demo fallback",
      ],
      decisions: [
        "Recreated the relevant live-site carousel section rather than embedding the full production site",
        "Scoped the production visual language to the demo so it does not leak into the rest of the portfolio",
        "Kept controls keyboard-accessible and responsive",
      ],
      lessons: [
        "For client work, the interaction pattern is often the transferable proof, not the full production page.",
        "A focused demo can preserve contribution evidence even if the external site changes later.",
      ],
      shows:
        "This project shows how I translate approved direction into precise, responsive product behavior.",
    },
  },
  {
    slug: "the-heart",
    title: "The Heart",
    category: "Purposeful Motion System",
    roleLabel: "Interaction engineering contributor",
    engagementLabel: "Archived production contribution",
    description:
      "Recreated a heartbeat motion system that supports tone and hierarchy while respecting reduced-motion preferences.",
    tags: ["Design Engineering", "Motion", "Interaction Design", "Accessibility"],
    image: "/images/projects/the-heart-homepage.svg",
    screenshots: [
      {
        src: "/images/the-heart/the-heart-splash.webp",
        alt: "The Heart homepage mockup",
        caption: "Self-hosted homepage mockup showing the page rhythm, media sections, and theatrical visual system.",
        width: 584,
        height: 2200,
      },
      {
        src: "/images/the-heart/the-heart-mark.webp",
        alt: "The Heart motion mark",
        caption: "The Heart visual mark used to preserve the heartbeat and waveform motion language.",
        width: 1800,
        height: 1643,
      },
    ],
    interactiveDemoComponent: "heartbeat",
    permissionsNote:
      "Self-hosted animation recreation using original interaction principles and approved local project assets.",
    caseStudy: {
      overview:
        "This self-hosted case study preserves the animation language and interaction logic behind a production experience without relying on an external site remaining unchanged.",
      problem:
        "The interaction needed emotional rhythm without blocking content, reducing accessibility, or becoming decorative noise.",
      constraints: [
        "Motion had to support the story rather than compete with content.",
        "The module needed reduced-motion support.",
        "The evidence had to remain reviewable even if the original production site changed.",
      ],
      role:
        "Interaction engineering contributor responsible for heartbeat timing, reveal behavior, and responsive motion. This portfolio version is a self-hosted reconstruction of that contribution.",
      usersAndWorkflows: [
        "Audience visitors: understand the emotional rhythm of the page quickly",
        "Stakeholders: see motion support the concept without overwhelming content",
        "Future reviewers: inspect preserved interaction behavior even if the live site changes",
      ],
      motionNotes: [
        "Heartbeat-style pulse timing",
        "Sequenced reveal behavior inspired by GSAP motion patterns",
        "Reduced-motion support for accessibility",
      ],
      interactionNotes: [
        "Motion supports the story without blocking content",
        "Animation states are lightweight and responsive",
        "The demo can stand alone if the external site changes",
      ],
      decisions: [
        "Used a self-hosted animation recreation instead of relying on a production link",
        "Kept reduced-motion support in place",
        "Focused on rhythm, timing, and story support over decorative complexity",
      ],
      lessons: [
        "Motion is strongest when it clarifies the story or emotional state.",
        "Self-hosted demos make motion work reviewable after production sites change.",
      ],
      shows:
        "This project shows how I use motion as a narrative and UX tool when it has a clear job.",
    },
  },
  {
    slug: "albert-einstein-college-of-medicine",
    title: "Albert Einstein College of Medicine",
    category: "Research Workflow Visualization",
    roleLabel: "Technical UI contributor",
    engagementLabel: "Scoped technical contribution",
    description:
      "Improved interface clarity, rendering behavior, and dataset loading inside an existing neuroscience visualization tool.",
    tags: ["Research Tools", "Technical UI", "Data Visualization", "Performance", "Three.js"],
    image: "/images/projects/einstein-research.svg",
    screenshots: [
      {
        src: "/images/projects/einstein-research.svg",
        alt: "Research visualization interface case-study visual",
        caption: "Self-hosted research visualization artifact with proprietary data excluded.",
        width: 1280,
        height: 720,
      },
    ],
    permissionsNote: "Project summary uses a self-hosted visualization artifact with proprietary research data excluded.",
    caseStudy: {
      overview:
        "This work refined research visualization interfaces and technical workflows used for neuroscience data exploration.",
      problem:
        "Researchers and collaborators needed to inspect dense visual data with less friction from load performance, rendering behavior, and unclear interface states.",
      constraints: [
        "The work happened inside an existing research tool rather than a blank-slate redesign.",
        "Proprietary data could not be shown publicly.",
        "Performance and accuracy mattered more than visual novelty.",
        "Changes needed to respect technical collaborators who maintained the rendering pipeline.",
      ],
      role:
        "Technical UI refinement and visualization support, improving usability, rendering behavior, and dataset load performance within an existing research tool context.",
      usersAndWorkflows: [
        "Researchers: inspect visualized neuroscience data with less interface friction",
        "Technical collaborators: maintain rendering and interface behavior",
        "Project stakeholders: evaluate progress through clearer UI states and performance improvements",
      ],
      built: [
        "Interface refinements",
        "Visualization behavior improvements",
        "Dataset loading and rendering workflow adjustments",
      ],
      decisions: [
        "Prioritized clarity and performance over decorative visualization",
        "Kept proprietary research data out of portfolio materials",
        "Improved existing workflows instead of forcing a new interface model",
      ],
      outcomes: [
        "Improved usability for research visualization workflows",
        "Better interface rendering behavior",
        "Clearer self-hosted explanation of technical contribution",
      ],
      lessons: [
        "Technical tools need UX judgment just as much as consumer-facing sites do.",
        "Improving an existing system often requires respecting the workflow already in place.",
      ],
      shows:
        "This project shows technical UI judgment, performance awareness, and respect for existing expert workflows.",
    },
  },
  {
    slug: "steve-madden",
    title: "Steve Madden",
    category: "Stakeholder Communication System",
    roleLabel: "Visual communication contributor",
    period: "SS 2022 archive",
    engagementLabel: "Historical contribution",
    description:
      "Translated product direction into decision-ready sales decks, CAD assets, packaging concepts, and stakeholder materials.",
    tags: ["Visual Communication", "Stakeholder Systems", "Presentation Design", "Product Direction"],
    image: "/images/projects/steve-madden.svg",
    screenshots: [
      {
        src: "/images/madden/madden-nyc-cover.webp",
        alt: "Steve Madden NYC sales deck cover",
        caption: "Self-hosted sales deck cover from Logan's presentation design archive.",
        width: 1800,
        height: 1391,
      },
      {
        src: "/images/madden/madden-sales-slide.webp",
        alt: "Steve Madden sales presentation slide",
        caption: "Presentation slide demonstrating product direction and sales-story structure.",
        width: 1800,
        height: 1391,
      },
      {
        src: "/images/madden/madden-brand-board.webp",
        alt: "Steve Madden brand and trend board",
        caption: "Brand and trend board used to communicate direction, tone, and merchandising context.",
        width: 1800,
        height: 1390,
      },
      {
        src: "/images/madden/madden-packaging.webp",
        alt: "Steve Madden packaging concept board",
        caption: "Packaging and merchandising concept board used for stakeholder communication.",
        width: 1800,
        height: 1390,
      },
    ],
    permissionsNote:
      "Self-owned presentation archive excerpts. Confidential business details are excluded and the case study focuses on communication craft and stakeholder workflow.",
    caseStudy: {
      overview:
        "This work translated product and brand direction into sales materials, CAD assets, packaging concepts, and stakeholder-ready decks.",
      problem:
        "Sales and product teams needed materials that made product direction clear enough for buyers, internal stakeholders, and external partners to evaluate quickly.",
      constraints: [
        "Artifacts had to be persuasive without exposing confidential business details.",
        "Different audiences needed different levels of detail and context.",
        "The work had to compress product, merchandising, and brand direction into reviewable materials.",
      ],
      role:
        "Visual communication and presentation design support across sales, packaging, CAD, and client-facing materials.",
      usersAndWorkflows: [
        "Sales teams: present product direction clearly",
        "Buyers and stakeholders: evaluate concepts quickly",
        "Internal teams: align around product, packaging, and brand details",
      ],
      built: [
        "Sales decks",
        "CAD assets",
        "Packaging concepts",
        "Client-facing visual materials",
      ],
      decisions: [
        "Prioritized clarity and stakeholder comprehension",
        "Kept confidential materials out of public portfolio artifacts",
        "Used visual hierarchy to make product direction easier to evaluate",
      ],
      outcomes: [
        "Clearer stakeholder-ready presentations",
        "More organized visual communication around product and brand direction",
        "Reusable artifacts for buyer and internal review workflows",
      ],
      lessons: [
        "Presentation design is also workflow design: the material has to help people make decisions.",
        "Visual communication skills transfer directly into product and implementation work.",
      ],
      shows:
        "This work shows communication, stakeholder translation, and the visual judgment behind decision-ready product artifacts.",
    },
  },
];

export const featuredProject = projects.find((project) => project.slug === "red-eye-tickets")!;
export const selectedProjects = projects.filter((project) =>
  [
    "red-eye-tickets",
    "spotlight-strategies",
    "albert-einstein-college-of-medicine",
    "cats-the-jellicle-ball",
  ].includes(project.slug),
).sort(
  (a, b) =>
    [
      "red-eye-tickets",
      "spotlight-strategies",
      "albert-einstein-college-of-medicine",
      "cats-the-jellicle-ball",
    ].indexOf(a.slug) -
    [
      "red-eye-tickets",
      "spotlight-strategies",
      "albert-einstein-college-of-medicine",
      "cats-the-jellicle-ball",
    ].indexOf(b.slug),
);
export const clientDemoProjects = projects.filter((project) => project.interactiveDemoComponent);

export const workGroups = [
  {
    eyebrow: "Product systems",
    title: "Operational platforms and workflow systems",
    intro:
      "Systems where the core work is understanding users, edge cases, money movement, permissions, and operational handoffs.",
    projectSlugs: ["red-eye-tickets"],
  },
  {
    eyebrow: "Design engineering",
    title: "Interaction systems under launch constraints",
    intro:
      "Focused implementation work where the important proof is interaction behavior, responsive execution, and stakeholder-ready delivery.",
    projectSlugs: ["the-season-flyer", "cats-the-jellicle-ball", "the-heart"],
  },
  {
    eyebrow: "Technical tools",
    title: "Complex information made easier to inspect",
    intro:
      "Interface and visualization refinement for technical users working with dense information and performance constraints.",
    projectSlugs: ["albert-einstein-college-of-medicine"],
  },
  {
    eyebrow: "Communication systems",
    title: "Discovery, structure, and decision-ready artifacts",
    intro:
      "Work that turns loose goals, brand direction, and client needs into usable systems for decisions and handoffs.",
    projectSlugs: ["spotlight-strategies", "steve-madden"],
  },
];

export const beforeAfterCards = [
  {
    title: "Performance",
    before: "Early WordPress-based site with slower first loads.",
    after: "Custom application architecture with faster homepage delivery.",
  },
  {
    title: "Checkout Reliability",
    before: "Higher checkout payment failure.",
    after: "Added provider-specific Apple Pay and Google Pay paths with explicit readiness and recovery behavior.",
  },
  {
    title: "Event Operations",
    before: "Limited operational tooling.",
    after:
      "Role-based dashboards, event setup, reporting, refunds, producer/admin workflows, and mobile check-in.",
  },
  {
    title: "Door Workflow",
    before: "Mobile scanner use created battery and usability concerns during events.",
    after:
      "Pause/resume and battery-saver controls reduced unnecessary camera activity during live check-in.",
  },
];

export const approachCards = [
  {
    title: "Understand the real workflow",
    description:
      "I start by mapping what users, clients, admins, and operators are actually trying to do, including where they hesitate, repeat work, make mistakes, or need confidence.",
  },
  {
    title: "Translate ambiguity into structure",
    description:
      "I turn loose goals into requirements, user flows, product decisions, content hierarchy, and implementation plans.",
  },
  {
    title: "Build for trust and adoption",
    description:
      "I care about whether people can understand, trust, and use the final product, not just whether the feature technically exists.",
  },
  {
    title: "Use AI with boundaries",
    description:
      "I use AI to accelerate prototyping, debugging, documentation, and repair loops while keeping financial, security, and release decisions explicit.",
  },
];
