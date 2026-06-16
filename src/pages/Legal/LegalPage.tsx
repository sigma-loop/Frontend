import React from "react";
import type { ReactNode } from "react";
import MainLayout from "../../components/layouts/MainLayout";
import { useLocale } from "../../contexts/LocaleContext";

export interface LegalSection {
  /** Section heading (rendered as an <h2>). */
  heading: string;
  /** Body paragraphs, in order. */
  body?: string[];
  /** Optional bulleted list rendered after the body paragraphs. */
  bullets?: string[];
}

interface LegalPageProps {
  /** Page + document title (also the browser tab title). */
  title: string;
  /** Human-readable "last updated" date, e.g. "June 16, 2026". */
  updated: string;
  /** Lead paragraph shown under the title. */
  intro?: string;
  sections: LegalSection[];
  /** Extra content rendered after the sections (e.g. the Contact cards). */
  children?: ReactNode;
}

/**
 * Shared shell for the public legal / informational pages (Terms, Privacy).
 * Renders a single readable column inside the normal MainLayout chrome
 * (Navbar + Footer) so guests and members get a consistent experience.
 * Every string flows through `t()` so the on-demand translation layer can
 * localize these pages like the rest of the UI.
 */
const LegalPage: React.FC<LegalPageProps> = ({
  title,
  updated,
  intro,
  sections,
  children,
}) => {
  const { t } = useLocale();

  return (
    <MainLayout title={title}>
      <article className="mx-auto max-w-3xl py-8">
        <header className="mb-10 border-b border-gray-100 pb-6 dark:border-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t("Last updated: {date}", { date: updated })}
          </p>
          {intro && (
            <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
              {intro}
            </p>
          )}
        </header>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {`${i + 1}. ${section.heading}`}
              </h2>
              {section.body?.map((paragraph, j) => (
                <p
                  key={j}
                  className="mb-3 text-[15px] leading-relaxed text-gray-600 dark:text-gray-400"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-2 list-disc space-y-1.5 ps-5 text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
                  {section.bullets.map((bullet, k) => (
                    <li key={k}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {children}
      </article>
    </MainLayout>
  );
};

export default LegalPage;
