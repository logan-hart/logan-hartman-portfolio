import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export function MetricCard({ value, label, icon: Icon }: MetricCardProps) {
  return (
    <article className="metric-card">
      <Icon aria-hidden="true" className="metric-card__icon" size={32} strokeWidth={1.8} />
      <strong data-count-value={value}>{value}</strong>
      <p>{label}</p>
    </article>
  );
}
