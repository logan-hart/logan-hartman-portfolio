"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { careerFacts } from "@/data/careerFacts";
import { portfolioSnapshotContract, validatePortfolioSnapshot, type PortfolioSnapshot } from "@/data/portfolioSnapshot";

const facts = careerFacts.redEye;
const baseline: PortfolioSnapshot = {
  schemaVersion: 1, contract: portfolioSnapshotContract, asOf: new Date(facts.metricsAsOf).toISOString(),
  metrics: {
    events: facts.metrics.salesGeneratingEvents, buyers: facts.metrics.uniqueBuyers,
    orders: facts.metrics.paidOrders, tickets: facts.metrics.ticketsSold, gpv: facts.metrics.capturedCharges,
  },
};
const SnapshotContext = createContext(baseline);

export function LivePortfolioStatistics({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState(baseline);
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_PORTFOLIO_METRICS_URL?.trim();
    if (!url) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    let active = true;
    async function load() {
      try {
        const endpoint = new URL(url!);
        if (endpoint.username || endpoint.password || endpoint.search || endpoint.hash) return;
        if (endpoint.protocol !== "https:" && endpoint.hostname !== "127.0.0.1" && endpoint.hostname !== "localhost") return;
        const response = await fetch(endpoint, { credentials: "omit", cache: "no-cache", signal: controller.signal });
        if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) return;
        const text = await response.text();
        if (text.length > 4096) return;
        const verified = validatePortfolioSnapshot(JSON.parse(text), baseline);
        if (active && verified) setSnapshot(verified);
      } catch {
        // Keep the dated snapshot on timeout, stale data, CORS or schema failure.
      } finally {
        clearTimeout(timeout);
      }
    }
    void load();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, []);
  return <SnapshotContext.Provider value={snapshot}>{children}</SnapshotContext.Provider>;
}

export function LiveMetricDate() {
  const snapshot = useContext(SnapshotContext);
  return <>{snapshot === baseline ? facts.metricsAsOfLabel : dateLabel(snapshot.asOf)}</>;
}

function dateLabel(asOf: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles", year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }).format(new Date(asOf));
}

// Update existing prose as well as cards so one page cannot show mixed cutoffs.
export function LiveMetricText({ text }: { text: string }) {
  const snapshot = useContext(SnapshotContext);
  if (snapshot === baseline) return <>{text}</>;
  const replacements: Record<string, string> = {
    [facts.metrics.salesGeneratingEvents.value]: snapshot.metrics.events.value,
    [facts.metrics.uniqueBuyers.value]: snapshot.metrics.buyers.value,
    [facts.metrics.paidOrders.value]: snapshot.metrics.orders.value,
    [facts.metrics.ticketsSold.value]: snapshot.metrics.tickets.value,
    [facts.metrics.capturedCharges.value]: snapshot.metrics.gpv.value,
    [facts.metricsAsOfLabel]: dateLabel(snapshot.asOf),
  };
  const pattern = Object.keys(replacements).sort((a, b) => b.length - a.length)
    .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return <>{text.replace(new RegExp(`(?<![\\d])(${pattern})(?![\\d])`, "g"), (match) => replacements[match])}</>;
}
