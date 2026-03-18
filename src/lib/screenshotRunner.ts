import { chromium, Browser } from "playwright";
import path from "path";
import fs from "fs";

const SCREENSHOTS_DIR = path.join(process.cwd(), "screenshots");

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

export async function takeScreenshot(
  url: string,
  filename: string
): Promise<string | null> {
  try {
    ensureScreenshotsDir();
    const browser = await getScreenshotBrowser();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    await page.route("**/*", (route) => {
      route.continue({
        headers: {
          ...route.request().headers(),
          "cache-control": "no-cache, no-store, must-revalidate",
          pragma: "no-cache",
        },
      });
    });
    const cacheBuster = `_cb=${Date.now()}`;
    const separator = url.includes("?") ? "&" : "?";
    const urlWithCacheBust = `${url}${separator}${cacheBuster}`;
    await page.goto(urlWithCacheBust, { waitUntil: "networkidle", timeout: 15_000 });
    await page.waitForTimeout(2000);
    const screenshotPath = path.join(SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    await page.close();
    await context.close();
    return filename;
  } catch (error) {
    console.error("Screenshot failed", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export function getScreenshotPath(filename: string): string {
  return path.join(SCREENSHOTS_DIR, filename);
}
