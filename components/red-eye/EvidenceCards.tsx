import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { type EvidenceLink, redEyeEvidenceLinks } from "@/data/redEyeEvidence";

export function EvidenceCards({ items = redEyeEvidenceLinks }: { items?: EvidenceLink[] }) {
  return (
    <div className="red-eye-evidence-grid">
      {items.map((item) => (
        <Link className="red-eye-evidence-card" href={item.href} key={item.href}>
          <span className="category">{item.label}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <small>{item.meta}</small>
          <span className="red-eye-evidence-card__link">
            {item.linkLabel ?? "Read artifact"} <ArrowUpRight aria-hidden="true" size={16} />
          </span>
        </Link>
      ))}
    </div>
  );
}
