import type { LucideIcon } from "lucide-react";

type ApproachCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function ApproachCard({ title, description, icon: Icon }: ApproachCardProps) {
  return (
    <article className="approach-card">
      <span className="approach-card__icon">
        <Icon aria-hidden="true" size={22} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
