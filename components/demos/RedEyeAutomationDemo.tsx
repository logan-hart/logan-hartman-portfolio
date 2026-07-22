"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  GitPullRequest,
  LockKeyhole,
  RadioTower,
  ShieldCheck,
  Workflow,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { BrowserFrame } from "@/components/demos/BrowserFrame";

const stages = [
  {
    key: "detect",
    title: "Detect",
    icon: RadioTower,
    summary: "Production reports, alert issues, CI failures, and telemetry become bounded repair candidates.",
    proof: ["Signed artifact bundle", "72-hour automation digest", "CI failure intake"],
  },
  {
    key: "triage",
    title: "Triage",
    icon: Workflow,
    summary: "Errors are clustered by fingerprint, domain, severity, risk, and required verification path.",
    proof: ["Task generation", "Risk classification", "Suggested repro command"],
  },
  {
    key: "repair",
    title: "Repair",
    icon: GitPullRequest,
    summary: "Planner, executor, and reviewer passes run in isolated worktrees with PR-ready evidence.",
    proof: ["Plan", "Diff", "Verify log", "Rollback note"],
  },
  {
    key: "gate",
    title: "Gate",
    icon: ShieldCheck,
    summary: "Policy checks decide whether a fix can stage, hotfix, require approval, or block.",
    proof: ["Deploy lock", "Diff limits", "Required tests"],
  },
] as const;

const lanes = [
  {
    title: "staged_nightly_fix",
    label: "Nightly train",
    detail: "Non-urgent repairs stage into one controlled release path instead of deploying individually.",
  },
  {
    title: "urgent_safe_hotfix",
    label: "Safe hotfix",
    detail: "P0/P1 low- or medium-risk issues can move faster only after policy, tests, and production checks pass.",
  },
  {
    title: "urgent_approval_required",
    label: "Human approval",
    detail: "High-risk, financial, security, or uncertain changes prepare evidence but do not deploy automatically.",
  },
  {
    title: "block_escalate",
    label: "Escalate",
    detail: "Unclear blast radius, failed proof, recurrence, or missing telemetry stops the loop and raises the issue.",
  },
];

const metrics = [
  { value: "Local", label: "execution boundary" },
  { value: "Read-only", label: "production evidence access" },
  { value: "PR", label: "highest automatic output" },
  { value: "4", label: "policy-controlled deploy lanes" },
];

export function RedEyeAutomationDemo() {
  const [activeStage, setActiveStage] = useState<(typeof stages)[number]["key"]>("detect");
  const [activeLane, setActiveLane] = useState(lanes[0].title);
  const stage = stages.find((item) => item.key === activeStage) ?? stages[0];
  const lane = lanes.find((item) => item.title === activeLane) ?? lanes[0];
  const StageIcon = stage.icon;

  return (
    <BrowserFrame>
      <div className="automation-demo">
        <section className="automation-demo__intro">
          <div>
            <span className="category">Red Eye automation</span>
            <h3>Controlled repair workflow with human-owned release gates.</h3>
            <p>
              This locally verified prototype converts production and CI signals into bounded repair tasks, proof
              artifacts, policy decisions, and PR-ready hotfix or nightly-release paths. It is not presented as a
              production-deployed autonomous repair service.
            </p>
          </div>
          <div className="automation-demo__metrics" aria-label="Automation evidence metrics">
            {metrics.map((metric) => (
              <article key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="automation-demo__flow" aria-label="Controlled repair workflow stages">
          {stages.map((item) => {
            const Icon = item.icon;

            return (
              <button
                aria-current={item.key === stage.key}
                key={item.key}
                onClick={() => setActiveStage(item.key)}
                type="button"
              >
                <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </section>

        <section className="automation-demo__detail" aria-live="polite">
          <div className="automation-demo__detail-main">
            <StageIcon aria-hidden="true" size={30} strokeWidth={1.7} />
            <div>
              <span className="category">Current stage</span>
              <h4>{stage.title}</h4>
              <p>{stage.summary}</p>
            </div>
          </div>
          <div className="automation-demo__proof">
            {stage.proof.map((item) => (
              <span key={item}>
                <CheckCircle2 aria-hidden="true" size={15} />
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="automation-demo__lanes" aria-label="Deploy lane selector">
          {lanes.map((item) => (
            <button
              aria-pressed={item.title === activeLane}
              key={item.title}
              onClick={() => setActiveLane(item.title)}
              type="button"
            >
              <span>{item.label}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </section>

        <section className="automation-demo__lane-detail">
          <div>
            {lane.title === "urgent_safe_hotfix" ? (
              <Zap aria-hidden="true" size={22} />
            ) : lane.title === "block_escalate" ? (
              <AlertTriangle aria-hidden="true" size={22} />
            ) : (
              <LockKeyhole aria-hidden="true" size={22} />
            )}
            <strong>{lane.label}</strong>
          </div>
          <p>{lane.detail}</p>
          <span>
            Policy gate <ArrowRight aria-hidden="true" size={15} /> proof <ArrowRight aria-hidden="true" size={15} /> PR
            or escalation
          </span>
        </section>
      </div>
    </BrowserFrame>
  );
}
