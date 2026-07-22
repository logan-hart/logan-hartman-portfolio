import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarRange,
  Headphones,
  MapPin,
  MessagesSquare,
  ScanLine,
  ShieldCheck,
  Ticket,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoRenderer } from "@/components/demos/DemoRenderer";
import { VideoFallback } from "@/components/demos/VideoFallback";
import { ArchitectureMap } from "@/components/red-eye/ArchitectureMap";
import { EvidenceCards } from "@/components/red-eye/EvidenceCards";
import { Section } from "@/components/Section";
import type { ProductArtifact, Project, Screenshot } from "@/data/projects";
import { projects } from "@/data/projects";
import { redEyeMetric, redEyeMetricsAsOf } from "@/data/redEyeMetrics";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

const redEyeCaseMetrics = ["events", "buyers", "tickets", "gpv"].map((key) =>
  redEyeMetric(key as "events" | "buyers" | "tickets" | "gpv"),
);

const userWorkflowIcons = [Ticket, UserRound, ShieldCheck, ScanLine];
const discoveryIcons = [CalendarRange, Headphones, MessagesSquare, MapPin];

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return {};
  }

  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical: `/work/${project.slug}/`,
    },
    openGraph: {
      title: `${project.title} | Logan Hartman`,
      description: project.description,
      url: `/work/${project.slug}/`,
      images: [{ url: project.image, alt: project.imageAlt }],
    },
  };
}

