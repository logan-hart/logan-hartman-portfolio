import type { Metadata } from "next";
import { ArrowUpRight, Heart, LayoutDashboard, MonitorPlay, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DemoRenderer } from "@/components/demos/DemoRenderer";
import { Section } from "@/components/Section";
import { clientDemoProjects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Demo Library",
  description:
    "Self-hosted portfolio demo modules by Logan Hartman for workflow systems, automation loops, carousel behavior, purposeful motion, and interaction patterns.",
  alternates: {
    canonical: "/demos/",
  },
};

const demoAnchors: Record<string, string> = {
  "red-eye-tickets": "#red-eye-workflows",
  "cats-the-jellicle-ball": "#cats",
  "the-heart": "#heart",
  "the-season-flyer": "#motion",
};

const demoIcons = [LayoutDashboard, Sparkles, MonitorPlay, Heart];
const redEyeLiveDemoEnabled = process.env.NEXT_PUBLIC_RED_EYE_DEMO_ENABLED === "true";

export default function DemosPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Demo library</p>
          <h1>Self-hosted product evidence that survives disappearing links.</h1>
          <p>
            Red Eye combines audited product captures with an optional controlled build from the original frontend source.
            Client work uses scoped, portfolio-safe interactions where copying a full production site would be inappropriate.
          </p>
        </div>
      </section>
      <Section title="Demo index" variant="tight">
        <div className="demo-tile-grid">
          {clientDemoProjects.map((project, index) => {
            const Icon = demoIcons[index] ?? Sparkles;

            return (
              <article className="demo-tile" key={project.slug}>
                <Link
                  aria-label={`Open ${project.title} demo`}
                  className="demo-tile__media"
                  href={demoAnchors[project.slug] ?? `/work/${project.slug}/`}
                >
                  <Image alt="" height={720} priority={index === 0} sizes="(max-width: 760px) 100vw, 50vw" src={project.image} width={1280} />
                </Link>
                <div className="demo-tile__body">
                  <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
                  <div>
                    <span className="category">{project.category}</span>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                  </div>
                  <Link className="card-link" href={demoAnchors[project.slug] ?? `/work/${project.slug}/`}>
                    {project.slug === "red-eye-tickets" && !redEyeLiveDemoEnabled ? "Review evidence" : "Try demo"} <ArrowUpRight aria-hidden="true" size={17} />
                  </Link>
                </div>
              </article>
            );
          })}
          <article className="demo-tile">
            <Link aria-label="Open Red Eye automation loop" className="demo-tile__media" href="#red-eye-automation">
              <Image alt="" height={720} sizes="(max-width: 760px) 100vw, 50vw" src="/images/projects/red-eye-platform.svg" width={1280} />
            </Link>
            <div className="demo-tile__body">
              <ShieldCheck aria-hidden="true" size={21} strokeWidth={1.8} />
              <div>
                <span className="category">AI-assisted operations</span>
                <h3>Red Eye automation loop</h3>
                <p>
                  A self-contained architecture artifact for the local-first repair loop, policy gates, CI triage, and
                  locally verified controlled-repair workflow built around Red Eye operations.
                </p>
              </div>
              <Link className="card-link" href="#red-eye-automation">
                Try demo <ArrowUpRight aria-hidden="true" size={17} />
              </Link>
            </div>
          </article>
        </div>
      </Section>
      <Section
        eyebrow="Red Eye"
        id="red-eye-workflows"
        title={redEyeLiveDemoEnabled ? "Workflow system demo" : "Workflow evidence"}
        variant="band"
      >
        <DemoRenderer component="red-eye-workflows" />
      </Section>
      <Section eyebrow="Red Eye" id="red-eye-automation" title="AI-assisted repair pipeline">
        <DemoRenderer component="red-eye-automation" />
      </Section>
      <Section eyebrow="CATS" id="cats" title="Rotating carousel demo">
        <DemoRenderer component="cats-carousel" />
      </Section>
      <Section eyebrow="The Heart" id="heart" title="Heartbeat animation demo" variant="band">
        <DemoRenderer component="heartbeat" />
      </Section>
      <Section eyebrow="Design engineering" id="motion" title="Interaction pattern proof">
        <DemoRenderer component="generic-motion" />
      </Section>
    </>
  );
}
