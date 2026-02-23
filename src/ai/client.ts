import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { homedir } from "node:os";
import {
  type GitHubProfile,
  type LinkedInProfile,
  type JobDescription,
  type ResumeData,
  JobDescriptionSchema,
  ResumeDataSchema,
} from "../types/resume.js";
import {
  SYSTEM_PROMPT,
  buildAnalyzeJobPrompt,
  buildResumePrompt,
} from "./prompts.js";

let client: Anthropic;

async function getApiKey(): Promise<string> {
  // 1. Try ANTHROPIC_API_KEY from environment or .env
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }

  // 2. Try CLAUDE_API_KEY (alternative environment variable)
  if (process.env.CLAUDE_API_KEY) {
    return process.env.CLAUDE_API_KEY;
  }

  // 3. Try reading from Claude's config directory (~/.claude/config.json)
  // Note: Claude Code stores credentials in system keychain, not plain files
  try {
    const claudeConfigPath = resolve(homedir(), ".claude", "config.json");
    const configData = await readFile(claudeConfigPath, "utf-8");
    const config = JSON.parse(configData);

    if (config.apiKey || config.api_key) {
      return config.apiKey || config.api_key;
    }
  } catch {
    // Claude config not found or not readable, continue
  }

  throw new Error(
    "No API key found. Please:\n" +
    "  1. Set ANTHROPIC_API_KEY in .env file, OR\n" +
    "  2. Export ANTHROPIC_API_KEY or CLAUDE_API_KEY in your shell, OR\n" +
    "  3. Add API key to ~/.claude/config.json as {\"apiKey\": \"sk-ant-...\"}"
  );
}

function getClient(): Anthropic {
  if (!client) {
    throw new Error(
      "Client not initialized. Call initializeClient() first."
    );
  }
  return client;
}

export async function initializeClient(): Promise<void> {
  if (!client) {
    const apiKey = await getApiKey();
    client = new Anthropic({ apiKey });
  }
}

async function callClaude(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return textBlock.text;
}

function cleanJsonResponse(text: string): string {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return cleaned.trim();
}

export async function analyzeJobDescription(
  jobText: string
): Promise<JobDescription> {
  const prompt = buildAnalyzeJobPrompt(jobText);
  const raw = await callClaude(SYSTEM_PROMPT, prompt);
  const cleaned = cleanJsonResponse(raw);
  const parsed = JSON.parse(cleaned);
  return JobDescriptionSchema.parse(parsed);
}

export async function generateResume(
  github: GitHubProfile | null,
  linkedin: LinkedInProfile | null,
  linkedinRawText: string | null,
  job: JobDescription
): Promise<ResumeData> {
  const prompt = buildResumePrompt(github, linkedin, linkedinRawText, job);
  const raw = await callClaude(SYSTEM_PROMPT, prompt);
  const cleaned = cleanJsonResponse(raw);
  const parsed = JSON.parse(cleaned);
  return ResumeDataSchema.parse(parsed);
}
