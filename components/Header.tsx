"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/work/", label: "Work" },
  { href: "/#approach", label: "Approach" },
  { href: "/about/", label: "About" },
];

function normalizePath(path: string) {
  if (path === "/") return path;
  return path.replace(/\/$/, "");
}

export function Header() {
  const pathname = usePathname();
  const normalizedPathname = normalizePath(pathname);
  const [hash, setHash] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link aria-label="Logan Hartman home" className="brand" href="/">
          <span aria-hidden="true" className="brand-mark">
            LH
          </span>
          <span className="brand-name">Logan Hartman</span>
        </Link>
        <button
          aria-controls="primary-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
        <nav
          aria-label="Primary navigation"
          className="nav"
          data-open={menuOpen ? "true" : "false"}
          id="primary-navigation"
        >
          {navItems.map((item) => {
            const itemPath = normalizePath(item.href.split("#")[0]);
            const itemHash = item.href.includes("#") ? `#${item.href.split("#")[1]}` : "";
            const isActive = itemHash
              ? normalizedPathname === itemPath && hash === itemHash
              : normalizedPathname === itemPath || (itemPath !== "/" && normalizedPathname.startsWith(itemPath));

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                href={item.href}
                key={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            aria-current={normalizedPathname === "/contact" ? "page" : undefined}
            className="nav-cta"
            href="/contact/"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
