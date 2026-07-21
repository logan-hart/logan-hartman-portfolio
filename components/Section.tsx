import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: ReactNode;
  variant?: "default" | "band" | "tight";
};

export function Section({ id, eyebrow, title, intro, children, variant = "default" }: SectionProps) {
  const className = [
    "section",
    variant === "band" ? "section--band" : "",
    variant === "tight" ? "section--tight" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={className} id={id}>
      <div className="container">
        {(eyebrow || title || intro) && (
          <div className="section-heading">
            <div>
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              {title && <h2>{title}</h2>}
            </div>
            {intro && <p>{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
