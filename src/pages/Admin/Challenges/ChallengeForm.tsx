// Challenge Form Component
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { adminService, type ChallengeCreatePayload, type ChallengeUpdatePayload } from "../../../services/adminService";
import api from "../../../services/api";
import type { JSendResponse, Challenge } from "../../../types/api";

const ChallengeForm: React.FC = () => {
  const { lessonId, challengeId } = useParams<{ lessonId: string; challengeId: string }>();
  const navigate = useNavigate();
  const isEdit = challengeId && challengeId !== "new";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    starterCodes: {
      python: "",
      javascript: "",
      cpp: "",
      java: "",
    },
    solutionCodes: {
      python: "",
      javascript: "",
      cpp: "",
      java: "",
    },
    injectedCodes: {
      python: "",
      javascript: "",
      cpp: "",
      java: "",
    },
    testCases: [
      { input: "", expectedOutput: "", isHidden: false },
    ],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchChallenge();
    }
  }, [challengeId]);

  const fetchChallenge = async () => {
    setIsFetching(true);
    try {
      const response = await api.get<JSendResponse<Challenge>>(`/challenges/${challengeId}`);
      const challenge = response.data.data;
      if (challenge) {
        setFormData({
          title: challenge.title,
          description: challenge.description || "",
          starterCodes: challenge.starterCodes as any,
          solutionCodes: (challenge.solutionCodes || {}) as any,
          injectedCodes: (challenge.injectedCodes || {}) as any,
          testCases: challenge.testCases?.map(tc => ({
            input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
            expectedOutput: typeof tc.expectedOutput === 'string' ? tc.expectedOutput : JSON.stringify(tc.expectedOutput),
            isHidden: tc.isHidden,
          })) || [{ input: "", expectedOutput: "", isHidden: false }],
        });
      }
    } catch (error) {
      console.error("Failed to fetch challenge:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Parse test cases
      // Parse test cases
      const testCases = formData.testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
      }));

      // Filter out empty starter codes
      const starterCodes: Record<string, string> = {};
      Object.entries(formData.starterCodes).forEach(([lang, code]) => {
        if (code.trim()) {
          starterCodes[lang] = code;
        }
      });

      // Filter out empty solution codes
      const solutionCodes: Record<string, string> = {};
      Object.entries(formData.solutionCodes).forEach(([lang, code]) => {
        if (code.trim()) {
          solutionCodes[lang] = code;
        }
      });

      // Filter out empty injected codes
      const injectedCodes: Record<string, string> = {};
      Object.entries(formData.injectedCodes).forEach(([lang, code]) => {
        if (code.trim()) {
          injectedCodes[lang] = code;
        }
      });

      if (isEdit) {
        await adminService.updateChallenge(challengeId!, {
          title: formData.title,
          description: formData.description,
          starterCodes,
          solutionCodes,
          injectedCodes,
          testCases,
        } as ChallengeUpdatePayload);
      } else {
        await adminService.createChallenge({
          lessonId: lessonId!,
          title: formData.title,
          description: formData.description,
          starterCodes,
          solutionCodes,
          injectedCodes,
          testCases,
        } as ChallengeCreatePayload);
      }

      navigate(`/admin/lessons/${lessonId}/challenges`);
    } catch (error) {
      console.error("Failed to save challenge:", error);
      alert("Failed to save challenge. Make sure test case JSON is valid.");
    } finally {
      setIsLoading(false);
    }
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: "", expectedOutput: "", isHidden: false }],
    });
  };

  const removeTestCase = (index: number) => {
    setFormData({
      ...formData,
      testCases: formData.testCases.filter((_, i) => i !== index),
    });
  };

  if (isFetching) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? "Edit Challenge" : "Create Challenge"}>
      <div className="max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {isEdit ? "Edit Challenge" : "Create Challenge"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Basic Info</h2>
            <div>
              {isEdit && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-[#0d1117] rounded-lg border border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                    Challenge ID
                  </span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300 select-all">
                    {challengeId}
                  </code>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description / Instructions (Markdown)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono text-sm dark:bg-gray-800/50 dark:text-gray-100"
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="# Problem Description..."
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Starter Codes</h2>
            <div className="space-y-4">
              {Object.entries(formData.starterCodes)
                .filter(([key]) => !key.startsWith('_')) // Hide _id or internal fields
                .map(([lang, code]) => (
                <div key={lang}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                    {lang}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono text-sm dark:bg-gray-800/50 dark:text-gray-100"
                    rows={6}
                    value={code}
                    onChange={(e) => setFormData({
                      ...formData,
                      starterCodes: { ...formData.starterCodes, [lang]: e.target.value }
                    })}
                    placeholder={`def solution():\n    pass`}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Solution Codes (Required)</h2>
            <div className="space-y-4">
              {Object.entries(formData.solutionCodes).map(([lang, code]) => (
                <div key={lang}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                    {lang}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono text-sm dark:bg-gray-800/50 dark:text-gray-100"
                    rows={6}
                    value={code}
                    onChange={(e) => setFormData({
                      ...formData,
                      solutionCodes: { ...formData.solutionCodes, [lang]: e.target.value }
                    })}
                    placeholder={`def solution():\n    return result`}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-1 dark:text-gray-100">Injected Code (I/O Wrapper)</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              This code is appended after the student's code before execution. Use it to read stdin,
              call the student's function, and print the result. Students do not see this code.
            </p>
            <div className="space-y-4">
              {Object.entries(formData.injectedCodes).map(([lang, code]) => (
                <div key={lang}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                    {lang}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono text-sm bg-amber-50 dark:bg-amber-900/20 dark:text-gray-100"
                    rows={4}
                    value={code}
                    onChange={(e) => setFormData({
                      ...formData,
                      injectedCodes: { ...formData.injectedCodes, [lang]: e.target.value }
                    })}
                    placeholder={`# Example for Python:\nprint(get_grade(int(input())))`}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-gray-100">Test Cases</h2>
              <Button type="button" size="sm" onClick={addTestCase}>
                Add Test Case
              </Button>
            </div>
            <div className="space-y-4">
              {formData.testCases.map((testCase, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium dark:text-gray-100">Test Case #{index + 1}</h3>
                    {formData.testCases.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTestCase(index)}
                        className="text-red-600 dark:text-red-400"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Input
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono text-sm dark:bg-gray-800/50 dark:text-gray-100"
                        rows={3}
                        value={testCase.input}
                        onChange={(e) => {
                          const newTestCases = [...formData.testCases];
                          newTestCases[index].input = e.target.value;
                          setFormData({ ...formData, testCases: newTestCases });
                        }}
                        placeholder='e.g. 1, 2, 3'
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expected Output
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono text-sm dark:bg-gray-800/50 dark:text-gray-100"
                        rows={3}
                        value={testCase.expectedOutput}
                        onChange={(e) => {
                          const newTestCases = [...formData.testCases];
                          newTestCases[index].expectedOutput = e.target.value;
                          setFormData({ ...formData, testCases: newTestCases });
                        }}
                        placeholder='e.g. 6'
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={testCase.isHidden}
                        onChange={(e) => {
                          const newTestCases = [...formData.testCases];
                          newTestCases[index].isHidden = e.target.checked;
                          setFormData({ ...formData, testCases: newTestCases });
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Hidden (students won't see this)</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/admin/lessons/${lessonId}/challenges`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ChallengeForm;
