import puppeteer from "puppeteer";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { ResumeData } from "../types/resume.js";
import { renderHtml } from "./template.js";

export async function generatePdf(
  data: ResumeData,
  outputDir: string,
  fileName: string
): Promise<string> {
  const html = renderHtml(data);
  const outputPath = resolve(outputDir, `${fileName}.pdf`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for Inter font to load
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: {
        top: "0",
        bottom: "0",
        left: "0",
        right: "0",
      },
      preferCSSPageSize: false,
    });

    await writeFile(outputPath, pdfBuffer);
    return outputPath;
  } finally {
    await browser.close();
  }
}
