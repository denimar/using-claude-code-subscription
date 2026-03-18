import { NextResponse } from "next/server";
import { createTask, getAllTasks, addAgentToTask } from "@/lib/store";
import { createAgents, runAllAgents } from "@/lib/runAgent";
import { PROJECTS } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getAllTasks());
}

export async function POST(request: Request) {
  const { description, agentCount = 1, projectId } = await request.json();

  if (!description || typeof description !== "string") {
    return NextResponse.json(
      { error: "Description is required" },
      { status: 400 }
    );
  }

  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) {
    return NextResponse.json(
      { error: "Invalid project selected" },
      { status: 400 }
    );
  }

  const task = createTask(description, projectId);
  const agents = createAgents(task.id, agentCount);

  // Add agents to task
  for (const agent of agents) {
    addAgentToTask(task.id, agent);
  }

  // Run agents in background (don't await)
  runAllAgents(task.id, agents, description, project).catch((err) => {
    console.error("Agent execution error:", err);
  });

  return NextResponse.json(task, { status: 201 });
}
