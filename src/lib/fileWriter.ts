import fs from "fs/promises";
import path from "path";

export interface ParsedFile {
  filePath: string;
  content: string;
}

/**
 * Parse code blocks with file path headers from an agent response.
 * Looks for patterns like:
 *   **`src/components/Foo.tsx`**
 *   ```tsx
 *   ...code...
 *   ```
 * Also handles:
 *   `src/components/Foo.tsx`
 *   ### src/components/Foo.tsx
 *   // File: src/components/Foo.tsx
 */
export function parseFilesFromResponse(responseText: string): ParsedFile[] {
  const files: ParsedFile[] = [];
  const seen = new Set<string>();

  function addFile(filePath: string, content: string) {
    const clean = filePath.trim().replace(/^[`*#\s]+|[`*\s]+$/g, "");
    if (clean && content && isValidFilePath(clean) && !seen.has(clean)) {
      seen.add(clean);
      files.push({ filePath: clean, content: content.trimEnd() + "\n" });
    }
  }

  // Strategy 1: Any line containing a file-path-like string followed by a code fence
  // This is intentionally broad to catch: **`path`**, **path**, `path`, ### path, etc.
  const broadPattern =
    /^[#*`\s]*([a-zA-Z0-9_./\-]+\/[a-zA-Z0-9_.\-]+\.\w+)[`*\s]*$/gm;

  // Find all potential file path lines and check if a code fence follows
  let pathMatch;
  while ((pathMatch = broadPattern.exec(responseText)) !== null) {
    const filePath = pathMatch[1];
    const afterMatch = responseText.slice(pathMatch.index + pathMatch[0].length);

    // Look for a code fence within the next few lines (allowing blank lines)
    const fenceMatch = afterMatch.match(/^\s*\n\s*```[\w]*\n([\s\S]*?)```/);
    if (fenceMatch) {
      addFile(filePath, fenceMatch[1]);
    }
  }

  // Strategy 2: Code block with a file path comment on the first line
  // Matches: ```tsx\n// src/components/Foo.tsx\n...```
  if (files.length === 0) {
    const commentPattern =
      /```[\w]*\n\/\/\s*([\w/.:-]+\.\w+)\n([\s\S]*?)```/g;

    let match;
    while ((match = commentPattern.exec(responseText)) !== null) {
      addFile(match[1], match[2]);
    }
  }

  return files;
}

function isValidFilePath(p: string): boolean {
  // Must look like a relative file path (no absolute paths, no traversal)
  if (p.startsWith("/") || p.includes("..")) return false;
  // Must have a file extension
  if (!path.extname(p)) return false;
  // Must not be a dependency path
  if (p.includes("node_modules")) return false;
  return true;
}

/**
 * Write parsed files to the project directory.
 * Creates directories as needed.
 */
export async function writeFilesToProject(
  projectDir: string,
  files: ParsedFile[]
): Promise<{ written: string[]; errors: { file: string; error: string }[] }> {
  const written: string[] = [];
  const errors: { file: string; error: string }[] = [];

  for (const file of files) {
    const fullPath = path.join(projectDir, file.filePath);

    try {
      // Create parent directories
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      // Write the file
      await fs.writeFile(fullPath, file.content, "utf-8");
      written.push(file.filePath);
    } catch (err) {
      errors.push({
        file: file.filePath,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { written, errors };
}
