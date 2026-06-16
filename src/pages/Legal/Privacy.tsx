import React from "react";
import LegalPage from "./LegalPage";
import type { LegalSection } from "./LegalPage";
import { useLocale } from "../../contexts/LocaleContext";

const LAST_UPDATED = "June 16, 2026";

const Privacy: React.FC = () => {
  const { t } = useLocale();

  const sections: LegalSection[] = [
    {
      heading: t("Information we collect"),
      body: [t("To run your personalized tutor, SigmaLoop stores:")],
      bullets: [
        t(
          "Account information — your email address, a securely hashed password, your role, and an optional display name."
        ),
        t(
          "Learning content — the courses, lessons, and challenges generated for you, plus your submissions (code, math answers, and quiz selections) and their grading results."
        ),
        t(
          "Progress and stats — lesson completion, XP, day streak, and the date of your most recent activity."
        ),
        t(
          "Mentor conversations — the messages you exchange with the AI mentor and a log of any actions it takes on your behalf."
        ),
        t(
          "Preferences — your notification, privacy, language, and lesson-locking settings."
        ),
      ],
    },
    {
      heading: t("How we use your information"),
      body: [
        t(
          "We use your information to generate your curriculum, grade your work, track your progress, power the mentor chat, and remember your preferences. We do not sell your personal information, and we do not show third-party advertising."
        ),
      ],
    },
    {
      heading: t("AI processing and third parties"),
      body: [
        t(
          "SigmaLoop relies on external AI providers to generate content and grade answers. To do this, the relevant text — such as your mentor messages, your math answers, and the prompts used to build your courses — is sent to our AI providers (currently DeepSeek as the primary model and Google Gemini as an automatic fallback) for processing."
        ),
        t(
          "Programming submissions are additionally executed in a sandboxed code-runner to evaluate them against test cases. We share only what is needed to deliver these features, and these providers process the data on our behalf to return a result."
        ),
      ],
    },
    {
      heading: t("Cookies and local storage"),
      body: [
        t(
          "SigmaLoop does not use advertising or cross-site tracking cookies. Your browser's local storage holds a few practical items: your authentication token (so you stay signed in), your chosen interface language, your light/dark theme, and unsaved drafts of your answers. Clearing your browser storage signs you out and removes these."
        ),
      ],
    },
    {
      heading: t("Your choices and rights"),
      body: [
        t("You stay in control of your data. From the Settings page you can:"),
      ],
      bullets: [
        t("Update your display name and change your password."),
        t(
          "Adjust notification and privacy preferences, including usage analytics."
        ),
        t(
          "Export a full JSON copy of your account, courses, progress, and chats."
        ),
        t(
          "Permanently delete your account, which cascades to remove your courses, lessons, submissions, progress, chats, and generation jobs."
        ),
      ],
    },
    {
      heading: t("Notifications"),
      body: [
        t(
          "Your notification preferences (such as a curriculum-ready alert or a weekly progress recap) are stored and respected. Outbound email delivery is not enabled yet, so toggling these on records your consent but does not currently send mail; any future sender will honor these settings."
        ),
      ],
    },
    {
      heading: t("Data retention and security"),
      body: [
        t(
          "We keep your data for as long as your account exists, and remove it when you delete your account. Passwords are stored only as salted hashes, and access to your courses, lessons, and challenges is scoped to your account so other users cannot read your content."
        ),
      ],
    },
    {
      heading: t("Children's privacy"),
      body: [
        t(
          "SigmaLoop is intended for learners who are old enough to consent to these terms under the laws of their country, or who use it under the supervision of a parent, guardian, or school. We do not knowingly collect data from children where doing so would require consent we have not obtained."
        ),
      ],
    },
    {
      heading: t("Changes to this policy"),
      body: [
        t(
          "We may update this policy as the product evolves. When we do, we'll revise the 'last updated' date above. Significant changes will be made clear before they take effect."
        ),
      ],
    },
    {
      heading: t("Contact"),
      body: [
        t(
          "For any privacy question or request, reach us through the Contact page or at privacy@sigmaloop.app."
        ),
      ],
    },
  ];

  return (
    <LegalPage
      title={t("Privacy Policy")}
      updated={LAST_UPDATED}
      intro={t(
        "This policy explains what SigmaLoop collects, how it's used to power your personalized tutor, and the controls you have over your data."
      )}
      sections={sections}
    />
  );
};

export default Privacy;
