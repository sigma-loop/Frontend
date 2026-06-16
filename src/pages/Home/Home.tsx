import React from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  Sigma,
  ListChecks,
  Wand2,
  MessageSquare,
  GraduationCap,
  ArrowRight,
  Check,
} from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import Button from "../../components/ui/Button";
import { ROUTES } from "../../constants/routes";
import { useLocale } from "../../contexts/LocaleContext";

const challengeKinds = [
  {
    icon: Code2,
    title: "Code",
    desc: "Write real code in the browser. Your solution runs against hidden test cases in a sandbox and is graded instantly.",
  },
  {
    icon: Sigma,
    title: "Math",
    desc: "Solve problems with a visual equation editor. The mentor checks your answer — even when it's written a different but equivalent way.",
  },
  {
    icon: ListChecks,
    title: "Quiz",
    desc: "Check your understanding with single- and multi-select questions, graded the moment you submit with an explanation for every option.",
  },
];

const steps = [
  {
    icon: MessageSquare,
    title: "Tell the mentor your goal",
    desc: "Chat about what you want to master, or answer a short guided questionnaire. No account needed to start.",
  },
  {
    icon: Wand2,
    title: "Get a course built for you",
    desc: "The mentor designs a personalized path — lessons, code, math, and quizzes — around exactly your level and goals.",
  },
  {
    icon: GraduationCap,
    title: "Learn the logic, not just the answer",
    desc: "Work through challenges with instant feedback. A lesson completes only once every challenge is passed.",
  },
];

const Home: React.FC = () => {
  const { t } = useLocale();

  // Heading with an inline highlighted word. The full phrase is translated as
  // one string (a sentinel token marks the highlight), then split so word
  // order survives translation/RTL — never concatenate translated fragments.
  const headingParts = t("Master the [[logic]] behind the code").split(
    "[[logic]]"
  );

  return (
    <MainLayout title={t("Home")}>
      {/* ── Hero ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: copy + CTAs */}
          <div className="text-center lg:text-start">
            <span className="eyebrow">
              {t("Your personal AI tutor · code & math")}
            </span>

            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              {headingParts[0]}
              <span className="text-gradient">{t("logic")}</span>
              {headingParts[1]}
            </h1>

            <p className="mx-auto lg:mx-0 mt-5 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              {t(
                "SigmaLoop builds a course around you — not a catalog. Talk to the mentor, and it generates the lessons, coding challenges, math problems, and quizzes that get you from where you are to where you want to be."
              )}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link to={ROUTES.MENTOR}>
                <Button size="lg" className="group">
                  {t("Chat with your mentor — free")}
                  <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="secondary" size="lg">
                  {t("Create free account")}
                </Button>
              </Link>
            </div>

            <ul className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
              {[
                "No credit card",
                "Start without signing up",
                "Built for your level",
              ].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500" />
                  {t(item)}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: mentor chat preview */}
          <div className="relative">
            <div className="glass-panel rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-800">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="ms-2 font-mono text-xs text-gray-400 dark:text-gray-500">
                  sigmaloop · mentor
                </span>
              </div>

              <div className="space-y-4 pt-4">
                {/* User bubble */}
                <div className="flex justify-end">
                  <p className="max-w-[80%] rounded-lg rounded-ee-sm bg-indigo-600 px-4 py-2.5 text-sm text-white">
                    {t(
                      "I want to learn recursion and a bit of the math behind it."
                    )}
                  </p>
                </div>

                {/* Mentor bubble */}
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <Sigma className="h-3.5 w-3.5" />
                  </span>
                  <div className="max-w-[85%] space-y-3">
                    <p className="rounded-lg rounded-ss-sm bg-gray-100 px-4 py-2.5 text-sm text-gray-700 dark:bg-white/5 dark:text-gray-200">
                      {t(
                        "Perfect. I'll start you with the call stack, then build up to recursive proofs. Building your course now…"
                      )}
                    </p>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d1117] px-3 py-2">
                      <Check className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                      <span className="flex-1 truncate text-xs text-gray-600 dark:text-gray-300">
                        {t("Created course “{name}”", {
                          name: "Recursion & Induction",
                        })}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {t("Open")}
                        <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent chip */}
            <div className="absolute -bottom-4 -start-3 hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] px-3.5 py-2 shadow-sm">
              <span className="icon-tile h-7 w-7">
                <Wand2 className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                {t("Personalized in seconds")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl">
          <span className="eyebrow">{t("How it works")}</span>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t("From “I want to learn X” to a course in minutes")}
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            {t(
              "Every course, lesson, and challenge is generated for one learner — you. No two paths look the same."
            )}
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative bg-white dark:bg-[#161b22] p-6"
            >
              <span className="absolute end-5 top-5 font-mono text-sm font-medium text-gray-300 dark:text-gray-700">
                0{i + 1}
              </span>
              <div className="icon-tile mb-4 h-11 w-11">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
                {t(step.title)}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {t(step.desc)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Three challenge kinds ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl">
          <span className="eyebrow">{t("Practice")}</span>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t("Three ways to actually practice")}
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            {t(
              "Reading isn't learning. Every lesson mixes hands-on challenges so the logic sticks."
            )}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {challengeKinds.map((kind) => (
            <div key={kind.title} className="glass-card rounded-xl p-6">
              <div className="icon-tile mb-5 h-12 w-12">
                <kind.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {t(kind.title)}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {t(kind.desc)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 pt-6">
        <div className="rounded-2xl bg-gray-900 dark:bg-[#161b22] dark:border dark:border-gray-800 px-6 py-14 text-center sm:px-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t("Ready to learn something new?")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            {t(
              "Start a conversation with your mentor right now — it's free, and you can save everything the moment you sign up."
            )}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={ROUTES.MENTOR}>
              <Button
                size="lg"
                className="group !bg-white !text-gray-900 hover:!bg-gray-100"
              >
                {t("Try the mentor")}
                <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
              </Button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button
                size="lg"
                variant="outline"
                className="!border-gray-700 !text-gray-200 hover:!bg-white/5"
              >
                {t("Create free account")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
