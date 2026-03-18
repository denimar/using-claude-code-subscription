"use client";

import { useState, useEffect, useCallback } from "react";
import { Toolbar } from "@/components/Toolbar";
import { AgentPanel } from "@/components/AgentPanel";
import { PROJECTS, Task } from "@/lib/types";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string>(
    PROJECTS[0]?.id ?? ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Poll the active task while agents are running
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
        const allDone = task.agents.every(
          (a) => a.status === "completed" || a.status === "error"
        );
        if (allDone) {
          setIsLoading(false);
          setActiveTaskId(null);
          clearInterval(interval);
        }
      } catch {
        // silently ignore poll errors
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeTaskId]);

  const handleSubmit = useCallback(
    async (description: string) => {
      if (!selectedProject || isLoading) return;
      setIsLoading(true);
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description, projectId: selectedProject }),
        });
        if (!res.ok) throw new Error("Failed to create task");
        const task: Task = await res.json();
        setTasks((prev) => [task, ...prev]);
        setActiveTaskId(task.id);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    },
    [selectedProject, isLoading]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toolbar
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
            <p className="text-lg font-medium">No tasks yet</p>
            <p className="text-sm mt-1">
              Select a project and describe what you want to build above.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task) => (
              <div key={task.id} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold truncate max-w-xl">
                    {task.description}
                  </h2>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(task.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {task.agents.map((agent) => (
                    <AgentPanel key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
