import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NeuralMorphologyPreview } from "@/components/demos/NeuralMorphologyPreview";
import { HeartProjectVisual } from "@/components/work/HeartProjectVisual";
import { profile } from "@/data/profile";
import type { Project } from "@/data/projects";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: {
    absolute: "Selected Work | Logan Hartman",
  },
  description:
    "Selected Product Engineering, 3D visualization, design engineering, and client-delivery work from Logan Hartman, including the Red Eye Tickets production platform.",
  alternates: {
    canonical: "/work/",
  },
  openGraph: {
    title: "Selected Work | Logan Hartman",
    description:
      "Product Engineering across event commerce, technical visualization, design engineering, and real-world production systems.",
    url: "/work/",
  },
};

type WorkCardContent = {
  slug: string;
  category: string;
  title: string;
  description: string[];
  role: string;
  statuses: string[];
  tags: string[];
  cta: string;
  demoLabel?: string;
};

const coreCases: WorkCardContent[] = [
  {
    slug: "albert-einstein-college-of-medicine",
    category: "3D Research Visualization",
    title: "Albert Einstein College of Medicine",
    description: [
      "Worked with researchers to refine a Three.js workspace for inspecting overlapping neurological volumes, improving visibility, recoloring, shared camera controls, and large-dataset performance.",
      "Reduced large-dataset load time by approximately 20% through rendering and data-loading optimizations.",
    ],
    role: "Frontend Developer, Contract · May 2023–January 2024",
    statuses: ["Scoped contribution", "Public-data recreation"],
    tags: ["Three.js", "Technical UI", "Performance"],
    demoLabel: "Interactive 3D demo",
    cta: "Explore the Visualization Case",
  },
  {
    slug: "cats-the-jellicle-ball",
    category: "Design Engineering",
    title: "CATS: The Jellicle Ball",
    description: [
      "Translated approved campaign direction into custom JavaScript interactions, responsive layouts, and web graphics for the original Broadway production site.",
      "The case focuses on how motion, scale, responsive behavior, and editorial composition were implemented as a maintainable WordPress experience rather than placed inside a conventional template.",
    ],
    role: "Frontend development and design engineering",
    statuses: ["Production client work"],
    tags: ["JavaScript", "Interaction Design", "Responsive Systems"],
    cta: "Explore the CATS Case Study",
  },
];

const supportingCases: WorkCardContent[] = [
  {
    slug: "spotlight-strategies",
    category: "Client Discovery & Digital Delivery",
    title: "Spotlight Strategies",
    description: [
      "Led project-based client engagements from discovery through launch, turning incomplete source material into clear messaging, website structure, presentation systems, and maintainable digital deliverables.",
    ],
    role: "Founder · Project-based creative technology studio",
    statuses: ["Project-based studio"],
    tags: ["Client Discovery", "UX Strategy", "Frontend Delivery"],
    cta: "View Spotlight Strategies",
  },
  {
    slug: "the-season-flyer",
    category: "Frontend & Launch Delivery",
    title: "The Season",
    description: [
      "Delivered responsive websites and interactive frontend work across multiple Broadway and entertainment launches using custom JavaScript, GSAP, Three.js, WordPress, and Elementor.",
      "Worked from approved campaign direction and collaborated with creative, marketing, advertising, agency, and production teams under fixed launch timelines.",
    ],
    role: "Freelance Frontend Developer & Interactive Web Designer · February 2024–February 2026",
    statuses: ["Scoped contribution", "Recreated demonstration"],
    tags: ["JavaScript", "Motion", "Responsive Frontend"],
    cta: "View Selected Launch Work",
  },
];

function projectFor(slug: string) {
  return projects.find((project) => project.slug === slug)!;
}

function ProjectMedia({ project, priority = false }: { project: Project; priority?: boolean }) {
  if (project.slug === "albert-einstein-college-of-medicine") {
    return <NeuralMorphologyPreview />;
  }

  return (
    <Image
      alt=""
      height={720}
      priority={priority}
      sizes="(max-width: 720px) 100vw, 42vw"
      src={project.thumbnailImage ?? project.image}
      width={1280}
    />
  );
}

