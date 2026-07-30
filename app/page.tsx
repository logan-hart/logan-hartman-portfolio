import { ArrowRight, Blocks, Compass, Route } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { preload } from "react-dom";
import { NeuralMorphologyPreview } from "@/components/demos/NeuralMorphologyPreview";
import { EvidenceCards } from "@/components/red-eye/EvidenceCards";
import { Section } from "@/components/Section";
import { careerFacts } from "@/data/careerFacts";
import { profile } from "@/data/profile";
import { homepageRedEyeEvidenceLinks } from "@/data/redEyeEvidence";
import {
  operatingManualPrinciples,
  selectedProjects,
} from "@/data/projects";
import { redEyeMetrics, redEyeMetricsAsOf } from "@/data/redEyeMetrics";

const approachIcons = [Route, Compass, Blocks];
const homepageImpactMetrics = redEyeMetrics.filter((metric) =>
  ["events", "orders", "tickets", "gpv"].includes(metric.key),
);

const featuredLabels: Record<string, string> = {
  "red-eye-tickets": "Product Engineering",
  "albert-einstein-college-of-medicine": "3D Research Visualization",
};

const featuredTitles: Record<string, string> = {
  "the-season-flyer": "The Season",
  "albert-einstein-college-of-medicine": "Albert Einstein College of Medicine",
};

const featuredDescriptions: Record<string, string> = {
  "red-eye-tickets":
    "Built and operate a Rails, React, and PostgreSQL event-commerce platform where payments, inventory, ticket delivery, and venue admission must remain in sync.",
  "albert-einstein-college-of-medicine":
    "Refined a Three.js workspace for inspecting overlapping neurological volumes and reduced large-dataset load time by approximately 20%.",
};

const featuredProof: Record<string, string> = {
  "red-eye-tickets": "Co-Founder & CTO · Sole technical contributor · January 2024–present",
  "albert-einstein-college-of-medicine": "Contract Frontend Developer · May 2023–January 2024",
};

const featuredContext: Record<string, string> = {
  "red-eye-tickets": "Custom platform launched October 2025",
};

const featuredStatuses: Record<string, string[]> = {
  "albert-einstein-college-of-medicine": ["Scoped contribution", "Public-data recreation"],
};

const featuredTags: Record<string, string[]> = {
  "red-eye-tickets": ["Payments", "Inventory", "Operations", "Reliability"],
  "albert-einstein-college-of-medicine": ["Three.js", "Technical UI", "Performance"],
};

const featuredDemoLabels: Record<string, string> = {
  "albert-einstein-college-of-medicine": "Interactive 3D demo",
};

const featuredLinkLabels: Record<string, string> = {
  "red-eye-tickets": "Explore the Case Study",
  "albert-einstein-college-of-medicine": "View the Project",
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
            <p className="eyebrow">Product Engineer · Co-Founder &amp; CTO</p>
            <h1>
              Building <span className="accent-text">reliable products for real operations.</span>
            </h1>
            <p className="hero-lead">
              I work directly with users and operators to turn complex workflows into reliable full-stack software, then
              stay accountable through testing, release, recovery, and production improvement. At Red Eye Tickets, I
              rebuilt a WordPress MVP as a Rails, React, and PostgreSQL event-commerce platform spanning payments,
              inventory, ticketing, producer tools, and live admissions.
            </p>
            <p className="hero-proof-line">
              Since the custom platform launched in {redEye.customPlatformLaunchLabel}:{" "}
              {redEye.metrics.ticketedEvents.value} ticketed events · {redEye.metrics.completedOrders.value} completed
              orders · {redEye.metrics.ticketsIssued.value} tickets issued ·{" "}
              {redEye.metrics.grossPaymentVolume.value} in gross payment volume.
            </p>
            <div className="actions">
              <Link className="button button--primary" href="/work/red-eye-tickets/">
                Explore Red Eye <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <a className="button button--ghost" download href={profile.resumeUrl}>Download Resume</a>
            </div>
          </div>
        </div>
      </section>

      <section className="impact-band">
        <div className="container">
          <div className="impact-band__header">
            <div>
              <p className="eyebrow">Production scale</p>
              <h2>Red Eye Tickets in production.</h2>
            </div>
            <p>A live event-commerce platform supporting the customer journey from checkout through venue admission.</p>
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
            Production totals through {redEyeMetricsAsOf} ·{" "}
            <Link href="/work/red-eye-tickets/metrics/">Metric definitions →</Link>
          </p>
        </div>
      </section>

      <Section
        eyebrow="Engineering evidence"
        id="evidence"
        title="How reliability is designed, tested, and recovered."
        intro="Case studies and technical artifacts showing how the product handles real money, scarce inventory, production failures, and controlled automation. Each item is labeled by maturity and evidence boundary."
        variant="tight"
      >
        <EvidenceCards items={homepageRedEyeEvidenceLinks} />
      </Section>

      <section className="section section--home-work" id="selected-work">
        <div className="container">
          <div className="section-heading section-heading--home">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2>Product engineering, technical tools, and coded interaction.</h2>
            </div>
            <div>
              <p>Work across event commerce, 3D research visualization, and design engineering.</p>
              <Link className="view-all-link" href="/work/">
                View All Work <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          </div>
          <div className="home-featured-projects">
            {selectedProjects.slice(0, 2).map((project, index) => (
              <Link
                className={`home-project ${index === 0 ? "home-project--lead" : "home-project--wide"}`}
                href={`/work/${project.slug}/`}
                key={project.slug}
              >
                <div className={`home-project__media ${project.thumbnailPresentation === "contain-black" ? "project-media--contain-black" : ""}`}>
                  {project.slug === "albert-einstein-college-of-medicine" ? (
                    <NeuralMorphologyPreview />
                  ) : (
                    <Image
                      alt=""
                      height={720}
                      priority={index === 0}
                      sizes={index === 0 ? "(max-width: 860px) 100vw, 58vw" : "(max-width: 860px) 100vw, 50vw"}
                      src={project.thumbnailImage ?? project.image}
                      width={1280}
                    />
                  )}
                </div>
                <div className="home-project__body">
                  <span className="category">{featuredLabels[project.slug] ?? project.category}</span>
                  <h3>{featuredTitles[project.slug] ?? project.title}</h3>
                  <p>{featuredDescriptions[project.slug] ?? project.description}</p>
                  <p className="home-project__proof">{featuredProof[project.slug]}</p>
                  {featuredContext[project.slug] ? (
                    <p className="home-project__context">{featuredContext[project.slug]}</p>
                  ) : null}
                  {project.slug !== "red-eye-tickets" ? (
                    <div className="status-list" aria-label="Project status">
                      {(featuredStatuses[project.slug] ?? project.statusLabels).map((status) => <span key={status}>{status}</span>)}
                    </div>
                  ) : null}
                  {featuredDemoLabels[project.slug] ? (
                    <span className="home-project__demo-label">{featuredDemoLabels[project.slug]}</span>
                  ) : null}
                  <div className="home-project__footer">
                    <span>{(featuredTags[project.slug] ?? project.tags).join(" · ")}</span>
                    <span className="home-project__link-label">
                      {featuredLinkLabels[project.slug] ?? "View Project"}
                      <ArrowRight aria-hidden="true" size={18} />
                    </span>
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
            <p>I move from workflow discovery through implementation, release, production verification, and learning.</p>
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
            <p>Open to Product Engineer, workflow-oriented FDE, and coding-heavy AI implementation roles. Remote preferred; New York or San Francisco relocation available.</p>
            <Link className="button button--primary" href="/contact/">
              Start a Conversation <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
