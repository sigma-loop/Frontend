import React from "react";
import { Code2, Calculator, ListChecks, CheckCircle2 } from "lucide-react";
import { cn } from "../../../utils/cn";
import { CHALLENGE_KINDS } from "../../../constants";
import type { Challenge } from "../../../types/api";
import { useLocale } from "../../../contexts/LocaleContext";

interface ChallengeTabsProps {
  challenges: Challenge[];
  activeIndex: number;
  completed: Set<string>;
  onSelect: (index: number) => void;
}

const kindIcon = (kind: Challenge["kind"]) => {
  if (kind === CHALLENGE_KINDS.MATH) return Calculator;
  if (kind === CHALLENGE_KINDS.MCQ) return ListChecks;
  return Code2;
};

/**
 * Tab strip to switch between the challenges of a multi-challenge lesson.
 * A check marks challenges the user has already passed.
 */
const ChallengeTabs: React.FC<ChallengeTabsProps> = ({
  challenges,
  activeIndex,
  completed,
  onSelect,
}) => {
  const { t } = useLocale();
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0d1117] flex-shrink-0">
      {challenges.map((ch, i) => {
        const Icon = kindIcon(ch.kind);
        const isActive = i === activeIndex;
        const isDone = completed.has(ch.id);
        return (
          <button
            key={ch.id}
            type="button"
            onClick={() => onSelect(i)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
              isActive
                ? "bg-indigo-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
            )}
          >
            {isDone ? (
              <CheckCircle2
                className={cn(
                  "w-3.5 h-3.5",
                  isActive ? "text-white" : "text-green-500"
                )}
              />
            ) : (
              <Icon className="w-3.5 h-3.5" />
            )}
            <span>{t("Challenge {n}", { n: i + 1 })}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ChallengeTabs;
