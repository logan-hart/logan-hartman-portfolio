"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const revealSelectors = [
  ".section",
  ".section-heading",
  ".metric-card",
  ".approach-card",
  ".featured-work-card",
  ".thinking-row",
  ".work-row",
  ".demo-tile",
  ".case-panel",
  ".screenshot-card",
  ".artifact-card",
  ".user-workflow-card",
  ".browser-frame",
  ".phone-frame",
  ".case-metric-strip article",
  ".artifact-flow span",
  ".red-eye-demo__steps button",
  ".automation-demo__flow button",
  ".automation-demo__metrics article",
  ".automation-demo__lanes button",
].join(",");

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function formatLikeTemplate(value: number, template: string) {
  const decimals = template.includes(".") ? template.split(".")[1]?.length ?? 0 : 0;
  const rounded = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();

  if (!template.includes(",")) {
    return rounded;
  }

  const [whole, fraction] = rounded.split(".");
  const formatted = Number(whole).toLocaleString("en-US");
  return fraction ? `${formatted}.${fraction}` : formatted;
}

function renderCount(template: string, progress: number) {
  return template.replace(/\d[\d,]*(?:\.\d+)?/g, (match) => {
    const target = Number(match.replaceAll(",", ""));
    if (!Number.isFinite(target)) return match;
    return formatLikeTemplate(target * progress, match);
  });
}

function animateCount(element: HTMLElement, reduceMotion: boolean) {
  if (element.dataset.countComplete === "true") return;

  const template = element.dataset.countValue || element.textContent || "";
  element.dataset.countComplete = "true";

  if (reduceMotion || !/\d/.test(template)) {
    element.textContent = template;
    return;
  }

  const duration = 1600;
  const start = performance.now();

  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    element.textContent = renderCount(template, easeOutCubic(progress));

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = template;
    }
  };

  element.textContent = renderCount(template, 0);
  requestAnimationFrame(tick);
}

export function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    root.classList.add("motion-ready");
    root.classList.toggle("motion-reduced", reduceMotion);

    let revealObserver: IntersectionObserver | undefined;
    let countObserver: IntersectionObserver | undefined;
    let cleanup = () => {};

    const setup = () => {
      const revealItems = Array.from(document.querySelectorAll<HTMLElement>(revealSelectors));
      const countItems = Array.from(
        document.querySelectorAll<HTMLElement>(".metric-card strong, .case-metric-strip strong"),
      );

      if (reduceMotion) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        countItems.forEach((item) => animateCount(item, true));
        return;
      }

      revealItems.forEach((item, index) => {
        item.classList.add("motion-reveal");

        const group = item.closest(".impact-grid, .approach-grid, .home-work-grid, .thinking-list, .artifact-flow");
        if (group) {
          const siblings = Array.from(group.querySelectorAll<HTMLElement>(revealSelectors));
          const siblingIndex = Math.max(siblings.indexOf(item), 0);
          item.style.setProperty("--motion-delay", `${Math.min(siblingIndex * 115, 460)}ms`);
        } else {
          item.style.setProperty("--motion-delay", `${Math.min(index * 28, 180)}ms`);
        }

        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) {
          item.classList.add("is-visible");
        }
      });

      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver?.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
      );

      revealItems.forEach((item) => revealObserver?.observe(item));

      countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCount(entry.target as HTMLElement, false);
            countObserver?.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.35 },
      );

      countItems.forEach((item) => countObserver?.observe(item));
    };

    const frame = requestAnimationFrame(() => {
      const timeout = window.setTimeout(setup, 40);
      cleanup = () => window.clearTimeout(timeout);
    });

    return () => {
      cleanup();
      cancelAnimationFrame(frame);
      revealObserver?.disconnect();
      countObserver?.disconnect();
    };
  }, [pathname]);

  return null;
}
