export interface Project {
  id: string;
  name: string;
  dir: string;
}

export const PROJECTS: Project[] = [
  {
    id: "using-claude-code-subscription",
    name: "using-claude-code-subscription",
    dir: "/home/denimar/projects/personal/using-claude-code-subscription",
  },
  {
    id: "encore-web",
    name: "encore-web",
    dir: "/home/denimar/projects/encore-web",
  },
];

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
  projectId: string;
  agents: Agent[];
  createdAt: number;
}
