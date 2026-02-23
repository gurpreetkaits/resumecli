import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import {
  printStep,
  printSuccess,
  printError,
  printInfo,
  printDivider,
  createSpinner,
} from "./cli/ui.js";
import {
  promptGitHubUrl,
  promptJobDescription,
  promptOutputPrefs,
  confirmGenerate,
} from "./cli/prompts.js";
import { fetchGitHubProfile } from "./collectors/github.js";
import { collectLinkedInData } from "./collectors/linkedin.js";
import { analyzeJobDescription, generateResume, initializeClient, getProviderLabel } from "./ai/client.js";
import { generatePdf } from "./generators/pdf.js";
import { generateDocx } from "./generators/docx.js";
import type {
  AppConfig,
  GitHubProfile,
  LinkedInProfile,
  JobDescription,
} from "./types/resume.js";

export async function run(config: AppConfig): Promise<void> {
  // Initialize the AI client (supports Anthropic and OpenAI)
  await initializeClient();
  printInfo(`Using ${getProviderLabel()}`);

  const totalSteps = 6;

  // ─── Step 1: GitHub ────────────────────────────
  printStep(1, totalSteps, "GitHub Profile");
  printDivider();

  let github: GitHubProfile | null = null;
  const githubUrl = await promptGitHubUrl(config.githubUrl);

  if (githubUrl) {
    const spinner = createSpinner("Fetching GitHub data...");
    spinner.start();
    try {
      github = await fetchGitHubProfile(githubUrl);
      spinner.succeed(
        `Found ${github.name || github.username} (${github.publicRepos} repos, ${Object.keys(github.languages).length} languages)`
      );
    } catch (err) {
      spinner.fail(
        `Failed to fetch GitHub: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  } else {
    printInfo("Skipping GitHub data");
  }

  console.log();

  // ─── Step 2: LinkedIn ──────────────────────────
  printStep(2, totalSteps, "LinkedIn / Professional Data");
  printDivider();

  let linkedin: LinkedInProfile | null = null;
  let linkedinRawText: string | null = null;

  const linkedinResult = await collectLinkedInData();
  linkedin = linkedinResult.profile;
  linkedinRawText = linkedinResult.rawPastedText;

  if (linkedin) {
    printSuccess(`Loaded profile for ${linkedin.name}`);
  } else if (linkedinRawText) {
    printSuccess("Captured profile text (AI will parse it)");
  } else {
    printInfo("No LinkedIn data provided");
  }

  console.log();

  // ─── Step 3: Job Description ───────────────────
  printStep(3, totalSteps, "Target Job Description");
  printDivider();

  const jobText = await promptJobDescription(config.jobDescription);

  const jdSpinner = createSpinner("Analyzing job description with AI...");
  jdSpinner.start();

  let job: JobDescription;
  try {
    job = await analyzeJobDescription(jobText);
    jdSpinner.succeed(
      `Analyzed: ${job.title}${job.company ? ` at ${job.company}` : ""} (${job.keywords?.length || 0} keywords found)`
    );
  } catch (err) {
    jdSpinner.fail("Failed to analyze job description");
    throw err;
  }

  console.log();

  // ─── Step 4: Output Preferences ────────────────
  printStep(4, totalSteps, "Output Preferences");
  printDivider();

  const { format, fileName } = await promptOutputPrefs(config);

  console.log();

  // ─── Confirm ───────────────────────────────────
  if (!github && !linkedin && !linkedinRawText) {
    printError("No profile data provided. Please provide GitHub or LinkedIn data.");
    return;
  }

  const proceed = await confirmGenerate();
  if (!proceed) {
    printInfo("Cancelled.");
    return;
  }

  console.log();

  // ─── Step 5: AI Resume Generation ──────────────
  printStep(5, totalSteps, "Generating Resume with AI");
  printDivider();

  const aiSpinner = createSpinner(
    "AI is crafting your tailored resume..."
  );
  aiSpinner.start();

  let resumeData;
  try {
    resumeData = await generateResume(github, linkedin, linkedinRawText, job);
    aiSpinner.succeed("Resume content generated");
  } catch (err) {
    aiSpinner.fail("Failed to generate resume");
    throw err;
  }

  console.log();

  // ─── Step 6: File Generation ───────────────────
  printStep(6, totalSteps, "Creating Output Files");
  printDivider();

  const outputDir = resolve(config.outputDir);
  await mkdir(outputDir, { recursive: true });

  if (format === "pdf" || format === "both") {
    const pdfSpinner = createSpinner("Generating PDF...");
    pdfSpinner.start();
    try {
      const pdfPath = await generatePdf(resumeData, outputDir, fileName);
      pdfSpinner.succeed(`PDF: ${pdfPath}`);
    } catch (err) {
      pdfSpinner.fail(
        `PDF failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  if (format === "docx" || format === "both") {
    const docxSpinner = createSpinner("Generating DOCX...");
    docxSpinner.start();
    try {
      const docxPath = await generateDocx(resumeData, outputDir, fileName);
      docxSpinner.succeed(`DOCX: ${docxPath}`);
    } catch (err) {
      docxSpinner.fail(
        `DOCX failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  console.log();
  printDivider();
  printSuccess("Resume generation complete!");
  printInfo(`Files saved to: ${outputDir}/`);
  console.log();
}
