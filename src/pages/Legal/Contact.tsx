import React from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck, MessageCircle, LifeBuoy } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import { ROUTES } from "../../constants/routes";
import { useLocale } from "../../contexts/LocaleContext";

interface ContactMethod {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  internal?: boolean;
}

const Contact: React.FC = () => {
  const { t } = useLocale();

  const methods: ContactMethod[] = [
    {
      icon: <Mail className="h-5 w-5" />,
      title: t("General support"),
      description: t(
        "Questions about your account, courses, or how something works."
      ),
      actionLabel: "support@sigmaloop.app",
      href: "mailto:support@sigmaloop.app",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: t("Privacy and data"),
      description: t(
        "Data export, deletion, or any question about how we handle your information."
      ),
      actionLabel: "privacy@sigmaloop.app",
      href: "mailto:privacy@sigmaloop.app",
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: t("Ask the mentor"),
      description: t(
        "For learning help, the fastest answer is usually your AI mentor."
      ),
      actionLabel: t("Open the mentor"),
      href: ROUTES.MENTOR,
      internal: true,
    },
  ];

  return (
    <MainLayout title={t("Contact")}>
      <div className="mx-auto max-w-3xl py-8">
        <header className="mb-10 border-b border-gray-100 pb-6 dark:border-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("Get in touch")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
            {t(
              "We'd love to hear from you — whether it's a question, a bug, or feedback that helps SigmaLoop teach better. Pick whichever channel fits."
            )}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {methods.map((method, i) => {
            const body = (
              <div className="flex h-full items-start gap-4">
                <div className="icon-tile h-11 w-11 shrink-0">
                  {method.icon}
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                    {method.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    {method.description}
                  </p>
                  <span className="mt-3 inline-block break-all text-sm font-medium text-indigo-600 group-hover:underline dark:text-indigo-400">
                    {method.actionLabel}
                  </span>
                </div>
              </div>
            );

            const cardClass =
              "glass-card group block rounded-xl p-5 transition-colors hover:border-indigo-200 dark:hover:border-indigo-500/30";

            return method.internal ? (
              <Link key={i} to={method.href} className={cardClass}>
                {body}
              </Link>
            ) : (
              <a key={i} href={method.href} className={cardClass}>
                {body}
              </a>
            );
          })}
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/[0.02]">
          <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {t(
              "SigmaLoop is an actively developed project, so we read every message and typically reply within a few business days. Including steps to reproduce and a screenshot helps us help you faster."
            )}
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;
