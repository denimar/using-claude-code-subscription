import { Task, Agent, AgentLog } from "./types";

// In-memory store for tasks
const tasks = new Map<string, Task>();

export function createTask(description: string): Task {
  const id = crypto.randomUUID();
  const task: Task = {
    id,
    description,
    agents: [],
    createdAt: Date.now(),
  };
  tasks.set(id, task);
  return task;
}

export function getTask(id: string): Task | undefined {
  return tasks.get(id);
}

export function getAllTasks(): Task[] {
  return Array.from(tasks.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function addAgentToTask(taskId: string, agent: Agent): void {
  const task = tasks.get(taskId);
  if (task) {
    task.agents.push(agent);
  }
}

export function updateAgent(
  taskId: string,
  agentId: string,
  updates: Partial<Agent>
): void {
  const task = tasks.get(taskId);
  if (!task) return;
  const agent = task.agents.find((a) => a.id === agentId);
  if (agent) {
    Object.assign(agent, updates);
  }
}

export function appendAgentLog(
  taskId: string,
  agentId: string,
  message: string
): void {
  const task = tasks.get(taskId);
  if (!task) return;
  const agent = task.agents.find((a) => a.id === agentId);
  if (agent) {
    agent.logs.push({ timestamp: Date.now(), message });
  }
}
