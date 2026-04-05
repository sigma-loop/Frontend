import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import Button from "../../components/ui/Button";
import { aiService } from "../../services/aiService";

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

const GenerateCourse: React.FC = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const course = await aiService.generateCourse(
        prompt.trim(),
        difficulty || undefined
      );
      navigate(`/generated-courses/${course.id}`);
    } catch (err) {
      console.error("Failed to generate course:", err);
      setError("Failed to generate course. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <MainLayout title="Generate AI Course">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Generate a Course
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Describe what you want to learn and our AI will create a
            personalized course with lessons and coding challenges.
          </p>
        </div>

        <form
          onSubmit={handleGenerate}
          className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 space-y-6"
        >
          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What do you want to learn?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., I want to learn how to build REST APIs with Node.js and Express, including authentication, database design, and error handling..."
              className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              disabled={isGenerating}
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred difficulty (optional)
            </label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(difficulty === d ? "" : d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    difficulty === d
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  disabled={isGenerating}
                >
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating your course...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Course
              </span>
            )}
          </Button>

          {isGenerating && (
            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
              This may take a minute. We're creating lessons and challenges
              tailored to your request.
            </p>
          )}
        </form>
      </div>
    </MainLayout>
  );
};

export default GenerateCourse;