function ListPanel({ title, items }: { title?: string; items?: string[] }) {
  if (!items?.length) return null;

  return (
    <section className="case-panel">
      {title ? <h2>{title}</h2> : null}
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function CaseTabs({
  hasDecisions,
  hasImplementation,
  hasLessons,
  hasOutcomes,
  isCompactCreative,
  isCats,
  isRedEye,
}: {
  hasDecisions: boolean;
  hasImplementation: boolean;
  hasLessons: boolean;
  hasOutcomes: boolean;
  isCompactCreative: boolean;
  isCats: boolean;
  isRedEye: boolean;
}) {
  const tabs = (
    isCats
      ? [
          { href: "#overview", label: "Context", show: true },
          { href: "#demos", label: "Demo", show: true },
          { href: "#implementation", label: "Contribution", show: hasImplementation },
          { href: "#implementation-notes", label: "Implementation", show: true },
        ]
      : isCompactCreative
      ? [
          { href: "#overview", label: "Overview", show: true },
          { href: "#implementation", label: "Contribution", show: hasImplementation },
          { href: "#decisions", label: "Decisions", show: hasDecisions },
          { href: "#demos", label: "Evidence", show: true },
          { href: "#lessons", label: "Reflection", show: hasLessons },
        ]
      : [
          { href: "#overview", label: "Overview", show: true },
          { href: "#decisions", label: "Decisions", show: hasDecisions },
          { href: "#implementation", label: "Build", show: hasImplementation },
          { href: "#architecture", label: "Architecture", show: isRedEye },
          { href: "#evidence", label: "Evidence", show: true },
          { href: "#artifacts", label: "Engineering", show: isRedEye },
          { href: "#outcomes", label: "Outcomes", show: hasOutcomes },
          { href: "#lessons", label: "Lessons", show: hasLessons },
        ]
  ).filter((tab) => tab.show);

  return (
    <nav aria-label="Case study sections" className="case-tabs">
      {tabs.map((tab) => (
        <a href={tab.href} key={tab.href}>
          {tab.label}
        </a>
      ))}
    </nav>
  );
}

function ProjectEvidenceLinks({ project }: { project: Project }) {
  if (!project.liveUrl && !project.archivedDemoUrl) return null;

  return (
    <div className="actions">
      {project.liveUrl && (
        <a className="button button--ghost" href={project.liveUrl} rel="noreferrer" target="_blank">
          {project.liveUrlLabel ?? "View production site"} <ArrowUpRight aria-hidden="true" size={17} />
        </a>
      )}
      {project.archivedDemoUrl && (
        <a className="button button--ghost" href={project.archivedDemoUrl} rel="noreferrer" target="_blank">
          Archived demo <ArrowUpRight aria-hidden="true" size={17} />
        </a>
      )}
    </div>
  );
}

function UserWorkflowGrid({ items }: { items?: string[] }) {
  if (!items?.length) return null;

  return (
    <ul className="user-workflow-grid" aria-label="Primary users">
      {items.map((item, index) => {
        const [title, ...detailParts] = item.split(":");
        const detail = detailParts.join(":").trim();
        const Icon = userWorkflowIcons[index] ?? UserRound;

        return (
          <li className="user-workflow-card" key={item}>
            <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
            <div>
              <strong>{title.trim()}</strong>
              {detail ? <small>{detail}</small> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function FieldDiscovery({
  discovery,
}: {
  discovery: NonNullable<NonNullable<(typeof projects)[number]["caseStudy"]>["discovery"]>;
}) {
  return (
    <section className="field-discovery" id="discovery">
      <div className="field-discovery__intro">
        <p className="eyebrow">Field discovery</p>
        <h2>How I learned the workflow</h2>
        <p>{discovery.intro}</p>
      </div>
      <div className="field-discovery__channels">
        {discovery.channels.map((channel, index) => {
          const Icon = discoveryIcons[index] ?? MessagesSquare;
          return (
            <article key={channel.title}>
              <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
              <h3>{channel.title}</h3>
              <p>{channel.description}</p>
            </article>
          );
        })}
      </div>
      <div className="field-discovery__result" aria-label="Discovery to implementation loop">
        <span>Observed workflow</span>
        <ArrowRight aria-hidden="true" size={16} />
        <span>Product decisions</span>
        <ArrowRight aria-hidden="true" size={16} />
        <span>Production iteration</span>
      </div>
    </section>
  );
}

function TechnicalContext({ items }: { items?: string[] }) {
  if (!items?.length) return null;

  return (
    <div className="technical-context" aria-label="Technical context">
      <span>Technical context</span>
      <div>
        {items.slice(0, 6).map((item) => (
          <span className="tag" key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function ProductArtifactCard({ artifact }: { artifact: ProductArtifact }) {
  const workflowLabel = artifact.title.toLowerCase().endsWith("workflow")
    ? artifact.title
    : `${artifact.title} workflow`;

  return (
    <article className="artifact-card">
      <div>
        <h3>{artifact.title}</h3>
        <p className="artifact-card__context">{artifact.context}</p>
      </div>
      <div aria-label={workflowLabel} className="artifact-flow">
        {artifact.flow.map((step) => (
          <span key={step}>{step}</span>
        ))}
      </div>
      <div className="artifact-card__decision">
        <strong>Decision</strong>
        <p>{artifact.decision}</p>
      </div>
      <div className="artifact-card__decision">
        <strong>Outcome</strong>
        <p>{artifact.outcome}</p>
      </div>
    </article>
  );
}

function SecondaryArtifactCard({
  artifact,
}: {
  artifact: ProductArtifact & { status: string; evidenceLimit?: string };
}) {
  return (
    <article className="secondary-artifact" id="publishing">
      <span className="status-badge">{artifact.status}</span>
      <h3>{artifact.title}</h3>
      <p>{artifact.context}</p>
      <div className="artifact-flow" aria-label={`${artifact.title} workflow`}>
        {artifact.flow.map((step) => <span key={step}>{step}</span>)}
      </div>
      <dl>
        <div><dt>Decision</dt><dd>{artifact.decision}</dd></div>
        <div><dt>Outcome</dt><dd>{artifact.outcome}</dd></div>
      </dl>
      {artifact.evidenceLimit ? <small>Evidence limit: {artifact.evidenceLimit}</small> : null}
    </article>
  );
}

function screenshotPresentation(screenshot: Screenshot) {
  const { width, height } = screenshot;
  if (!width || !height) return "standard";
  if (height / width >= 1.5) return "portrait";
  if (width / height >= 2.2) return "wide";
  return "standard";
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    notFound();
  }

  const caseStudy = project.caseStudy;
  const isRedEye = project.slug === "red-eye-tickets";
  const isCats = project.slug === "cats-the-jellicle-ball";
  const isCompactCreative = project.caseStudyPresentation === "creative-compact";
  const isNeuralVisualizer = project.interactiveDemoComponent === "neural-visualizer";
  const demoIntro = isRedEye
    ? "Review audited Red Eye workflows through product captures and a portfolio-safe source snapshot."
    : isCompactCreative
      ? "Selected portions of the original front-end work, recreated so the responsive behavior remains reviewable."
      : isNeuralVisualizer
        ? "Explore an attributed public neuron morphology through a stripped-down version of the global controls and 3D navigation used in research visualization tools."
      : "Explore the preserved interaction without depending on a production site.";
  const caseMetricCards = isRedEye
    ? redEyeCaseMetrics
    : project.metrics?.slice(0, 4).map((metric) => {
        const [value, ...label] = metric.split(" ");
        return { value, label: label.join(" ") };
      });
  const decisionArtifacts = caseStudy?.productArtifacts?.slice(0, 3);
  const decisionItems = caseStudy?.decisions?.slice(0, 3);
  const implementationItems = (caseStudy?.built?.length ? caseStudy.built : caseStudy?.platformAreas)?.slice(0, 5);
  const outcomeItems = (caseStudy?.improvements?.length ? caseStudy.improvements : caseStudy?.outcomes)?.slice(0, 4);
  const lessonItems = caseStudy?.lessons?.slice(0, 2);
  const hasDecisions = Boolean(decisionArtifacts?.length || decisionItems?.length);
  const hasImplementation = Boolean(implementationItems?.length);
  const caseHeroFacts = [
    ...(isCats
      ? [
          project.roleLabel ? { label: "Role", value: project.roleLabel } : null,
          project.collaborationLabel
            ? { label: "Collaboration", value: project.collaborationLabel }
            : null,
          project.platformLabel ? { label: "Platform", value: project.platformLabel } : null,
          project.projectTypeLabel
            ? { label: "Project type", value: project.projectTypeLabel }
            : null,
        ]
      : [
          project.roleLabel ? { label: "Role", value: project.roleLabel } : null,
          project.period ? { label: "Period", value: project.period } : null,
          project.engagementLabel
            ? { label: isCompactCreative ? "Context" : "Evidence", value: project.engagementLabel }
            : null,
          project.launchLabel ? { label: "Launch", value: project.launchLabel } : null,
        ]),
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className={`case-hero-grid ${isCats ? "case-hero-grid--copy-only" : ""}`}>
            <div className="case-hero-copy">
              <Link className="back-link" href="/work/">
                <ArrowLeft aria-hidden="true" size={15} />
                Back to work
              </Link>
              <p className="eyebrow">{project.category}</p>
              <h1>{project.title}</h1>
              <p>{project.description}</p>
              <div className="tag-list" aria-label={`${project.title} tags`}>
                {project.tags.slice(0, isCats ? 4 : 3).map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              {!isCats ? (
                <div className="status-list" aria-label="Project status and provenance">
                  {project.statusLabels.map((status) => <span key={status}>{status}</span>)}
                </div>
              ) : null}
              {caseHeroFacts.length ? (
                <dl className="case-hero-facts">
                  {caseHeroFacts.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
            {!isCats ? (
              <figure className="case-hero-media">
                <Image
                  alt={project.imageAlt}
                  height={720}
                  priority
                  sizes="(max-width: 900px) 100vw, 44vw"
                  src={project.image}
                  width={1280}
                />
              </figure>
            ) : null}
          </div>
          {caseMetricCards?.length ? (
            <div className="case-metric-strip" aria-label={`${project.title} impact metrics`}>
              {caseMetricCards.map((metric) => (
                <article key={`${metric.value}-${metric.label}`}>
                  <strong data-count-value={metric.value}>{metric.value}</strong>
                  <span>{metric.label}</span>
                </article>
              ))}
            </div>
          ) : null}
          {isRedEye ? (
            <p className="case-metric-note">
              Production totals through {redEyeMetricsAsOf}; rounded down with QA and local fixtures excluded.{" "}
              <Link href="/work/red-eye-tickets/metrics/">Definitions and limitations →</Link>
            </p>
          ) : null}
          {caseStudy && (
            <CaseTabs
              hasDecisions={hasDecisions}
              hasImplementation={hasImplementation}
              hasLessons={Boolean(lessonItems?.length)}
              hasOutcomes={Boolean(outcomeItems?.length)}
              isCompactCreative={isCompactCreative}
              isCats={isCats}
              isRedEye={isRedEye}
            />
          )}
        </div>
      </section>

      {caseStudy && !isCats && (
        <Section id="overview" variant="tight">
          <article className="case-panel case-panel--lead">
            <h2>Overview</h2>
            <p>{caseStudy.overview}</p>
          </article>
          {caseStudy.discovery ? <FieldDiscovery discovery={caseStudy.discovery} /> : null}
          {caseStudy.usersAndWorkflows?.length ? <p className="eyebrow case-section-label">Users</p> : null}
          <UserWorkflowGrid items={caseStudy.usersAndWorkflows} />
          <div className="case-overview-grid case-overview-grid--three">
            {caseStudy.problem ? (
              <article className="case-panel">
                <h2>Problem</h2>
                <p>{caseStudy.problem}</p>
              </article>
            ) : null}
            {caseStudy.role ? (
              <article className="case-panel">
                <h2>Ownership</h2>
                <p>{caseStudy.role}</p>
              </article>
            ) : null}
            <ListPanel items={caseStudy.constraints?.slice(0, 3)} title="Constraints" />
          </div>
        </Section>
      )}

      {caseStudy && isCats ? (
        <Section id="overview" title="Project context" variant="tight">
          <article className="case-panel case-panel--lead cats-case-prose">
            <p>{caseStudy.overview}</p>
            {caseStudy.contextNotes?.map((note) => <p key={note}>{note}</p>)}
          </article>
        </Section>
      ) : null}

      {isCats && project.interactiveDemoComponent ? (
        <Section id="demos" variant="band">
          <ProjectEvidenceLinks project={project} />
          <DemoRenderer component={project.interactiveDemoComponent} />
        </Section>
      ) : null}

      {isCats && hasImplementation ? (
        <Section id="implementation" title="Selected contribution" variant="tight">
          <ListPanel items={implementationItems} />
        </Section>
      ) : null}

      {isCats && caseStudy?.implementationNotes?.length ? (
        <Section id="implementation-notes" title="Implementation" variant="tight">
          <article className="case-panel case-panel--lead cats-case-prose">
            {caseStudy.implementationNotes.map((note) => <p key={note}>{note}</p>)}
          </article>
        </Section>
      ) : null}

      {hasDecisions && !isCompactCreative && (
        <Section
          eyebrow="Decisions"
          id="decisions"
          title="Decisions that shaped the work"
          variant="tight"
        >
          {decisionArtifacts?.length ? (
            <div className="artifact-grid">
              {decisionArtifacts.map((artifact) => (
                <ProductArtifactCard artifact={artifact} key={artifact.title} />
              ))}
            </div>
          ) : <ListPanel items={decisionItems} title="Key decisions" />}
        </Section>
      )}

      {hasImplementation && !isCats && (
        <Section
          eyebrow={isCompactCreative ? "Creative engineering" : "Implementation"}
          id="implementation"
          title={isCompactCreative ? "What I contributed" : "What I built"}
          variant="tight"
        >
          <ListPanel
            items={implementationItems}
            title={isCompactCreative ? undefined : "Core implementation"}
          />
          <ListPanel items={caseStudy?.contributionNotes} title="Contribution boundary" />
          <TechnicalContext items={caseStudy?.techStack} />
        </Section>
      )}

      {hasDecisions && isCompactCreative && !isCats && (
        <Section
          eyebrow="Decisions"
          id="decisions"
          title="Three choices that shaped the work"
          variant="tight"
        >
          <ListPanel items={decisionItems} />
        </Section>
      )}

      {isRedEye && (
        <Section
          eyebrow="Production architecture"
          id="architecture"
          title="One system, four operational surfaces"
          intro="The buyer, producer, admin, and door experiences share authoritative commerce state, but each surface has different trust, density, and failure-mode requirements."
          variant="band"
        >
          <ArchitectureMap />
        </Section>
      )}

      {!isCompactCreative && (
        <Section eyebrow="Evidence" id="evidence" title="Work in context" variant="tight">
          {project.permissionsNote && (
            <details className="evidence-disclosure">
              <summary>Portfolio evidence note</summary>
              <p>{project.permissionsNote}</p>
            </details>
          )}
          {project.screenshots?.length ? (
            <div className="screenshot-grid">
              {project.screenshots.map((screenshot) => (
                <figure
                  className={`screenshot-card screenshot-card--${screenshotPresentation(screenshot)}`}
                  key={screenshot.src}
                >
                  <div className="screenshot-card__media">
                    <Image
                      alt={screenshot.alt}
                      height={screenshot.height ?? 720}
                      sizes="(max-width: 760px) 100vw, 50vw"
                      src={screenshot.src}
                      width={screenshot.width ?? 1280}
                    />
                  </div>
                  <figcaption>{screenshot.caption}</figcaption>
                </figure>
              ))}
            </div>
          ) : null}
          <ProjectEvidenceLinks project={project} />
        </Section>
      )}

      {isRedEye && (
        <Section
          eyebrow="Engineering evidence"
          id="artifacts"
          title="Decisions, incidents, and reliability work"
          intro="The artifacts below expose the reasoning and failure handling behind the interface—not just the finished screens."
          variant="tight"
        >
          {caseStudy?.secondaryArtifacts?.map((artifact) => (
            <SecondaryArtifactCard artifact={artifact} key={artifact.title} />
          ))}
          <EvidenceCards />
        </Section>
      )}

      {project.interactiveDemoComponent && !isCats && (
        <Section
          eyebrow={
            isCompactCreative
              ? "Selected work"
              : isNeuralVisualizer
                ? "Three.js research demo"
              : isRedEye && process.env.NEXT_PUBLIC_RED_EYE_DEMO_ENABLED !== "true"
                ? "Product evidence"
                : "Interactive evidence"
          }
          id="demos"
          title={
            isCompactCreative
              ? "Interaction recreation"
              : isNeuralVisualizer
                ? "3D neuron morphology explorer"
              : isRedEye && process.env.NEXT_PUBLIC_RED_EYE_DEMO_ENABLED !== "true"
                ? "Workflow captures"
                : "Workflow demo"
          }
          intro={demoIntro}
          variant="band"
        >
          {isCompactCreative && project.permissionsNote ? (
            <details className="evidence-disclosure">
              <summary>Portfolio evidence note</summary>
              <p>{project.permissionsNote}</p>
            </details>
          ) : null}
          {isCompactCreative ? <ProjectEvidenceLinks project={project} /> : null}
          <DemoRenderer component={project.interactiveDemoComponent} />
        </Section>
      )}

      {project.videoDemo && (
        <Section title="Screen recording fallback" variant="tight">
          <VideoFallback src={project.videoDemo} />
        </Section>
      )}

      {outcomeItems?.length ? (
        <Section eyebrow="Outcomes" id="outcomes" title="What changed" variant="band">
          <ListPanel items={outcomeItems} title="Results" />
        </Section>
      ) : null}

      {lessonItems?.length && !isCompactCreative ? (
        <Section eyebrow="Reflection" id="lessons" title="What I learned" variant="tight">
          <ListPanel items={lessonItems} title="Lessons" />
        </Section>
      ) : null}

      {lessonItems?.length && isCompactCreative && !isCats ? (
        <Section eyebrow="Reflection" id="lessons" title="Creative translation" variant="tight">
          <article className="case-panel case-panel--lead">
            <p>{lessonItems[0]}</p>
          </article>
        </Section>
      ) : null}
    </>
  );
}
