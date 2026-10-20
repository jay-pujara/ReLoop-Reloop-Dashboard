import React from "react";
import { SmoothLink } from "../motion/SmoothLink";
import {
  brand,
  contact,
  footer,
  materialCategories,
  tickerItems,
} from "../content/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="border-t border-[var(--line)] px-4 pb-10 pt-20 md:px-8 md:pt-28"
    >
      {/* Contact */}
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <span className="eyebrow tnum">08</span>
            <span className="eyebrow">{contact.eyebrow}</span>
          </div>
          <h2 className="display-sm max-w-[20ch]">
            {contact.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="body-copy mt-6 max-w-[52ch]">{contact.copy}</p>
        </div>

        <div className="flex shrink-0 flex-col gap-3">
          <SmoothLink
            href="/signup"
            className="flex h-12 items-center justify-center border border-[var(--fg)] bg-[var(--fg)] px-7 text-[14px] font-medium text-[var(--bg)] transition-opacity hover:opacity-85"
          >
            Create an account
          </SmoothLink>
          <SmoothLink
            href="/logistics"
            className="flex h-12 items-center justify-center border border-[var(--line)] px-7 text-[14px] font-medium text-[var(--fg)] transition-colors hover:border-[var(--fg)]"
          >
            Open Dashboard
          </SmoothLink>
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="mt-1 text-center text-[14px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
            >
              {contact.email}
            </a>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-20 grid gap-x-8 gap-y-12 border-t border-[var(--line)] pt-12 sm:grid-cols-2 lg:grid-cols-4">
        {footer.columns.map((column) => (
          <div key={column.title} className="flex flex-col gap-4">
            <span className="eyebrow">{column.title}</span>
            <ul className="flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <SmoothLink
                    href={link.href}
                    className="text-[15px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
                  >
                    {link.label}
                  </SmoothLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex flex-col gap-4">
          <span className="eyebrow">Materials</span>
          <ul className="flex flex-col gap-2.5">
            {materialCategories.map((category) => (
              <li key={category.slug}>
                <SmoothLink
                  href={`/listings?category=${category.slug}`}
                  className="text-[15px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
                >
                  {category.label}
                  <span className="tnum ml-2 text-[13px] text-[var(--faint)]">
                    {category.subtypes.length}
                  </span>
                </SmoothLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-14 max-w-[68ch] border-t border-[var(--line)] pt-8 text-[13px] text-[var(--muted)]">
        {footer.note}
      </p>

      <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
        {tickerItems.map((item) => (
          <li key={item} className="eyebrow">
            {item}
          </li>
        ))}
      </ul>

      {/* Wordmark + colophon */}
      <div className="mt-16 border-t border-[var(--line)] pt-8">
        <span
          className="block select-none text-[clamp(3.4rem,15vw,11rem)] font-medium leading-[0.82] tracking-[-0.05em] text-[var(--fg)]"
          aria-hidden
        >
          {brand.wordmark}
        </span>

        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="eyebrow">
              © {year} {brand.legalName}
            </span>
            <span className="eyebrow">{brand.descriptor}</span>
            <span className="eyebrow">{brand.hq.lines.join(" · ")}</span>
          </div>

          <SmoothLink
            href="#top"
            className="eyebrow transition-colors hover:!text-[var(--fg)]"
          >
            Back to top ↑
          </SmoothLink>
        </div>
      </div>
    </footer>
  );
}
