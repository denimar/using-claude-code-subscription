"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Bot, BarChart3, Layers } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }

  return (
    <div className="flex h-screen w-screen bg-white">
      {/* Left panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-b from-sky-50/80 via-white to-white flex-col justify-between p-12 overflow-hidden">
        {/* Top decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-300 via-sky-200 to-indigo-200" />

        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }} />

        {/* Top section */}
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-8">
            <Layers className="size-7 text-sky-500" />
          </div>
          <h1 className="text-5xl font-bold text-sky-500 mb-3">
            Stacktalk
          </h1>
          <p className="text-base text-neutral-500">
            AI-Powered Conversational App Builder
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-8">
          <FeatureItem
            icon={<Layers className="size-5 text-sky-500" />}
            title="Conversational Building"
            description="Turn ideas into apps through natural dialogue"
          />
          <FeatureItem
            icon={<Bot className="size-5 text-sky-500" />}
            title="Parallel AI Agents"
            description="Specialized agents working in parallel"
          />
          <FeatureItem
            icon={<BarChart3 className="size-5 text-sky-500" />}
            title="Real-Time Collaboration"
            description="Live dashboard and task management"
          />
        </div>

        {/* Bottom branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-white text-xs font-bold">
            S
          </div>
          <span className="text-sm text-neutral-400">
            Autonomous AI workforce management
          </span>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-neutral-50/50 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg shadow-neutral-200/60 border border-neutral-100 p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-sky-500 mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-neutral-500">
              Sign in to your Stacktalk account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-neutral-200 bg-white text-neutral-800 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 transition-all"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-11 pl-10 pr-12 rounded-lg border border-neutral-200 bg-white text-neutral-800 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-neutral-300 text-sky-500 focus:ring-sky-400/40 bg-white"
                />
                <span className="text-sm text-neutral-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-sky-500 hover:text-sky-600 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm shadow-md shadow-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Enter hint */}
          <p className="text-center text-xs text-neutral-400 mt-4">
            Press <kbd className="px-1.5 py-0.5 rounded border border-neutral-200 bg-neutral-50 text-neutral-500 text-[11px] font-mono">Enter</kbd> to sign in
          </p>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-400 uppercase">or</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          {/* Request access */}
          <p className="text-center text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <button className="text-sky-500 hover:text-sky-600 font-medium transition-colors">
              Request access
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm border border-neutral-100">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-neutral-800">{title}</h3>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
    </div>
  );
}
