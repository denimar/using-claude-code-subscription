"use client";

import { useState, useEffect, useCallback } from "react";
import { Task } from "@/lib/types";
import { TaskInput } from "@/components/TaskInput";
import { AgentPanel } from "@/components/AgentPanel";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cookiesReady, setCookiesReady] = useState<boolean | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Check if cookies exist on mount
  useEffect(() => {
    fetch("/api/cookies")
      .then((r) => r.json())
      .then((data) => setCookiesReady(data.exists))
      .catch(() => setCookiesReady(false));
  }, []);

  // Poll active task for updates
  useEffect(() => {
    if (!activeTaskId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tasks/${activeTaskId}`);
        if (!res.ok) return;
        const task: Task = await res.json();

        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? task : t))
        );

        // Stop polling if all agents are done
        const allDone = task.agents.every(
          (a) => a.status === "completed" || a.status === "error"
        );
        if (allDone) {
          setActiveTaskId(null);
          setIsSubmitting(false);
        }
      } catch {
        // ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeTaskId]);

  const handleSubmit = useCallback(async (description: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, agentCount: 3 }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create task");
        setIsSubmitting(false);
        return;
      }

      const task: Task = await res.json();
      setTasks((prev) => [task, ...prev]);
      setActiveTaskId(task.id);
    } catch {
      alert("Failed to create task");
      setIsSubmitting(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Multi-Agent Coding Runner
          </h1>
          <p className="text-muted-foreground mt-1">
            Launch parallel Claude agents to tackle coding tasks
          </p>
        </div>

        {/* Session status */}
        {cookiesReady === false && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
            <AlertTriangle className="size-5 text-yellow-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-600">
                No browser session found
              </p>
              <p className="text-muted-foreground mt-1">
                A browser will open on first run for you to log in to claude.ai.
                Your session will be saved automatically for future runs.
              </p>
            </div>
          </div>
        )}

        {cookiesReady === true && (
          <div className="mb-6">
            <Badge variant="outline" className="text-green-600 border-green-500/30">
              Browser session ready
            </Badge>
          </div>
        )}

        {/* Task input */}
        <div className="mb-8">
          <TaskInput onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>

        {/* Tasks */}
        {tasks.map((task) => (
          <div key={task.id} className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Task: {task.description}</h2>
              <p className="text-xs text-muted-foreground">
                {new Date(task.createdAt).toLocaleString()} &middot;{" "}
                {task.agents.length} agent(s)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {task.agents.map((agent) => (
                <AgentPanel key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No tasks yet. Describe a feature and launch agents.</p>
          </div>
        )}
      </div>
    </div>
  );
}
