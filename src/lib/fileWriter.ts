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

  // Match a file path header followed by a code block
  // The file path can appear in several formats before a code fence
  const pattern =
    /(?:\*{0,2}`([^`]+\.\w+)`\*{0,2}|#{1,4}\s+(`?([^\n`]+\.\w+)`?)|\/\/\s*(?:File:\s*)([^\n]+\.\w+))\s*\n\s*```[\w]*\n([\s\S]*?)```/g;

  let match;
  while ((match = pattern.exec(responseText)) !== null) {
    const filePath = (match[1] || match[3] || match[4] || "").trim();
    const content = match[5];

    if (filePath && content && isValidFilePath(filePath)) {
      files.push({ filePath, content: content.trimEnd() + "\n" });
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
