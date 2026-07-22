"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { BrowserFrame } from "@/components/demos/BrowserFrame";

const demoBaseUrl =
  (process.env.NEXT_PUBLIC_RED_EYE_DEMO_URL || "http://127.0.0.1:3003").replace(/\/$/, "");
const liveDemoEnabled = process.env.NEXT_PUBLIC_RED_EYE_DEMO_ENABLED === "true";
const auditedSourceCommit = "265bf05";

type WorkflowEvidenceItem = {
  key: string;
  label: string;
  route: string;
  summary: string;
  flow: string[];
  fallbackImage: string;
  fallbackAlt: string;
  imageWidth: number;
  imageHeight: number;
};

const demos: WorkflowEvidenceItem[] = [
  {
    key: "checkout",
    label: "Ticket Purchase",
    route: "/demo/checkout",
    summary: "Original public event, ticket selection, cart, and checkout handoff running on safe fixtures.",
    flow: ["Event", "Ticket selection", "Cart", "Payment handoff"],
    fallbackImage: "/images/red-eye/social-preview.webp",
    fallbackAlt: "Red Eye admin, producer, buyer, and check-in workflow overview",
    imageWidth: 1800,
    imageHeight: 1012,
  },
  {
    key: "seating",
    label: "Seating Map",
    route: "/demo/seating",
    summary: "Reserved seating map, seat states, hold creation, and checkout coordination from the Red Eye frontend.",
    flow: ["Performance", "Seat map", "Temporary hold", "Checkout"],
    fallbackImage: "/images/projects/red-eye-platform.svg",
    fallbackAlt: "Red Eye platform workflow illustration",
    imageWidth: 1280,
    imageHeight: 720,
  },
  {
    key: "checkin",
    label: "Check-In",
    route: "/demo/checkin",
    summary: "Door staff check-in dashboard with stats, scan/search flows, and ticket state handling.",
    flow: ["Door login", "Scan or search", "Validate state", "Admit"],
    fallbackImage: "/images/red-eye/checkin-mobile-scanner-admit.webp",
    fallbackAlt: "Red Eye mobile check-in admit screen",
    imageWidth: 646,
    imageHeight: 1400,
  },
  {
    key: "orders",
    label: "Order Ops",
    route: "/demo/orders",
    summary: "Admin order search, payment detail, ticket state, resend, and refund review surface.",
    flow: ["Find order", "Review payment", "Inspect tickets", "Support action"],
    fallbackImage: "/images/projects/red-eye-platform.svg",
    fallbackAlt: "Red Eye platform workflow illustration",
    imageWidth: 1280,
    imageHeight: 720,
  },
  {
    key: "producer",
    label: "Producer Setup",
    route: "/demo/producer",
    summary: "Event creation workflow mounted from the original producer/admin form code.",
    flow: ["Event details", "Schedule", "Inventory", "Readiness"],
    fallbackImage: "/images/red-eye/checkin-mobile-event-menu.webp",
    fallbackAlt: "Red Eye producer event controls",
    imageWidth: 646,
    imageHeight: 1400,
  },
];

const capturedEvidence: WorkflowEvidenceItem[] = [
  {
    key: "platform",
    label: "Platform & Brand Overview",
    route: "/evidence/platform",
    summary: "The shared platform boundary connecting buyer, producer, admin, and live-admissions workflows.",
    flow: ["Buyer", "Producer", "Admin", "Door staff"],
    fallbackImage: "/images/red-eye/social-preview.webp",
    fallbackAlt: "Red Eye admin, producer, buyer, and check-in workflow overview",
    imageWidth: 1800,
    imageHeight: 1012,
  },
  {
    key: "checkin",
    label: "Check-In Scanner",
    route: "/evidence/checkin",
    summary: "A real mobile scanner capture showing the successful ticket-admission state used by door staff.",
    flow: ["Scan", "Validate state", "Admit", "Attendance update"],
    fallbackImage: "/images/red-eye/checkin-mobile-scanner-admit.webp",
    fallbackAlt: "Red Eye mobile check-in admit screen",
    imageWidth: 646,
    imageHeight: 1400,
  },
  {
    key: "event-controls",
    label: "Event Controls",
    route: "/evidence/event-controls",
    summary: "A real event-control capture showing manual entry, settings, and operational status tools.",
    flow: ["Select event", "Choose door action", "Adjust settings", "Monitor status"],
    fallbackImage: "/images/red-eye/checkin-mobile-event-menu.webp",
    fallbackAlt: "Red Eye event operations menu",
    imageWidth: 646,
    imageHeight: 1400,
  },
];

