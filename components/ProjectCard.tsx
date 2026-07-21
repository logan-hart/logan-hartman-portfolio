import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";

type ProjectCardProps = {
  project: Project;
  detailed?: boolean;
};

export function ProjectCard({ project, detailed = false }: ProjectCardProps) {
  return (
    <article className="project-card">
      <Link className="project-card__media" href={`/work/${project.slug}/`} aria-label={`View ${project.title}`}>
        <Image alt="" height={720} sizes="(max-width: 760px) 100vw, 33vw" src={project.image} width={1280} />
      </Link>
      <div className="project-card__body">
        <div className="category">{project.category}</div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        {detailed && project.metrics && (
          <ul>
            {project.metrics.map((metric) => (
              <li key={metric}>{metric}</li>
            ))}
          </ul>
        )}
        <div className="tag-list" aria-label={`${project.title} tags`}>
          {project.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <Link className="card-link" href={`/work/${project.slug}/`}>
          View case study <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </article>
  );
}
