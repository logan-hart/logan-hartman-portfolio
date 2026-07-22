import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected work by Logan Hartman across product systems, workflow design, technical implementation, design engineering, and visual communication.",
  alternates: {
    canonical: "/work/",
  },
};

const primarySlugs = [
  "red-eye-tickets",
  "spotlight-strategies",
  "albert-einstein-college-of-medicine",
];

const primaryProjects = primarySlugs
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project): project is Project => Boolean(project));
const supportingProjects = projects.filter((project) => !primarySlugs.includes(project.slug));

function ProjectRow({ project, index, priority = false }: { project: Project; index: number; priority?: boolean }) {
  return (
    <article className="work-row">
      <Link aria-label={`View ${project.title} case study`} className="work-row__media" href={`/work/${project.slug}/`}>
        <Image
          alt=""
          height={720}
          priority={priority}
          sizes="(max-width: 720px) 100vw, 36vw"
          src={project.image}
          width={1280}
        />
      </Link>
      <div className="work-row__body">
        <div className="work-row__topline">
          <span className="category">{project.category}</span>
          <span>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <div className="status-list" aria-label={`${project.title} project status`}>
          {project.statusLabels.map((status) => <span key={status}>{status}</span>)}
        </div>
        {project.roleLabel ? (
          <p className="work-row__proof">
            {project.roleLabel}
            {project.period ? ` · ${project.period}` : ""}
            {project.engagementLabel ? ` · ${project.engagementLabel}` : ""}
          </p>
        ) : null}
        <Link className="card-link" href={`/work/${project.slug}/`}>
          View case study <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </article>
  );
}

export default function WorkPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Selected work</p>
          <h1>Systems built for real workflows.</h1>
          <p>Selected product systems, technical tools, and design engineering work.</p>
        </div>
      </section>
      <section className="section section--tight">
        <div className="container">
          <div className="work-section-heading">
            <p className="eyebrow">Core case studies</p>
            <h2>Product, technical, and customer-facing systems</h2>
            <p>Start here for the clearest evidence of ownership, implementation judgment, and operating impact.</p>
          </div>
          <div className="work-list">
            {primaryProjects.map((project, index) => (
              <ProjectRow index={index} key={project.slug} priority={index === 0} project={project} />
            ))}
          </div>

          <div className="work-section-heading work-section-heading--supporting">
            <p className="eyebrow">Design engineering and visual communication</p>
            <h2>Design engineering and communication work</h2>
            <p>Selected work showing how I translate creative direction, information, and interaction concepts into polished digital experiences.</p>
          </div>
          <div className="work-list">
            {supportingProjects.map((project, index) => (
              <ProjectRow index={primaryProjects.length + index} key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
