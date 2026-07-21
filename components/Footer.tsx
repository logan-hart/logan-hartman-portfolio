import Link from "next/link";
import { ArrowUpRight, Github, Linkedin } from "lucide-react";
import { profile } from "@/data/profile";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <span className="footer-kicker">Logan Hartman</span>
            <p>Product-minded technical builder turning messy workflows into usable systems.</p>
          </div>
          {profile.email ? (
            <a className="footer-email" href={`mailto:${profile.email}`}>
              {profile.email} <ArrowUpRight aria-hidden="true" size={20} />
            </a>
          ) : (
            <a className="footer-email" href={profile.linkedIn} rel="noreferrer" target="_blank">
              Connect on LinkedIn <ArrowUpRight aria-hidden="true" size={20} />
            </a>
          )}
        </div>
        <div className="footer-bottom">
          <span>Product engineering · workflow systems · AI-assisted delivery</span>
          <div className="footer-links" aria-label="Footer links">
            <Link href="/work/">Work</Link>
            <Link href="/#approach">Approach</Link>
            <Link href="/about/">About</Link>
            <Link href="/contact/">Contact</Link>
            <a aria-label="GitHub" href={profile.github} rel="noreferrer" target="_blank">
              <Github aria-hidden="true" size={18} />
            </a>
            <a aria-label="LinkedIn" href={profile.linkedIn} rel="noreferrer" target="_blank">
              <Linkedin aria-hidden="true" size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
