import type { MetadataRoute } from "next";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/work", "/about", "/contact", "/demos"];
  const redEyeEvidenceRoutes = [
    "/work/red-eye-tickets/payment-integration",
    "/work/red-eye-tickets/postmortem-unicode-pdf",
    "/work/red-eye-tickets/adr-local-first-repair",
    "/work/red-eye-tickets/reliability",
    "/work/red-eye-tickets/metrics",
  ];
  const staticRoutes = routes.map((route) => ({
    url: `${profile.siteUrl}${route}/`,
    lastModified: new Date(),
  }));
  const projectRoutes = projects.map((project) => ({
    url: `${profile.siteUrl}/work/${project.slug}/`,
    lastModified: new Date(),
  }));

  const evidenceRoutes = redEyeEvidenceRoutes.map((route) => ({
    url: `${profile.siteUrl}${route}/`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...projectRoutes, ...evidenceRoutes];
}
