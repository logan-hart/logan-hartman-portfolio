import { ArrowRight, Blocks, Compass, Route } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { preload } from "react-dom";
import { EvidenceCards } from "@/components/red-eye/EvidenceCards";
import { Section } from "@/components/Section";
import { careerFacts } from "@/data/careerFacts";
import {
  impactMetrics,
  operatingManualPrinciples,
  selectedProjects,
} from "@/data/projects";
import { redEyeMetricsAsOf } from "@/data/redEyeMetrics";

const approachIcons = [Route, Compass, Blocks];
const homepageImpactMetrics = impactMetrics.filter((metric) =>
  ["Ticketed events", "Buyer identities", "Completed orders", "Tickets issued"].includes(metric.label),
);

const featuredLabels: Record<string, string> = {
  "red-eye-tickets": "Product Systems",
  "cats-the-jellicle-ball": "Production Design Engineering",
  "the-season-flyer": "Design Engineering",
  "albert-einstein-college-of-medicine": "Technical Tools",
  "spotlight-strategies": "Communication Systems",
};

const featuredTitles: Record<string, string> = {
  "the-season-flyer": "The Season",
  "albert-einstein-college-of-medicine": "Albert Einstein College of Medicine",
};

export default function HomePage() {
  const redEye = careerFacts.redEye;
  preload("/images/hero-workflow-background.webp", {
    as: "image",
    fetchPriority: "high",
    type: "image/webp",
  });

  return (
    <>
      <section className="hero hero--portfolio">
        <div aria-hidden="true" className="hero-ribbons" />
        <div className="container hero-content">
          <div className="hero-copy">
            <p className="eyebrow">Product-minded technical builder · Co-Founder &amp; CTO</p>
            <h1>
              Building products for the <span className="accent-text">messy part of real operations.</span>
            </h1>
            <p className="hero-lead">
              I work across product, engineering, and operations, translating real workflows into reliable software. At
              Red Eye Tickets, I rebuilt a WordPress MVP into a custom event-commerce platform used by buyers, producers,
              admins, and door staff.
            </p>
            <p className="hero-proof-line">
              Since its {redEye.customPlatformLaunchLabel} launch: {redEye.metrics.ticketedEvents.value} events ·{" "}
              {redEye.metrics.completedOrders.value} orders · {redEye.metrics.ticketsIssued.value} tickets.
            </p>
            <div className="actions">
              <Link className="button button--primary" href="/work/red-eye-tickets/">
                Explore Red Eye <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link className="button button--ghost" href="/#evidence">
                Read engineering stories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="impact-band">
        <div className="container">
          <div className="impact-band__header">
            <p className="eyebrow">Selected impact</p>
            <span>Production outcomes from Red Eye Tickets</span>
          </div>
          <div className="impact-stats" aria-label="Selected impact metrics">
            {homepageImpactMetrics.map((metric) => (
              <article key={metric.value}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>
          <p className="metric-method-note">
            Production totals through {redEyeMetricsAsOf}; conservative rounded floors with obvious QA and local fixtures excluded.{" "}
            <Link href="/work/red-eye-tickets/metrics/">Read the definitions →</Link>
          </p>
        </div>
      </section>

      <Section
        eyebrow="Engineering evidence"
        id="evidence"
        title="The decisions and systems behind the work."
        intro="Explore production integrations, incident reviews, architecture decisions, and clearly labeled prototypes."
        variant="tight"
      >
        <EvidenceCards />
      </Section>

      <section className="section section--home-work" id="selected-work">
        <div className="container">
          <div className="section-heading section-heading--home">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2>Systems built around how people actually work.</h2>
            </div>
            <div>
              <p>Product platforms and technical tools shaped by users, constraints, and measurable outcomes.</p>
              <Link className="view-all-link" href="/work/">
                View all work <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          </div>
          <div className="home-featured-projects">
            {selectedProjects.slice(0, 3).map((project, index) => (
              <Link
                className={`home-project ${index === 0 ? "home-project--lead" : ""}`}
                href={`/work/${project.slug}/`}
                key={project.slug}
              >
                <div className={`home-project__media ${project.thumbnailPresentation === "contain-black" ? "project-media--contain-black" : ""}`}>
                  <Image
                    alt=""
                    height={720}
                    priority={index === 0}
                    sizes={index === 0 ? "(max-width: 860px) 100vw, 58vw" : "(max-width: 860px) 100vw, 50vw"}
                    src={project.thumbnailImage ?? project.image}
                    width={1280}
                  />
                </div>
                <div className="home-project__body">
                  <span className="category">{featuredLabels[project.slug] ?? project.category}</span>
                  <h3>{featuredTitles[project.slug] ?? project.title}</h3>
                  <p>{project.description}</p>
                  {project.roleLabel ? (
                    <p className="home-project__proof">
                      {project.roleLabel}
                      {project.period ? ` · ${project.period}` : ""}
                      {project.engagementLabel ? ` · ${project.engagementLabel}` : ""}
                    </p>
                  ) : null}
                  <div className="status-list" aria-label="Project status">
                    {project.statusLabels.map((status) => <span key={status}>{status}</span>)}
                  </div>
                  <div className="home-project__footer">
                    <span>{project.tags.slice(0, 3).join(" · ")}</span>
                    <ArrowRight aria-hidden="true" size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--approach-home" id="approach">
        <div className="container">
          <div className="section-heading section-heading--home">
            <div>
              <p className="eyebrow">Operating style</p>
              <h2>From ambiguity to a system people can trust.</h2>
            </div>
            <p>I move from workflow discovery through product decisions and implementation.</p>
          </div>
          <div className="principle-list">
            {operatingManualPrinciples.map((principle, index) => {
              const Icon = approachIcons[index];
              return (
                <article key={principle.title}>
                  <div className="principle-list__meta">
                    <span>0{index + 1}</span>
                    <Icon aria-hidden="true" size={22} strokeWidth={1.7} />
                  </div>
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                </article>
              );
            })}
          </div>
          <div className="approach-home-cta">
            <p>Open to product engineering, founding engineering, and FDE roles where technical execution and customer context meet.</p>
            <Link className="button button--primary" href="/contact/">
              Start a conversation <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
