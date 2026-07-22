import type { Metadata } from "next";
import { ArrowUpRight, Download, Github, Linkedin, Mail } from "lucide-react";
import { Section } from "@/components/Section";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Logan Hartman for product engineering, workflow systems, AI-assisted delivery, and implementation roles.",
  alternates: {
    canonical: "/contact/",
  },
};

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Contact</p>
          <h1>Let&apos;s make the complex part clear.</h1>
          <p>Open to product engineering, founding engineering, and FDE roles where customer problems, product decisions, and implementation meet.</p>
        </div>
      </section>
      <Section variant="tight">
        <div className="contact-layout">
          <div className="contact-primary">
            <p className="eyebrow">Best way to reach me</p>
            <h2>{profile.email ?? "LinkedIn"}</h2>
            <p>
              Share the role, team, and problem that needs attention. Specific context is always useful.
            </p>
            {profile.email ? (
              <a className="button button--primary" href={`mailto:${profile.email}`}>
                Email Logan <Mail aria-hidden="true" size={18} />
              </a>
            ) : (
              <a className="button button--primary" href={profile.linkedIn} rel="noreferrer" target="_blank">
                Message on LinkedIn <Linkedin aria-hidden="true" size={18} />
              </a>
            )}
          </div>
          <div className="contact-links" aria-label="Professional profiles">
            <a href={profile.linkedIn} rel="noreferrer" target="_blank">
              <Linkedin aria-hidden="true" size={20} />
              <span><strong>LinkedIn</strong><small>Experience and context</small></span>
              <ArrowUpRight aria-hidden="true" size={18} />
            </a>
            <a href={profile.github} rel="noreferrer" target="_blank">
              <Github aria-hidden="true" size={20} />
              <span><strong>GitHub</strong><small>Selected code, demos, and technical artifacts</small></span>
              <ArrowUpRight aria-hidden="true" size={18} />
            </a>
            {profile.resumeUrl ? (
              <a download href={profile.resumeUrl}>
                <Download aria-hidden="true" size={20} />
                <span><strong>Resume</strong><small>Download PDF</small></span>
                <ArrowUpRight aria-hidden="true" size={18} />
              </a>
            ) : null}
          </div>
        </div>
      </Section>
    </>
  );
}
