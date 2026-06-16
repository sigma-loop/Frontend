import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { cn } from "../../utils/cn";
import { useLocale } from "../../contexts/LocaleContext";

interface LearnNewThingButtonProps {
  size?: "sm" | "md";
  className?: string;
}

/**
 * Golden, AI-flavored CTA that kicks off a brand-new personalized course
 * (→ onboarding). Deliberately catchy — it's the primary "start learning"
 * action across the app.
 */
const LearnNewThingButton = ({
  size = "md",
  className,
}: LearnNewThingButtonProps) => {
  const { t } = useLocale();
  return (
    <Link to={ROUTES.ONBOARDING} className={cn("inline-block", className)}>
      <span
        className={cn(
          "group relative inline-flex items-center gap-1.5 rounded-lg font-semibold text-amber-950",
          "bg-amber-400 hover:bg-amber-300",
          "transition-colors active:scale-[.99]",
          size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
        )}
      >
        <Sparkles
          className={cn(
            "shrink-0 transition-transform group-hover:rotate-12",
            size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"
          )}
        />
        {t("Learn a New Thing!")}
      </span>
    </Link>
  );
};

export default LearnNewThingButton;
