import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layouts/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import api from "../../services/api";
import { guestChatService } from "../../services/guestChatService";
import { ROUTES } from "../../constants/routes";
import type { JSendResponse, AuthResponse } from "../../types/api";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLocale();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError(t("Passwords don't match"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post<JSendResponse<AuthResponse>>(
        "/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        login(token, user);
        // Carry over a guest mentor conversation, if any, then land them there.
        const threadId = await guestChatService.importIfPending();
        navigate(
          threadId ? `${ROUTES.MENTOR}?thread=${threadId}` : ROUTES.DASHBOARD
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("Failed to register"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("Create an account")}
      subtitle={t("Start your journey with SigmaLoop today")}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-100 dark:border-red-800">
            <div className="flex">
              <div className="ms-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                  {t("Registration failed")}
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Input
          id="name"
          label={t("Full Name")}
          type="text"
          required
          autoComplete="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isLoading}
        />

        <Input
          id="email"
          label={t("Email address")}
          type="email"
          required
          autoComplete="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isLoading}
        />

        <Input
          id="password"
          label={t("Password")}
          type="password"
          required
          autoComplete="new-password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          disabled={isLoading}
        />

        <Input
          id="confirmPassword"
          label={t("Confirm Password")}
          type="password"
          required
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          disabled={isLoading}
        />

        <div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            {t("Create account")}
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-[#161b22] px-2 text-gray-500 dark:text-gray-400">
              {t("Already have an account?")}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Link to="/login">
            <Button variant="secondary" className="w-full">
              {t("Sign in")}
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
