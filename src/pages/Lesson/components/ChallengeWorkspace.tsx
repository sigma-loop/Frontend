import React from "react";
import ProgrammingWorkspace from "./ProgrammingWorkspace";
import MathWorkspace from "./MathWorkspace";
import MCQWorkspace from "./MCQWorkspace";
import { CHALLENGE_KINDS } from "../../../constants";
import type { Challenge } from "../../../types/api";

interface ChallengeWorkspaceProps {
  challenge: Challenge;
  selectedLanguage: string;
  availableLanguages: string[];
  onLanguageChange: (lang: string) => void;
  onChallengeCompleted?: () => void;
}

/**
 * Branches on challenge.kind: PROGRAMMING → Monaco workspace (Judge0),
 * MATH → LaTeX workspace (LLM grading), MCQ → multiple-choice (server graded).
 */
const ChallengeWorkspace: React.FC<ChallengeWorkspaceProps> = ({
  challenge,
  selectedLanguage,
  availableLanguages,
  onLanguageChange,
  onChallengeCompleted,
}) => {
  if (challenge.kind === CHALLENGE_KINDS.MATH) {
    return (
      <MathWorkspace
        key={challenge.id}
        challenge={challenge}
        onCompleted={onChallengeCompleted}
      />
    );
  }

  if (challenge.kind === CHALLENGE_KINDS.MCQ) {
    return (
      <MCQWorkspace
        key={challenge.id}
        challenge={challenge}
        onCompleted={onChallengeCompleted}
      />
    );
  }

  return (
    <ProgrammingWorkspace
      key={`${challenge.id}-${selectedLanguage}`}
      initialCode={challenge.starterCodes?.[selectedLanguage] ?? ""}
      language={selectedLanguage}
      challengeId={challenge.id}
      availableLanguages={availableLanguages}
      onLanguageChange={onLanguageChange}
      onCompleted={onChallengeCompleted}
    />
  );
};

export default ChallengeWorkspace;
