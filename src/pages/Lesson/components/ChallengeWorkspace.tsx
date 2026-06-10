import React from "react";
import ProgrammingWorkspace from "./ProgrammingWorkspace";
import MathWorkspace from "./MathWorkspace";
import { CHALLENGE_KINDS } from "../../../constants";
import type { Challenge } from "../../../types/api";

interface ChallengeWorkspaceProps {
  challenge: Challenge;
  selectedLanguage: string;
  availableLanguages: string[];
  onLanguageChange: (lang: string) => void;
}

/**
 * Branches on challenge.kind: PROGRAMMING → Monaco workspace (Judge0),
 * MATH → LaTeX workspace (LLM grading).
 */
const ChallengeWorkspace: React.FC<ChallengeWorkspaceProps> = ({
  challenge,
  selectedLanguage,
  availableLanguages,
  onLanguageChange,
}) => {
  if (challenge.kind === CHALLENGE_KINDS.MATH) {
    return <MathWorkspace key={challenge.id} challenge={challenge} />;
  }

  return (
    <ProgrammingWorkspace
      key={`${challenge.id}-${selectedLanguage}`}
      initialCode={challenge.starterCodes?.[selectedLanguage] ?? ""}
      language={selectedLanguage}
      challengeId={challenge.id}
      availableLanguages={availableLanguages}
      onLanguageChange={onLanguageChange}
    />
  );
};

export default ChallengeWorkspace;
