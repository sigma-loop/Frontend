import React from "react";
import MainLayout from "../../components/layouts/MainLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const Curriculum: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: "Foundation",
      description: "Learn the basics of computer science and web development.",
      courses: [
        "Web Fundamentals",
        "JavaScript Basics",
        "Git & Version Control",
      ],
      status: "COMPLETED",
    },
    {
      id: 2,
      title: "Frontend Mastery",
      description: "Deep dive into modern frontend frameworks and UI design.",
      courses: [
        "React Deep Dive",
        "Advanced CSS & Tailwind",
        "State Management",
      ],
      status: "IN_PROGRESS",
    },
    {
      id: 3,
      title: "Backend & API",
      description: "Build robust server-side applications and databases.",
      courses: ["Node.js & Express", "PostgreSQL Database", "API Security"],
      status: "LOCKED",
    },
    {
      id: 4,
      title: "Full Stack Integration",
      description: "Connect frontend and backend to build complete products.",
      courses: ["Full Stack Deployment", "CI/CD Pipelines", "Capstone Project"],
      status: "LOCKED",
    },
  ];

  return (
    <MainLayout title="Curriculum Roadmap">
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-10">
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
            Curriculum Roadmap
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your step-by-step guide to becoming a Senior Developer.
          </p>
        </div>

        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              {/* Icon / Dot logic */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow
                ${
                  step.status === "COMPLETED"
                    ? "bg-green-500 border-green-500"
                    : step.status === "IN_PROGRESS"
                      ? "bg-indigo-600 border-indigo-600"
                      : "bg-white dark:bg-[#161b22] border-slate-300 dark:border-gray-700"
                }`}
              >
                {step.status === "COMPLETED" ? (
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span
                    className={`font-bold ${step.status === "LOCKED" ? "text-gray-400" : "text-white"}`}
                  >
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Card Content */}
              <Card
                className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 ${step.status === "LOCKED" ? "opacity-75 grayscale" : ""}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                    {step.title}
                  </h3>
                  <Badge
                    variant={
                      step.status === "COMPLETED"
                        ? "success"
                        : step.status === "IN_PROGRESS"
                          ? "info"
                          : "default"
                    }
                  >
                    {step.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{step.description}</p>

                <div className="space-y-2">
                  {step.courses.map((course) => (
                    <div
                      key={course}
                      className="flex items-center text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></span>
                      {course}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-indigo-600 dark:text-indigo-400"
                    disabled={step.status === "LOCKED"}
                  >
                    {step.status === "LOCKED" ? "Locked" : "View Details"}
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Curriculum;
