const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.RENDER_EXTERNAL_URL?.trim() ||
  "http://localhost:3100";

const configuredEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;

export const profile = {
  name: "Logan Hartman",
  title: "Product Engineer and Workflow Systems Builder",
  positioning: "I turn messy workflows into usable systems.",
  subheadline:
    "Product-minded technical builder focused on workflow design, implementation, product systems, and AI-assisted delivery.",
  supportingLine:
    "I map how people work, translate ambiguity into product decisions, and ship software that makes operations easier to run.",
  email: configuredEmail,
  linkedIn: "https://www.linkedin.com/in/logan-hartman4104/",
  github: "https://github.com/logan-hart",
  siteUrl: configuredSiteUrl.replace(/\/$/, ""),
  liveSiteNote:
    "External production sites can change after launch. This case study uses self-hosted captures, artifacts, and demos to preserve the relevant work.",
};