export function RedEyeWorkflowDemo() {
  const displayedEvidence = liveDemoEnabled ? demos : capturedEvidence;
  const [activeKey, setActiveKey] = useState(liveDemoEnabled ? "checkout" : "platform");
  const activeDemo = displayedEvidence.find((demo) => demo.key === activeKey) ?? displayedEvidence[0];
  const demoUrl = useMemo(() => `${demoBaseUrl}${activeDemo.route}`, [activeDemo.route]);

  return (
    <div className="red-eye-live-demo">
      <div className="red-eye-live-demo__intro">
        <div>
          <span className="category">{liveDemoEnabled ? "Mounted Red Eye demo app" : "Audited Red Eye product evidence"}</span>
          <h3>{liveDemoEnabled ? "Actual frontend workflows, isolated from production data." : "One product overview and two in-product captures, preserved without production data."}</h3>
          <p>{activeDemo.summary}</p>
        </div>
        {liveDemoEnabled ? (
          <a className="card-link" href={demoUrl} rel="noreferrer" target="_blank">
            Open full demo <ArrowUpRight aria-hidden="true" size={17} />
          </a>
        ) : null}
      </div>
      <div aria-label="Red Eye demo workflow" className="red-eye-live-demo__tabs" role="tablist">
        {displayedEvidence.map((demo) => (
          <button
            aria-selected={demo.key === activeDemo.key}
            key={demo.key}
            onClick={() => setActiveKey(demo.key)}
            role="tab"
            type="button"
          >
            {demo.label}
          </button>
        ))}
      </div>
      <BrowserFrame urlLabel={liveDemoEnabled ? demoUrl : `evidence://red-eye/${activeDemo.key}`}>
        {liveDemoEnabled ? (
          <iframe
            allow="clipboard-read; clipboard-write"
            className="red-eye-live-demo__iframe"
            loading="lazy"
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts"
            src={demoUrl}
            title={`Red Eye ${activeDemo.label} demo`}
          />
        ) : (
          <div className="red-eye-demo-fallback">
            <div className="red-eye-demo-fallback__copy">
              <span>Audited workflow snapshot</span>
              <h4>{activeDemo.label}</h4>
              <p>{activeDemo.summary}</p>
              <div className="red-eye-demo-fallback__flow" aria-label={`${activeDemo.label} workflow stages`}>
                {activeDemo.flow.map((step) => <b key={step}>{step}</b>)}
              </div>
              <small>
                Provenance: portfolio-safe snapshot audited from Red Eye commit {auditedSourceCommit}. This evidence makes
                no production requests and does not depend on an interactive demo service being online.
              </small>
            </div>
            <figure className="red-eye-demo-fallback__media">
              <Image
                alt={activeDemo.fallbackAlt}
                height={activeDemo.imageHeight}
                sizes="(max-width: 680px) 100vw, 38vw"
                src={activeDemo.fallbackImage}
                width={activeDemo.imageWidth}
              />
            </figure>
          </div>
        )}
      </BrowserFrame>
      <p className="red-eye-live-demo__note">
        {liveDemoEnabled
          ? "Demo mode blocks production Red Eye APIs, payment processors, and customer data. The screens use portfolio-safe fixtures while preserving the original React routes, components, styles, and interaction logic."
          : "The optional interactive build can be deployed in isolation from production and is currently disabled. These audited captures keep the product evidence reviewable without depending on that service."}
      </p>
    </div>
  );
}
