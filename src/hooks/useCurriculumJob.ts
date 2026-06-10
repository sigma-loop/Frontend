import { useEffect, useRef, useState } from "react";
import { curriculumService } from "../services/curriculumService";
import type { CurriculumJob } from "../types/api";

const POLL_INTERVAL_MS = 4000;

/**
 * Polls /curriculum/jobs/:id until the job reaches READY or FAILED.
 * Pass null to disable (e.g. before a job exists).
 *
 * const { job, isGenerating } = useCurriculumJob(jobId);
 * if (job?.status === "READY") navigate(`/courses/${job.courseId}`);
 */
export function useCurriculumJob(jobId: string | null) {
  const [job, setJob] = useState<CurriculumJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prevJobId, setPrevJobId] = useState(jobId);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset state when switching to a different job (during render, per React docs)
  if (prevJobId !== jobId) {
    setPrevJobId(jobId);
    setJob(null);
    setError(null);
  }

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const data = await curriculumService.getJob(jobId);
        if (cancelled) return;
        setJob(data);
        if (data.status === "READY" || data.status === "FAILED") {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to poll job");
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    poll();
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [jobId]);

  const isGenerating =
    !!jobId &&
    !error &&
    (!job || job.status === "PENDING" || job.status === "GENERATING");

  return { job, error, isGenerating };
}
