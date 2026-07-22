import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { profile } from "@/data/profile";
import "./globals.css";
import "./portfolio.css";

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: {
    default: "Logan Hartman | Product Engineer",
    template: "%s | Logan Hartman",
  },
  description: profile.subheadline,
  openGraph: {
    title: "Logan Hartman | Product Engineer",
    description: profile.subheadline,
    url: profile.siteUrl,
    siteName: "Logan Hartman Portfolio",
    type: "website",
    images: [
      {
        url: "/images/hero-workflow-background.webp",
        width: 1717,
        height: 916,
        alt: "Logan Hartman product engineering portfolio preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Logan Hartman | Product Engineer",
    description: profile.subheadline,
    images: ["/images/hero-workflow-background.webp"],
  },
  alternates: {
    canonical: "/",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: profile.siteUrl,
  ...(profile.email ? { email: `mailto:${profile.email}` } : {}),
  jobTitle: profile.title,
  knowsAbout: profile.expertise,
  sameAs: [profile.linkedIn, profile.github],
  description: profile.positioning,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="site-shell">
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </div>
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}
