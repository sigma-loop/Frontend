import React from "react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import LearnNewThingButton from "../components/ui/LearnNewThingButton";

const DesignSystemShowcase: React.FC = () => {
  const renderColumn = (isDark: boolean) => {
    return (
      <div
        className={`p-8 rounded-xl border flex flex-col gap-8 ${
          isDark
            ? "dark bg-[#0d1117] text-gray-100 border-gray-800"
            : "bg-gray-50 text-gray-900 border-gray-200"
        }`}
      >
        <h2 className="text-xl font-bold border-b pb-2 mb-2 dark:border-gray-800 border-gray-200">
          {isDark ? "Dark Theme" : "Light Theme"}
        </h2>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold eyebrow text-gray-500">Buttons</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" isLoading>Loading</Button>
          </div>
        </div>

        {/* Learn a New Thing Golden Button */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold eyebrow text-gray-500">AI Call-To-Action</h3>
          <div>
            <LearnNewThingButton />
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold eyebrow text-gray-500">Badges</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold eyebrow text-gray-500">Inputs</h3>
          <div className="max-w-md flex flex-col gap-4">
            <Input label="Normal Input" placeholder="Type something..." />
            <Input
              label="Input with Error"
              value="invalid-email"
              error="Please enter a valid email address."
              onChange={() => {}}
            />
          </div>
        </div>

        {/* Card */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold eyebrow text-gray-500">Card Component</h3>
          <Card
            title="Premium Course Card"
            footer={
              <div className="flex justify-between items-center w-full">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Estimated time: 2 hours
                </span>
                <Button variant="primary" size="sm">
                  Enroll Now
                </Button>
              </div>
            }
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This card highlights the visual language of the design system. It uses a solid border and subtle, curated colors.
            </p>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#161b22] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            SigmaLoop Design System
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            A montage of core design components and primitives in light and dark mode.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {renderColumn(false)}
          {renderColumn(true)}
        </div>
      </div>
    </div>
  );
};

export default DesignSystemShowcase;
