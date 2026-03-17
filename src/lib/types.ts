export type AgentStatus = "idle" | "running" | "completed" | "error";

export interface AgentLog {
  timestamp: number;
  message: string;
}

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  logs: AgentLog[];
  output: string | null;
  codeBlocks: string[];
  error: string | null;
}

export interface Task {
  id: string;
  description: string;
  agents: Agent[];
  createdAt: number;
}
