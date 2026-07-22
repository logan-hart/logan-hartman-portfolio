import type { Metadata } from "next";
import { ArrowRight, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { Section } from "@/components/Section";
import { careerFacts } from "@/data/careerFacts";
import { profile } from "@/data/profile";

const capabilities = [
  "Workflow discovery",
  "Product engineering",
  "Operational tooling",
  "Technical communication",
];

export const metadata: Metadata = {
  title: "About",
  description:
    "About Logan Hartman, a product-minded technical builder focused on workflow systems, product engineering, implementation, and AI-assisted delivery.",
  alternates: {
    canonical: "/about/",
  },
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">About</p>
          <h1>Product judgment with an implementation mindset.</h1>
          <p>
            I turn ambiguous operational problems into products teams can use and maintain.
          </p>
        </div>
      </section>
      <Section
        eyebrow="Throughline"
        title="Different domains. The same kind of problem."
        variant="tight"
      >
        <div className="about-story-grid">
          <div className="about-story-copy">
            <p>
              Before software, I worked in live entertainment. That made fixed launch windows, non-technical
              collaboration, and high-pressure operators familiar long before I wrote production code.
            </p>
            <p>
              Across entertainment, event commerce, client work, and research tools, I kept finding the same problem:
              important work split across manual handoffs, generic software, and context held in people&apos;s heads. My
              role is to make that work explicit, then build the system around it.
            </p>
            <p>
              My strongest work sits between product and engineering: talking with the people doing the work, choosing
              the right boundary for a system, shipping the implementation, and staying close enough to operations to
              see where the first version breaks down.
            </p>
          </div>
          <div className="capability-list" aria-label="Capabilities">
            {capabilities.map((capability, index) => (
              <div key={capability}>
                <span>0{index + 1}</span>
                <strong>{capability}</strong>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <Section
        eyebrow="Current focus"
        title={`Co-Founder and CTO at Red Eye Tickets · ${careerFacts.redEye.rolePeriod}`}
        variant="band"
      >
        <div className="about-current-grid">
          <article>
            <span>Product scope</span>
            <h3>A live event-commerce platform</h3>
            <p>
              As the sole technical contributor, I own product direction and implementation across checkout, wallet
              payments, ticket delivery, producer tools, refunds, reporting, and mobile admissions. The custom platform
              launched in {careerFacts.redEye.customPlatformLaunchLabel}.
            </p>
          </article>
          <article>
            <span>Operating proof</span>
            <h3>
              {careerFacts.redEye.metrics.ticketsIssued.value} tickets across{" "}
              {careerFacts.redEye.metrics.ticketedEvents.value} events
            </h3>
            <p>
              The work includes the unglamorous parts of production ownership: edge cases, support workflows,
              incident recovery, release evidence, and tools for people working a live event.
            </p>
          </article>
        </div>
        <Link className="card-link about-current-link" href="/work/red-eye-tickets/">
          Review the Red Eye case study <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </Section>
      <Section
        eyebrow="Evidence standard"
        title="Scope and maturity stay visible."
        variant="tight"
      >
        <p className="about-evidence-note">
          Production systems, scoped contributions, representative visuals, and local prototypes are labeled explicitly
          throughout the portfolio.
        </p>
      </Section>
      <Section variant="tight">
        <div className="about-cta">
          <div>
            <p className="eyebrow">Next</p>
            <h2>Build systems people can use.</h2>
          </div>
          <div className="actions">
            {profile.email ? (
              <a className="button button--primary" href={`mailto:${profile.email}`}>
                Email Logan <Mail aria-hidden="true" size={18} />
              </a>
            ) : (
              <a className="button button--primary" href={profile.linkedIn} rel="noreferrer" target="_blank">
                Connect on LinkedIn <Linkedin aria-hidden="true" size={18} />
              </a>
            )}
            <Link className="button button--secondary" href="/work/">
              View work <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
