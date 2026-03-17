import { Agent, Project } from "./types";
import { appendAgentLog, updateAgent } from "./store";
import { runPlaywrightAgent } from "./playwrightRunner";
import { getProjectContext } from "./projectContext";
import { parseFilesFromResponse, writeFilesToProject } from "./fileWriter";

const OUTPUT_INSTRUCTIONS = `

IMPORTANT OUTPUT FORMAT: When outputting code, ALWAYS include the full file path as a header above each code block, like:

**\`src/components/MyComponent.tsx\`**
\`\`\`tsx
// full file contents here
\`\`\`

This ensures each file can be identified and applied to the project.`;

const AGENT_ROLES = [
  {
    name: "Architect",
    prefix:
      "IMPORTANT: Do NOT ask any clarifying questions. Do NOT ask for more details. You have the full project context below — use it. Produce your full output immediately.\n\nYou are a senior software architect. Plan the implementation and write the core structure for the following feature. Study the project context provided below to understand the existing codebase, then output a detailed implementation plan with file structure, component hierarchy, and core code scaffolding that fits the existing project.\n\nFeature to architect: ",
  },
  {
    name: "Implementer",
    prefix:
      "IMPORTANT: Do NOT ask any clarifying questions. Do NOT ask for more details. You have the full project context below — use it. Produce your full output immediately.\n\nYou are a coding agent. Implement the following feature. Study the project context provided below to understand the existing codebase, tech stack, and patterns, then output complete, working, production-ready code for every file needed. Match the existing code style. Include all imports, types, and exports. Do not leave placeholders or TODOs.\n\nFeature to implement: ",
  },
  {
    name: "Reviewer",
    prefix:
      "IMPORTANT: Do NOT ask any clarifying questions. Do NOT ask for more details. You have the full project context below — use it. Produce your full output immediately.\n\nYou are a code review agent. Analyze the following feature request. Study the project context provided below to understand the existing codebase, then provide: 1) potential edge cases, 2) security considerations, 3) performance concerns, 4) a complete reference implementation with code that fits the existing project.\n\nFeature to review: ",
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
  taskDescription: string,
  contextBlock: string,
  project: Project
): Promise<void> {
  const role = AGENT_ROLES.find((r) => r.name === agent.name);
  const prompt =
    (role?.prefix || "") +
    taskDescription +
    "\n\n" +
    contextBlock +
    OUTPUT_INSTRUCTIONS;

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

    // Auto-apply files for the Implementer agent
    if (agent.name === "Implementer") {
      appendAgentLog(taskId, agent.id, "Parsing files from response...");
      const parsedFiles = parseFilesFromResponse(response);

      if (parsedFiles.length > 0) {
        appendAgentLog(
          taskId,
          agent.id,
          `Found ${parsedFiles.length} file(s): ${parsedFiles.map((f) => f.filePath).join(", ")}`
        );
        const result = await writeFilesToProject(project.dir, parsedFiles);

        for (const file of result.written) {
          appendAgentLog(taskId, agent.id, `Wrote: ${file}`);
        }
        for (const err of result.errors) {
          appendAgentLog(taskId, agent.id, `Failed to write ${err.file}: ${err.error}`);
        }
        appendAgentLog(
          taskId,
          agent.id,
          `Applied ${result.written.length} file(s) to ${project.dir}`
        );
      } else {
        appendAgentLog(taskId, agent.id, "No files with path headers found to apply.");
      }
    }

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
  taskDescription: string,
  project: Project
): Promise<void> {
  // Load project context once for all agents
  const contextBlock = await getProjectContext(project.dir);
  console.log(
    `[Context] Loaded ${(contextBlock.length / 1024).toFixed(1)}KB of project context for "${project.name}"`
  );

  await Promise.all(
    agents.map((agent) =>
      executeAgent(taskId, agent, taskDescription, contextBlock, project)
    )
  );
}