function WorkCard({ content }: { content: WorkCardContent }) {
  const project = projectFor(content.slug);

  return (
    <article className="work-row">
      <Link
        aria-label={`View ${content.title} case study`}
        className={`work-row__media ${project.thumbnailPresentation === "contain-black" ? "project-media--contain-black" : ""}`}
        href={`/work/${project.slug}/`}
      >
        <ProjectMedia project={project} />
      </Link>
      <div className="work-row__body">
        <div className="work-row__topline">
          <span className="category">{content.category}</span>
        </div>
        <h2>{content.title}</h2>
        <div className="work-row__description">
          {content.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <p className="work-row__proof">{content.role}</p>
        <div className="status-list" aria-label={`${content.title} project status`}>
          {content.statuses.map((status) => <span key={status}>{status}</span>)}
        </div>
        {content.demoLabel ? <span className="work-row__demo-label">{content.demoLabel}</span> : null}
        <div className="tag-list" aria-label={`${content.title} technologies and capabilities`}>
          {content.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
        </div>
        <Link className="card-link" href={`/work/${project.slug}/`}>
          {content.cta} <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </article>
  );
}

export default function WorkPage() {
  const redEye = projectFor("red-eye-tickets");

  return (
    <>
      <section className="page-hero work-page-hero">
        <div className="container">
          <p className="eyebrow">Selected work</p>
          <h1>Product engineering across operations, technical tools, and interactive experiences.</h1>
          <p>
            Start with Red Eye Tickets for the clearest evidence of end-to-end product and production ownership. The
            supporting cases show how I work across specialized interfaces, design engineering, client discovery, and
            launch delivery.
          </p>
        </div>
      </section>

      <section className="section work-featured-section">
        <div className="container">
          <div className="work-section-heading work-section-heading--featured">
            <p className="eyebrow">Featured case study</p>
            <h2>A product built around reliability in the real world.</h2>
            <p>
              Red Eye has to preserve a chain of promises from payment to inventory to ticket delivery to venue admission.
              This case shows how that responsibility shaped the product, architecture, testing, release process, and
              operating system behind a live ticketing business.
            </p>
            <p>
              That chain is supported by explicit payment and inventory state, transactional holds, asynchronous recovery,
              signed tickets, venue admission controls, testing, monitoring, and release verification.
            </p>
          </div>

          <article className="work-featured-card">
            <Link
              aria-label="Explore Red Eye Tickets"
              className="work-featured-card__media"
              href="/work/red-eye-tickets/"
            >
              <ProjectMedia priority project={redEye} />
            </Link>
            <div className="work-featured-card__body">
              <span className="category">Product Engineering</span>
              <h2>Red Eye Tickets</h2>
              <p>
                Built and operate a Rails, React, and PostgreSQL event-commerce platform where payments, scarce inventory,
                ticket delivery, and venue admission must remain in sync.
              </p>
              <p>
                The case covers user and operator discovery, product decisions, transactional state, partial-failure
                recovery, testing, incidents, controlled releases, and production improvement.
              </p>
              <dl className="work-featured-card__facts">
                <div>
                  <dt>Production scale</dt>
                  <dd>240+ ticketed events · 19K+ completed orders · 29K+ tickets issued · $900K+ in gross payment volume</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>Co-Founder &amp; CTO · Sole technical contributor · January 2024–present</dd>
                </div>
                <div>
                  <dt>Context</dt>
                  <dd>Custom platform launched October 2025</dd>
                </div>
              </dl>
              <div className="status-list" aria-label="Red Eye Tickets project status">
                <span>Production</span>
                <span>Owned product</span>
              </div>
              <div className="tag-list" aria-label="Red Eye Tickets technologies and capabilities">
                {["Product Engineering", "Payments", "Inventory", "Reliability"].map((tag) => (
                  <span className="tag" key={tag}>{tag}</span>
                ))}
              </div>
              <Link className="button button--primary" href="/work/red-eye-tickets/">
                Explore Red Eye Tickets <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section section--tight work-core-section">
        <div className="container">
          <div className="work-section-heading">
            <p className="eyebrow">Core case studies</p>
            <h2>Technical depth and design engineering.</h2>
            <p>Focused examples of specialized interface work, performance improvement, and coded interaction.</p>
          </div>
          <div className="work-list">
            {coreCases.map((content) => <WorkCard content={content} key={content.slug} />)}
          </div>
        </div>
      </section>

      <section className="section section--band work-supporting-section">
        <div className="container">
          <div className="work-section-heading">
            <p className="eyebrow">Supporting work</p>
            <h2>Client discovery and launch delivery.</h2>
            <p>
              Additional work showing how I clarify goals, shape information, and implement polished digital experiences
              within collaborative constraints.
            </p>
          </div>
          <div className="work-list">
            {supportingCases.map((content) => <WorkCard content={content} key={content.slug} />)}
          </div>
        </div>
      </section>

      <section className="section work-demos-section">
        <div className="container">
          <div className="work-section-heading">
            <p className="eyebrow">Interaction demos</p>
            <h2>Focused recreations of motion and behavior.</h2>
            <p>
              The demo library preserves selected frontend behavior without depending on external production sites. It
              includes The Heart&apos;s layered heartbeat system, responsive motion studies, and other scoped interaction
              demonstrations.
            </p>
          </div>
          <article className="work-demo-card">
            <Link aria-label="Explore the interaction demo library" className="work-demo-card__media" href="/demos/">
              <HeartProjectVisual variant="compact" />
            </Link>
            <div className="work-demo-card__body">
              <span className="category">Focused interaction evidence</span>
              <h3>The Heart</h3>
              <p>
                A responsive recreation of the production&apos;s layered heartbeat hero and point-wave study, adapted from
                approved assets to preserve the interaction behavior in a self-hosted demonstration.
              </p>
              <Link className="button button--secondary" href="/demos/">
                Explore the Demo Library <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section section--closing">
        <div className="container closing-panel">
          <div>
            <h2>Work where product context and engineering ownership meet.</h2>
            <p>
              Open to Product Engineer, Full-Stack Product Engineer, and build-heavy Forward Deployed Engineer roles where
              user context, technical judgment, and production responsibility matter.
            </p>
          </div>
          <div className="actions">
            <a className="button button--primary" download href={profile.resumeUrl}>Download Resume</a>
            <Link className="button button--ghost" href="/contact/">
              Start a Conversation <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
