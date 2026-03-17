import { chromium, BrowserContext, Page } from "playwright";
import path from "path";
import fs from "fs";

const CLAUDE_URL = "https://claude.ai/new";
const RESPONSE_TIMEOUT = 120_000; // 2 minutes
const LOGIN_TIMEOUT = 120_000; // 2 minutes for manual login
const SESSION_DIR = path.join(process.cwd(), ".claude-session");

export interface RunnerCallbacks {
  onLog: (message: string) => void;
  onComplete: (response: string) => void;
  onError: (error: string) => void;
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

// Shared persistent context — lazily initialized, reused across agents
let sharedContext: BrowserContext | null = null;
let contextInitPromise: Promise<BrowserContext> | null = null;

async function getOrCreateContext(): Promise<BrowserContext> {
  if (sharedContext) return sharedContext;
  if (contextInitPromise) return contextInitPromise;

  contextInitPromise = initPersistentContext();
  sharedContext = await contextInitPromise;
  contextInitPromise = null;
  return sharedContext;
}

async function initPersistentContext(): Promise<BrowserContext> {
  const isFirstRun = !fs.existsSync(SESSION_DIR);

  if (isFirstRun) {
    console.log("[Session] No session directory found. First-time setup required.");
    console.log(`[Session] Session will be saved to: ${SESSION_DIR}`);
  } else {
    console.log(`[Session] Using existing session directory: ${SESSION_DIR}`);
  }

  console.log("[Session] Launching persistent browser...");

  const context = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: !isFirstRun,
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });

  // Verify login on startup
  const page = await context.newPage();
  await page.goto(CLAUDE_URL, { waitUntil: "networkidle", timeout: 30_000 });

  const loggedIn = await checkLoggedIn(page);

  if (!loggedIn) {
    if (isFirstRun) {
      console.log("[Session] Please log in to Claude in the opened browser...");
      console.log("[Session] Waiting for login (up to 2 minutes)...");
    } else {
      console.log("[Session] Session expired. Please log in again in the opened browser...");
      // Relaunch in headed mode if we were headless
      await page.close();
      await context.close();
      sharedContext = null;

      const headedContext = await chromium.launchPersistentContext(SESSION_DIR, {
        headless: false,
        userAgent:
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        viewport: { width: 1280, height: 800 },
      });
      const headedPage = await headedContext.newPage();
      await headedPage.goto(CLAUDE_URL, { waitUntil: "networkidle", timeout: 30_000 });
      await waitForLogin(headedPage);
      await headedPage.close();
      console.log("[Session] Session restored successfully.");
      return headedContext;
    }

    await waitForLogin(page);
  }

  await page.close();
  console.log("[Session] Session loaded successfully.");
  return context;
}

async function checkLoggedIn(page: Page): Promise<boolean> {
  return page
    .waitForSelector('[contenteditable="true"], textarea, div[role="textbox"]', {
      timeout: 10_000,
    })
    .then(() => true)
    .catch(() => false);
}

async function waitForLogin(page: Page): Promise<void> {
  const loggedIn = await page
    .waitForSelector('[contenteditable="true"], textarea, div[role="textbox"]', {
      timeout: LOGIN_TIMEOUT,
    })
    .then(() => true)
    .catch(() => false);

  if (!loggedIn) {
    throw new Error(
      "Login timed out. Please try again. If the problem persists, delete the .claude-session directory and restart."
    );
  }

  console.log("[Session] Login detected. Session saved automatically.");
}

export function sessionExists(): boolean {
  return fs.existsSync(SESSION_DIR);
}

export async function runPlaywrightAgent(
  prompt: string,
  callbacks: RunnerCallbacks
): Promise<{ response: string; codeBlocks: string[] }> {
  let page: Page | null = null;

  try {
    callbacks.onLog("Launching persistent browser...");
    const context = await getOrCreateContext();

    callbacks.onLog("Opening new page...");
    page = await context.newPage();

    callbacks.onLog("Navigating to claude.ai...");
    await page.goto(CLAUDE_URL, { waitUntil: "networkidle", timeout: 30_000 });

    // Check if we're logged in
    callbacks.onLog("Checking authentication...");
    const isLoggedIn = await checkLoggedIn(page);

    if (!isLoggedIn) {
      throw new Error(
        "Authentication failed — session may have expired. Delete .claude-session and restart."
      );
    }

    callbacks.onLog("Authenticated. Sending prompt...");

    // Find and fill the input
    const inputSelector =
      'div[contenteditable="true"], textarea, div[role="textbox"]';
    const input = await page.waitForSelector(inputSelector, { timeout: 10_000 });

    if (!input) {
      throw new Error("Could not find chat input element");
    }

    // Type the prompt
    await input.click();
    await page.keyboard.type(prompt, { delay: 10 });

    // Submit
    callbacks.onLog("Submitting prompt...");
    await page.keyboard.press("Enter");

    // Wait for response to start appearing
    callbacks.onLog("Waiting for Claude's response...");

    await page.waitForSelector('[data-is-streaming]', {
      timeout: 30_000,
    }).catch(() => {
      // Fallback: wait for any new message content
    });

    // Wait for streaming to finish
    await waitForResponseComplete(page, callbacks);

    // Extract the response text
    callbacks.onLog("Extracting response...");
    const responseText = await extractResponse(page);

    if (!responseText) {
      throw new Error("Could not extract response from Claude");
    }

    const codeBlocks = extractCodeBlocks(responseText);
    callbacks.onLog(
      `Completed. Extracted ${codeBlocks.length} code block(s).`
    );
    callbacks.onComplete(responseText);

    // Close the page but keep the context alive
    await page.close();

    return { response: responseText, codeBlocks };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    callbacks.onError(message);
    if (page) {
      try {
        await page.close();
      } catch {
        // ignore cleanup errors
      }
    }
    throw error;
  }
}

async function waitForResponseComplete(
  page: Page,
  callbacks: RunnerCallbacks
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < RESPONSE_TIMEOUT) {
    const isStreaming = await page
      .evaluate(() => {
        const el = document.querySelector("[data-is-streaming]");
        if (el) {
          return el.getAttribute("data-is-streaming") === "true";
        }
        const stopBtn = document.querySelector(
          'button[aria-label="Stop"], button[aria-label="Stop Response"]'
        );
        return !!stopBtn;
      })
      .catch(() => false);

    if (!isStreaming) {
      await page.waitForTimeout(2000);
      const stillStreaming = await page
        .evaluate(() => {
          const el = document.querySelector("[data-is-streaming]");
          if (el) {
            return el.getAttribute("data-is-streaming") === "true";
          }
          const stopBtn = document.querySelector(
            'button[aria-label="Stop"], button[aria-label="Stop Response"]'
          );
          return !!stopBtn;
        })
        .catch(() => false);

      if (!stillStreaming) {
        callbacks.onLog("Response complete.");
        return;
      }
    }

    await page.waitForTimeout(1000);
  }

  callbacks.onLog("Response timed out — extracting partial response.");
}

async function extractResponse(page: Page): Promise<string> {
  const response = await page.evaluate(() => {
    const selectors = [
      '[data-testid="chat-message-content"]:last-of-type',
      ".prose:last-of-type",
      '[class*="message"]:last-of-type .prose',
      '[class*="response"]',
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        const last = elements[elements.length - 1];
        return last.textContent || "";
      }
    }

    const allDivs = document.querySelectorAll("div");
    let longest = "";
    for (const div of allDivs) {
      const text = div.textContent || "";
      if (text.length > longest.length && text.length > 100) {
        longest = text;
      }
    }
    return longest;
  });

  return response.trim();
}
