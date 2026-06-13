import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Home,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import PageMeta from "../../components/common/PageMeta";
import { CurriculumGeneratingSkeleton } from "../../components/common/LoadingSkeleton";
import { cn } from "../../utils/cn";
import { ROUTES, buildRoute } from "../../constants/routes";
import { TOPIC_LIBRARY } from "../../constants/topicLibrary";
import { questionnaireService } from "../../services/questionnaireService";
import { useCurriculumJob } from "../../hooks/useCurriculumJob";
import type { QuestionnaireQuestion, QuestionnaireGoals } from "../../types/api";

type Step = "topics" | "questions" | "review" | "generating";

const STEP_LABELS: Record<Step, string> = {
  topics: "Pick topics",
  questions: "Tailor it",
  review: "Review",
  generating: "Building",
};

const Onboarding = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("topics");
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [followUps, setFollowUps] = useState<QuestionnaireQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [freeText, setFreeText] = useState("");
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const { job, error: jobError } = useCurriculumJob(jobId);

  // Categories that have at least one selected topic.
  const selectedCategories = useMemo(
    () =>
      TOPIC_LIBRARY.filter((cat) =>
        cat.topics.some((t) => selectedTopics.has(t.id))
      ).map((cat) => cat.id),
    [selectedTopics]
  );

  // Navigate to the new course once generation is ready.
  useEffect(() => {
    if (job?.status === "READY" && job.courseId) {
      navigate(buildRoute(ROUTES.COURSE_DETAILS, { courseId: job.courseId }));
    }
  }, [job, navigate]);

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setSingle = (qid: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [qid]: [value] }));

  const toggleMulti = (qid: string, value: string) =>
    setAnswers((prev) => {
      const cur = prev[qid] ?? [];
      return {
        ...prev,
        [qid]: cur.includes(value)
          ? cur.filter((v) => v !== value)
          : [...cur, value],
      };
    });

  const handleTopicsNext = async () => {
    setIsLoadingQuestions(true);
    setError(null);
    try {
      const res = await questionnaireService.getFollowUps({
        topics: [...selectedTopics],
        categories: selectedCategories,
      });
      setFollowUps(res.questions ?? []);
      setStep("questions");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load questions");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const goals: QuestionnaireGoals = {
    topics: [...selectedTopics],
    categories: selectedCategories,
    followups: followUps
      .map((q) => ({
        question: q.question,
        answer: (answers[q.id] ?? []).join(", "),
      }))
      .filter((f) => f.answer),
    freeText: freeText.trim() || undefined,
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const createdJob = await questionnaireService.submit(goals);
      setJobId(createdJob.id);
      setStep("generating");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start generation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const chip = (active: boolean) =>
    cn(
      "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
      active
        ? "bg-indigo-600 border-indigo-600 text-white"
        : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400"
    );

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 flex flex-col">
      <PageMeta
        title="Start learning"
        description="Tell SigmaLoop what you want to learn"
      />

      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22]">
        <Link
          to={ROUTES.DASHBOARD}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-gray-400"
        >
          <Home className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2 text-sm">
          {(Object.keys(STEP_LABELS) as Step[]).map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span
                className={cn(
                  "font-medium",
                  s === step
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-400 dark:text-gray-600"
                )}
              >
                {STEP_LABELS[s]}
              </span>
              {i < 3 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
            </span>
          ))}
        </div>
        <div className="w-8" />
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Step: topics */}
          {step === "topics" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  What do you want to learn?
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Pick the topics you're interested in. We'll tailor a course
                  just for you.
                </p>
              </div>

              {TOPIC_LIBRARY.map((cat) => (
                <div key={cat.id}>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    {cat.label}
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                    {cat.blurb}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cat.topics.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTopic(t.id)}
                        className={chip(selectedTopics.has(t.id))}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleTopicsNext}
                  disabled={selectedTopics.size === 0 || isLoadingQuestions}
                  className="flex items-center gap-2"
                >
                  {isLoadingQuestions ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Tailoring…
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step: questions */}
          {step === "questions" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold mb-1">A few quick questions</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  These help us match the course to your level and goals.
                </p>
              </div>

              {followUps.map((q) => (
                <div key={q.id}>
                  <h3 className="font-semibold mb-3">{q.question}</h3>
                  {q.type === "text" ? (
                    <textarea
                      value={(answers[q.id] ?? [])[0] ?? ""}
                      onChange={(e) => setSingle(q.id, e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161b22] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Type your answer…"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(q.options ?? []).map((opt) => {
                        const sel = (answers[q.id] ?? []).includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              q.type === "multi"
                                ? toggleMulti(q.id, opt)
                                : setSingle(q.id, opt)
                            }
                            className={chip(sel)}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <div>
                <h3 className="font-semibold mb-3">
                  Anything else? (optional)
                </h3>
                <textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161b22] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. I'm preparing for interviews and prefer hands-on practice."
                />
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setStep("topics")}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep("review")}
                  className="flex items-center gap-2"
                >
                  Review
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: review */}
          {step === "review" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold mb-1">Ready to build</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Here's what we'll base your personalized course on.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {goals.topics.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 rounded-full text-sm bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                {goals.followups.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Your answers
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      {goals.followups.map((f, i) => (
                        <li key={i}>
                          <span className="text-gray-500 dark:text-gray-400">
                            {f.question}
                          </span>{" "}
                          — {f.answer}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {goals.freeText && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Notes
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {goals.freeText}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setStep("questions")}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isSubmitting ? "Starting…" : "Generate my course"}
                </Button>
              </div>
            </div>
          )}

          {/* Step: generating */}
          {step === "generating" && (
            <div className="space-y-8">
              {jobError || job?.status === "FAILED" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    {jobError ||
                      "Generation failed. Please try again."}
                  </div>
                  <Button variant="outline" onClick={() => setStep("review")}>
                    Try again
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
                    <div>
                      <h1 className="text-2xl font-bold">
                        Building your course…
                      </h1>
                      <p className="text-gray-500 dark:text-gray-400">
                        This takes a moment. You'll be taken there
                        automatically when it's ready.
                      </p>
                    </div>
                  </div>
                  <CurriculumGeneratingSkeleton />
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
