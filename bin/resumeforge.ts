#!/usr/bin/env node

import "dotenv/config";
import { Command } from "commander";
import { printBanner, printError } from "../src/cli/ui.js";
import { run } from "../src/index.js";

const program = new Command();

program
  .name("resumeforge")
  .description("AI-powered resume builder using Claude")
  .version("1.0.0")
  .option("-g, --github <url>", "GitHub profile URL or username")
  .option("-j, --job <description>", "Job description text")
  .option("-o, --output <dir>", "Output directory", "./output")
  .option(
    "-f, --format <format>",
    'Output format: pdf, docx, or both',
    "pdf"
  )
  .option("-n, --name <filename>", "Output file name (without extension)", "resume")
  .action(async (options) => {
    printBanner();

    try {
      await run({
        githubUrl: options.github,
        jobDescription: options.job,
        outputDir: options.output,
        outputFormat: options.format,
        fileName: options.name,
      });
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("force closed")) {
          // User pressed Ctrl+C
          console.log("\n");
          process.exit(0);
        }
        printError(err.message);
      }
      process.exit(1);
    }
  });

program.parse();
