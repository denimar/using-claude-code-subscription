import { Agent } from "./types";
import { appendAgentLog, updateAgent } from "./store";
import { runPlaywrightAgent } from "./playwrightRunner";

const AGENT_ROLES = [
  {
    name: "Architect",
    prefix:
      "IMPORTANT: Do NOT ask any clarifying questions. Do NOT ask for more details. Produce your full output immediately.\n\nYou are a senior software architect. You must plan the implementation and write the core structure for the following feature in a Next.js 16 app (App Router, React 19, TypeScript, Tailwind CSS v4). Output a detailed implementation plan with file structure, component hierarchy, and core code scaffolding. Be specific and produce complete code.\n\nFeature to architect: ",
  },
  {
    name: "Implementer",
    prefix:
      "IMPORTANT: Do NOT ask any clarifying questions. Do NOT ask for more details. Produce your full output immediately.\n\nYou are a coding agent. You must implement the following feature in a Next.js 16 app (App Router, React 19, TypeScript, Tailwind CSS v4). Output complete, working, production-ready code for every file needed. Include all imports, types, and exports. Do not leave placeholders or TODOs.\n\nFeature to implement: ",
  },
  {
    name: "Reviewer",
    prefix:
      "IMPORTANT: Do NOT ask any clarifying questions. Do NOT ask for more details. Produce your full output immediately.\n\nYou are a code review agent. Analyze the following feature request for a Next.js 16 app (App Router, React 19, TypeScript, Tailwind CSS v4) and provide: 1) potential edge cases, 2) security considerations, 3) performance concerns, 4) a complete reference implementation with code. Output detailed analysis and working code.\n\nFeature to review: ",
  },
];

export function createAgents(taskId: string, count: number = 3): Agent[] {
  const agents: Agent[] = [];
  for (let i = 0; i < Math.min(count, AGENT_ROLES.length); i++) {
    const role = AGENT_ROLES[i];
    agents.push({
      id: crypto.randomUUID(),
      name: role.name,
      status: "idle",
      logs: [],
      output: null,
      codeBlocks: [],
      error: null,
    });
  }
  return agents;
}

export async function executeAgent(
  taskId: string,
  agent: Agent,
  taskDescription: string
): Promise<void> {
  const role = AGENT_ROLES.find((r) => r.name === agent.name);
  const prompt = (role?.prefix || "") + taskDescription;

  updateAgent(taskId, agent.id, { status: "running" });
  appendAgentLog(taskId, agent.id, `Agent "${agent.name}" starting...`);

  try {
    const { response, codeBlocks } = await runPlaywrightAgent(prompt, {
      onLog: (message) => {
        appendAgentLog(taskId, agent.id, message);
      },
      onComplete: (resp) => {
        updateAgent(taskId, agent.id, {
          status: "completed",
          output: resp,
          codeBlocks: extractCodeBlocks(resp),
        });
      },
      onError: (error) => {
        updateAgent(taskId, agent.id, {
          status: "error",
          error,
        });
      },
    });

    // Ensure final state is set
    updateAgent(taskId, agent.id, {
      status: "completed",
      output: response,
      codeBlocks,
    });
    appendAgentLog(taskId, agent.id, "Agent completed successfully.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    updateAgent(taskId, agent.id, {
      status: "error",
      error: message,
    });
    appendAgentLog(taskId, agent.id, `Agent failed: ${message}`);
  }
}

function extractCodeBlocks(text: string): string[] {
  const regex = /```[\w]*\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

export async function runAllAgents(
  taskId: string,
  agents: Agent[],
  taskDescription: string
): Promise<void> {
  await Promise.all(
    agents.map((agent) => executeAgent(taskId, agent, taskDescription))
  );
}
