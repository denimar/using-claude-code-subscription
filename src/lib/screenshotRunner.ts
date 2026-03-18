import { chromium, Browser } from "playwright";
import path from "path";
import fs from "fs";

const SCREENSHOTS_DIR = path.join(process.cwd(), "screenshots");
const MAX_RETRIES = 6;
const RETRY_DELAY_MS = 3000;

let screenshotBrowser: Browser | null = null;

async function getScreenshotBrowser(): Promise<Browser> {
  if (screenshotBrowser?.isConnected()) return screenshotBrowser;
  screenshotBrowser = await chromium.launch({ headless: true });
  return screenshotBrowser;
}

function ensureScreenshotsDir(): void {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

async function captureToFile(url: string, filepath: string): Promise<Buffer> {
  const browser = await getScreenshotBrowser();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load", timeout: 15_000 });
  await page.waitForTimeout(2000);
  const buffer = await page.screenshot({ path: filepath, fullPage: false });
  await page.close();
  await context.close();
  return buffer;
}

export async function takeScreenshot(
  url: string,
  filename: string
): Promise<string | null> {
  try {
    ensureScreenshotsDir();
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    await captureToFile(url, filepath);
    return filename;
  } catch (error) {
    console.error("Screenshot failed", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function takeAfterScreenshot(
  url: string,
  filename: string,
  beforeFilename: string,
  onLog?: (message: string) => void
): Promise<string | null> {
  try {
    ensureScreenshotsDir();
    const beforePath = path.join(SCREENSHOTS_DIR, beforeFilename);
    const beforeBuffer = fs.readFileSync(beforePath);
    const afterPath = path.join(SCREENSHOTS_DIR, filename);
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      onLog?.(`Taking after screenshot (attempt ${attempt}/${MAX_RETRIES})...`);
      const afterBuffer = await captureToFile(url, afterPath);
      if (!beforeBuffer.equals(afterBuffer)) {
        onLog?.(`Page changed detected on attempt ${attempt}.`);
        return filename;
      }
      if (attempt < MAX_RETRIES) {
        onLog?.(`Page unchanged, retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
    onLog?.("Page unchanged after all retries — using last capture.");
    return filename;
  } catch (error) {
    console.error("After screenshot failed", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export function getScreenshotPath(filename: string): string {
  return path.join(SCREENSHOTS_DIR, filename);
}
