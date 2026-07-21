import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type EvidencePageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  meta: string[];
  children: ReactNode;
};

export function EvidencePage({ eyebrow, title, intro, meta, children }: EvidencePageProps) {
  return (
    <>
      <section className="page-hero evidence-page-hero">
        <div className="container evidence-page-hero__inner">
          <Link className="back-link" href="/work/red-eye-tickets/">
            <ArrowLeft aria-hidden="true" size={15} />
            Red Eye Tickets
          </Link>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="evidence-page-hero__intro">{intro}</p>
          <div className="evidence-page-meta" aria-label="Artifact metadata">
            {meta.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </section>
      <article className="evidence-article">
        <div className="container">{children}</div>
      </article>
    </>
  );
}

export function EvidenceSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="evidence-article-section">
      <span className="evidence-article-section__number">{number}</span>
      <div>
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  );
}

export function EvidenceCallout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="evidence-callout">
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  );
}
