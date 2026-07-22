import { careerFacts } from "@/data/careerFacts";
import { redEyeMetrics } from "@/data/redEyeMetrics";

const redEyeFacts = careerFacts.redEye;

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
  caseStudyPresentation?: "standard" | "creative-compact";
  description: string;
  roleLabel?: string;
  period?: string;
  engagementLabel?: string;
  launchLabel?: string;
  statusLabels: string[];
  demoStatus?: string;
  tags: string[];
  metrics?: string[];
  image: string;
  imageAlt: string;
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
    discovery?: {
      intro: string;
      channels: Array<{ title: string; description: string }>;
    };
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
    secondaryArtifacts?: Array<ProductArtifact & { status: string; evidenceLimit?: string }>;
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
  `Production ticketing platform serving ${redEyeFacts.metrics.buyerIdentities.value} buyer identities`,
  "Payments, refunds, ticketing, and admissions workflows",
  "Research visualization and technical UI refinement",
  "Visual communication for product and sales teams",
  "AI-assisted delivery with release gates",
];

export const projects: Project[] = [
  {
    slug: "red-eye-tickets",
    title: "Red Eye Tickets",
    category: "Event Commerce Workflow Platform",
    roleLabel: "Co-Founder & CTO",
    period: careerFacts.redEye.rolePeriod,
    engagementLabel: "Production platform",
    launchLabel: `Custom platform launched ${careerFacts.redEye.customPlatformLaunchLabel}`,
    statusLabels: ["Production", "Owned product"],
    demoStatus: "Captured production evidence",
    description:
      "Built the platform behind a live ticketing business, spanning checkout, payments, admissions, producer tools, refunds, and reporting.",
    tags: ["Product Engineering", "Workflow Design", "Payments", "Operations", "Rails", "React"],
    metrics: [
      `Served ${redEyeFacts.metrics.buyerIdentities.value} buyer identities across the platform`,
      `Processed ${redEyeFacts.metrics.completedOrders.value} completed orders`,
      `Issued ${redEyeFacts.metrics.ticketsIssued.value} tickets across ${redEyeFacts.metrics.ticketedEvents.value} ticketed events`,
      `Processed ${redEyeFacts.metrics.grossPaymentVolume.value} in gross payment volume since the ${redEyeFacts.customPlatformLaunchLabel} custom-platform launch`,
      "Expanded checkout with Apple Pay and Google Pay wallet payment flows",
    ],
    image: "/images/red-eye/footer-logo-on-black.webp",
    imageAlt: "Red Eye Tickets footer logo on a black background",
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
      discovery: {
        intro:
          "I was the sole technical contributor, but the product was shaped through continuous contact with the people operating it. I met weekly with my co-founders, worked directly with a four-person admin and operations team, spoke with producers, and attended live events. Those inputs became requirements, interface changes, operational tools, and support workflows.",
        channels: [
          {
            title: "Weekly operating reviews",
            description: "Co-founder priorities, business constraints, and feature tradeoffs.",
          },
          {
            title: "Admin and support feedback",
            description: "Refunds, corrections, accounting, producer communication, and recurring support problems.",
          },
          {
            title: "Producer conversations",
            description: "Event setup, inventory, reporting, access, and lifecycle needs.",
          },
          {
            title: "Onsite door observation",
            description: "Scanning, manual lookup, staff training, device constraints, line pressure, and recovery paths.",
          },
        ],
      },
      problem:
        "The original stack made checkout reliability, payment options, event operations, and support work too hard to change. The business needed a system that matched live-event operations instead of forcing teams through generic commerce tools.",
      constraints: [
        "Payments, refunds, and ticket validation had to be deterministic and auditable.",
        "Door staff needed mobile workflows that worked under time pressure at live events.",
        "Producers needed useful reporting without exposing admin-level complexity.",
        "The system had to improve while real events, orders, and support issues continued running.",
      ],
      role:
        "Co-Founder and CTO, sole technical contributor, and primary technical point of contact. I owned product direction, workflow discovery, architecture, full-stack implementation, operational tooling, production support, and technical iteration.",
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
        `Served ${redEyeFacts.metrics.buyerIdentities.value} buyer identities across ${redEyeFacts.metrics.ticketedEvents.value} ticketed events`,
        `Processed more than ${redEyeFacts.metrics.grossPaymentVolume.value} in gross payment volume since the custom platform launched in ${redEyeFacts.customPlatformLaunchLabel}`,
        "Added Apple Pay and Google Pay as provider-specific checkout paths",
        "Replaced the WordPress MVP with a custom application built around event-commerce operations",
        `Processed ${redEyeFacts.metrics.completedOrders.value} completed orders and issued ${redEyeFacts.metrics.ticketsIssued.value} tickets`,
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
      secondaryArtifacts: [
        {
          status: "Production",
          title: "Event publishing and search discovery",
          context:
            "Approved events needed to reach the static public frontend without requiring a manual deployment for every listing.",
          flow: ["Event approved", "Controlled rebuild", "Public event page", "Metadata and discovery surfaces"],
          decision:
            "Trigger a controlled frontend rebuild from the event approval workflow so public pages and metadata stay aligned with operational state.",
          outcome:
            "Approved events can be published through the product workflow instead of a separate manual release step.",
          evidenceLimit:
            "Public evidence does not yet include deployment-time, failure-rate, or search-indexing measurements.",
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
        `${redEyeFacts.metrics.buyerIdentities.value} buyer identities served`,
        `${redEyeFacts.metrics.completedOrders.value} completed orders processed`,
        `${redEyeFacts.metrics.ticketsIssued.value} tickets issued`,
        `${redEyeFacts.metrics.grossPaymentVolume.value} gross payment volume processed since the ${redEyeFacts.customPlatformLaunchLabel} platform launch`,
        `${redEyeFacts.metrics.ticketedEvents.value} ticketed events supported`,
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
    category: "Client Discovery & Digital Delivery",
    roleLabel: "Founder",
    engagementLabel: "Project-based creative technology studio",
    statusLabels: ["Scoped contribution"],
    description:
      "Led client projects from early discovery through launch, turning unclear goals into websites, presentation systems, messaging structures, and audience-facing digital experiences.",
    tags: ["Client Discovery", "UX Strategy", "Frontend Implementation"],
    image: "/images/projects/spotlight-studio.svg",
    imageAlt: "Spotlight Strategies discovery, content structure, and digital delivery workflow",
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
        "Spotlight Strategies was a project-based studio for clients who needed to clarify an offer, organize the story, and carry that direction into a website or presentation system.",
      problem:
        "Clients often arrived with scattered source material and an unclear way to explain what they offered. The work was to establish the audience, message, proof, and next action before designing or building.",
      constraints: [
        "Source material was often incomplete or distributed across several contributors.",
        "Deliverables had to be useful after handoff, not dependent on ongoing interpretation.",
        "Public examples needed to avoid confidential client details.",
      ],
      role:
        "Founder responsible for discovery, positioning, content structure, visual direction, implementation planning, delivery, and client communication.",
      usersAndWorkflows: [
        "Founders and client leads: clarify the message and make decisions faster",
        "Prospective customers: understand the offer, proof, and next step",
        "Internal teams: use reusable language, decks, and web assets",
      ],
      built: [
        "Discovery interviews and message hierarchy",
        "Website structure, copy, and frontend implementation",
        "Presentation systems and launch materials",
        "Editable assets clients could maintain after handoff",
      ],
      productArtifacts: [
        {
          title: "AI Optics launch materials",
          context:
            "The company needed a coherent launch story across web and presentation materials.",
          flow: ["Discovery", "Audience and offer", "Message hierarchy", "Website and launch materials"],
          decision:
            "Clarify the technical offer and supporting proof before moving into page design.",
          outcome:
            "Delivered a consistent launch narrative across the website and presentation materials.",
        },
        {
          title: "Seven Castle Coaching",
          context:
            "The business needed one clear direction across its brand, content, photography, and website.",
          flow: ["Positioning", "Content", "Photography", "Website"],
          decision:
            "Treat the touchpoints as one customer-facing experience rather than separate creative tasks.",
          outcome:
            "Delivered a coordinated set of brand, content, photography, and website materials.",
        },
      ],
      decisions: [
        "Started with audience, offer, and proof before visual styling",
        "Kept deliverables editable and reusable for clients after handoff",
        "Used AI-assisted drafting and iteration where it accelerated structure without replacing judgment",
      ],
      outcomes: [
        "Launch websites and audience-facing digital materials",
        "Presentation systems organized around a clear message and next decision",
        "Editable content and visual assets clients could continue using",
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
    category: "Interactive Frontend & Launch Delivery",
    roleLabel: "Design engineering contributor",
    period: careerFacts.theSeason.period,
    engagementLabel: "Scoped contribution",
    statusLabels: ["Scoped contribution", "Recreated demonstration"],
    demoStatus: "Live interactive demo",
    description:
      "Translated approved creative direction into responsive entertainment websites, custom motion, and interactive frontend experiences under fixed launch timelines.",
    tags: ["Design Engineering", "Responsive Frontend", "Interaction Design"],
    image: "/images/projects/season-flyer.svg",
    imageAlt: "Responsive entertainment launch work across desktop, mobile, and motion states",
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
        "Entertainment launch teams need pages that feel polished, adapt responsively, and survive late-stage creative, content, and approval changes without breaking the experience.",
      constraints: [
        "Approved direction needed precise execution.",
        "Launch timelines required quick iteration without fragile implementation.",
        "Pages needed to remain maintainable for the teams updating them after launch.",
        "Portfolio evidence had to be self-hosted because production sites can change.",
      ],
      role:
        "Design engineering and interaction implementation support, translating approved direction into responsive behavior.",
      usersAndWorkflows: [
        "Marketing teams: launch and update campaign pages",
        "Producers, creative teams, and agency partners: review polished, on-brand experiences",
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
        "This work shows design engineering judgment and the ability to support high-visibility entertainment launches.",
    },
  },
  {
    slug: "cats-the-jellicle-ball",
    title: "CATS: The Jellicle Ball",
    category: "Creative Engineering",
    caseStudyPresentation: "creative-compact",
    roleLabel: "Design engineering and front-end development",
    engagementLabel: "Original production website",
    statusLabels: ["Client work", "Production implementation"],
    demoStatus: "Interactive recreation",
    description:
      "Built custom responsive interactions and campaign-aligned web graphics for an original Broadway website, translating the show’s playful advertising direction into a cohesive digital experience within WordPress.",
    tags: ["Front-End Development", "Responsive UI", "WordPress", "Visual Design"],
    image: "/images/cats-live/cats-homepage-live.webp",
    imageAlt: "Live CATS: The Jellicle Ball homepage with production artwork and ticket navigation",
    liveUrl: "https://catsthejellicleball.com/",
    liveUrlLabel: "View production site",
    interactiveDemoComponent: "cats-carousel",
    permissionsNote:
      "The interactive demo recreates selected portions of my original front-end work so the behavior remains reviewable. The broader production site and campaign direction were collaborative client work, and some campaign assets were supplied.",
    caseStudy: {
      overview:
        "CATS: The Jellicle Ball needed a website that felt connected to the production’s advertising and marketing—not like campaign artwork placed inside a conventional WordPress template. Working with marketing, client, and production stakeholders, I helped translate its playful, color-driven direction into an original digital experience through custom front-end behavior, responsive interactions, and web-specific graphics.",
      built: [
        "Custom infinite content and image tracks",
        "Responsive carousel sizing, spacing, and visible-content rules",
        "Front-end customization beyond the standard WordPress presentation",
        "Web-specific graphics created or reconstructed from campaign direction and supplied assets",
        "Clear handoff from the campaign experience to the external ticketing destination",
      ],
      decisions: [
        "Translated bold color, oversized type, contrast, and movement into web-specific compositions instead of reproducing individual advertising layouts.",
        "Extended WordPress with custom layouts and front-end behavior where the campaign needed more movement, flexibility, and visual distinction.",
        "Used repeated content tracks and responsive sizing to maintain continuous motion without a visible endpoint.",
      ],
      lessons: [
        "This project reinforced that front-end engineering is an act of translation: identifying the visual and behavioral principles behind an evolving campaign, filling gaps in available assets, and turning that direction into a responsive experience within real platform constraints.",
      ],
    },
  },
  {
    slug: "the-heart",
    title: "The Heart",
    category: "Purposeful Motion System",
    roleLabel: "Interaction engineering contributor",
    engagementLabel: "Homepage-matched demonstration",
    statusLabels: ["Scoped contribution", "Production assets adapted"],
    demoStatus: "Live interactive demo",
    description:
      "Matched the production homepage's layered heartbeat display and extended it with the original point-wave CodePen study.",
    tags: ["Design Engineering", "Motion", "Interaction Design", "Accessibility"],
    image: "/images/the-heart/heart-homepage-globe.png",
    imageAlt: "The Heart point-cloud globe from the production musical homepage",
    liveUrl: "https://theheartmusical.com/",
    liveUrlLabel: "View production site",
    screenshots: [
      {
        src: "/images/the-heart/heart-homepage-globe.png",
        alt: "The Heart production point-cloud globe",
        caption: "The production homepage's point-cloud globe, self-hosted here to preserve the exact hero treatment.",
        width: 800,
        height: 797,
      },
      {
        src: "/images/the-heart/heart-homepage-wave.png",
        alt: "The Heart production waveform graphic",
        caption: "The production waveform layer that crosses behind the hero mark and establishes the site's pulse language.",
        width: 1695,
        height: 800,
      },
    ],
    interactiveDemoComponent: "heartbeat",
    permissionsNote:
      "Self-hosted adaptation using public production homepage assets and timing, plus Logan Hart's public The Wave CodePen parameters for the animated point field.",
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
        "Creative and production teams: see motion support the concept without overwhelming content",
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
    category: "Research Tool UI & Visualization Refinement",
    roleLabel: careerFacts.einstein.role,
    period: careerFacts.einstein.period,
    engagementLabel: "Scoped technical contribution",
    statusLabels: ["Scoped contribution", "Representative visual"],
    description:
      "Improved interface clarity, rendering behavior, and dataset loading inside an existing neuroscience visualization tool.",
    tags: ["Research Tools", "Technical UI", "Data Visualization", "Performance", "Three.js"],
    image: "/images/projects/einstein-research.svg",
    imageAlt: "Representative workflow diagram for neuroscience dataset loading, visualization, and interface refinement",
    screenshots: [
      {
        src: "/images/projects/einstein-research.svg",
        alt: "Representative workflow diagram for research dataset loading, visualization, and interface refinement",
        caption: "Representative portfolio visual. This is not the original research interface or research data.",
        width: 1280,
        height: 720,
      },
    ],
    permissionsNote:
      "Representative portfolio visual. This is not the original research interface or research data. It was created solely to illustrate the visualization context in which the work occurred.",
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
        "Contract Frontend Developer responsible for scoped interface refinement, rendering behavior, and dataset-load performance within an existing research tool.",
      usersAndWorkflows: [
        "Researchers: inspect visualized neuroscience data with less interface friction",
        "Technical collaborators: maintain rendering and interface behavior",
        "Research collaborators: evaluate progress through clearer UI states and performance improvements",
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
        "Reduced dataset load time by approximately 20%",
        "Improved navigation and interface clarity for research workflows",
        "Refined rendering behavior within an existing visualization tool",
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
    category: "Visual Communication & Presentation Design",
    roleLabel: careerFacts.steveMadden.role,
    period: careerFacts.steveMadden.period,
    engagementLabel: "Original presentation materials",
    statusLabels: ["Scoped contribution", "Original materials"],
    description:
      "Created sales decks, CAD assets, packaging concepts, and visual materials that helped product, merchandising, and sales teams communicate direction clearly.",
    tags: ["Visual Communication", "Presentation Design", "Product Direction"],
    image: "/images/projects/steve-madden.svg",
    imageAlt: "Steve Madden sales decks, CAD assets, packaging concepts, and presentation materials",
    screenshots: [
      {
        src: "/images/madden/madden-nyc-cover.webp",
        alt: "Steve Madden NYC sales deck cover",
        caption: "Original sales-deck cover I created to establish the Spring/Summer 2022 story for sales and buyer review; confidential details are excluded.",
        width: 1800,
        height: 1391,
      },
      {
        src: "/images/madden/madden-sales-slide.webp",
        alt: "Steve Madden sales presentation slide",
        caption: "Original slide I created to prioritize product direction for sales and buyer review; confidential details are excluded.",
        width: 1800,
        height: 1391,
      },
      {
        src: "/images/madden/madden-brand-board.webp",
        alt: "Steve Madden brand and trend board",
        caption: "Original board I created to align product and merchandising teams around direction, tone, and market context.",
        width: 1800,
        height: 1390,
      },
      {
        src: "/images/madden/madden-packaging.webp",
        alt: "Steve Madden packaging concept board",
        caption: "Original concept board I created to organize packaging options for product and merchandising review; confidential details are excluded.",
        width: 1800,
        height: 1390,
      },
    ],
    permissionsNote:
      `Original presentation archive excerpts. Confidential business details are excluded. Selected materials were created during Logan's ${careerFacts.steveMadden.period} employment for the ${careerFacts.steveMadden.salesCycle} sales cycle.`,
    caseStudy: {
      overview:
        "This work translated product and brand direction into sales materials, CAD assets, packaging concepts, and review-ready decks.",
      problem:
        "Sales and product teams needed materials that made product direction clear enough for buyers, merchandising teams, and external partners to evaluate quickly.",
      constraints: [
        "Artifacts had to be persuasive without exposing confidential business details.",
        "Different audiences needed different levels of detail and context.",
        "The work had to compress product, merchandising, and brand direction into reviewable materials.",
      ],
      role:
        "Visual communication and presentation design support across sales, packaging, CAD, and client-facing materials.",
      usersAndWorkflows: [
        "Sales teams: present product direction clearly",
        "Buyers and merchandising teams: evaluate concepts quickly",
        "Internal teams: align around product, packaging, and brand details",
      ],
      built: [
        "Sales decks",
        "CAD assets",
        "Packaging concepts",
        "Client-facing visual materials",
      ],
      decisions: [
        "Prioritized the product information each audience needed to evaluate",
        "Kept confidential materials out of public portfolio artifacts",
        "Used visual hierarchy to make product direction easier to evaluate",
      ],
      outcomes: [
        "Clearer sales and product presentations",
        "More organized visual communication around product and brand direction",
        "Reusable artifacts for buyer and internal review workflows",
      ],
      lessons: [
        "Presentation design is also workflow design: the material has to help people make decisions.",
        "Visual communication skills transfer directly into product and implementation work.",
      ],
      shows:
        "This work shows visual communication judgment across product, sales, and merchandising materials.",
    },
  },
];

export const featuredProject = projects.find((project) => project.slug === "red-eye-tickets")!;
export const selectedProjects = projects.filter((project) =>
  [
    "red-eye-tickets",
    "cats-the-jellicle-ball",
    "spotlight-strategies",
  ].includes(project.slug),
).sort(
  (a, b) =>
    [
      "red-eye-tickets",
      "cats-the-jellicle-ball",
      "spotlight-strategies",
    ].indexOf(a.slug) -
    [
      "red-eye-tickets",
      "cats-the-jellicle-ball",
      "spotlight-strategies",
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
      "Focused implementation work where the important proof is interaction behavior, responsive execution, and launch-ready delivery.",
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
    title: "Discovery, structure, and visual communication",
    intro:
      "Work that turns loose goals, brand direction, and client needs into clear websites, presentations, and handoff materials.",
    projectSlugs: ["spotlight-strategies", "steve-madden"],
  },
];

export const beforeAfterCards = [
  {
    title: "Performance",
    before: "Early WordPress-based site with slower first loads.",
    after: "Custom application delivery with explicit caching, asset, and release control.",
  },
  {
    title: "Checkout Reliability",
    before: "Card-only checkout with limited recovery paths.",
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
