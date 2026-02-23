import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
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

type AIProvider = "anthropic" | "openai";

let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;
let activeProvider: AIProvider;

async function getAnthropicApiKey(): Promise<string | null> {
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }

  if (process.env.CLAUDE_API_KEY) {
    return process.env.CLAUDE_API_KEY;
  }

  // Try reading from Claude's config directory (~/.claude/config.json)
  try {
    const claudeConfigPath = resolve(homedir(), ".claude", "config.json");
    const configData = await readFile(claudeConfigPath, "utf-8");
    const config = JSON.parse(configData);

    if (config.apiKey || config.api_key) {
      return config.apiKey || config.api_key;
    }
  } catch {
    // Claude config not found or not readable
  }

  return null;
}

function getOpenAIApiKey(): string | null {
  return process.env.OPENAI_API_KEY || null;
}

function detectProvider(): AIProvider {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();

  if (explicit === "openai") return "openai";
  if (explicit === "anthropic") return "anthropic";

  // Auto-detect: prefer OpenAI if its key is set, fall back to Anthropic
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) return "anthropic";

  // Default to anthropic (will fail later with a clear error if no key found)
  return "anthropic";
}

export function getActiveProvider(): AIProvider {
  return activeProvider;
}

export function getProviderLabel(): string {
  if (activeProvider === "openai") return "OpenAI (gpt-4o)";
  return "Anthropic (claude-sonnet-4-5)";
}

export async function initializeClient(): Promise<void> {
  activeProvider = detectProvider();

  if (activeProvider === "openai") {
    const apiKey = getOpenAIApiKey();
    if (!apiKey) {
      throw new Error(
        "No OpenAI API key found. Please set OPENAI_API_KEY in your .env file or environment."
      );
    }
    openaiClient = new OpenAI({ apiKey });
  } else {
    const apiKey = await getAnthropicApiKey();
    if (!apiKey) {
      throw new Error(
        "No API key found. Please:\n" +
        "  1. Set ANTHROPIC_API_KEY in .env file, OR\n" +
        "  2. Export ANTHROPIC_API_KEY or CLAUDE_API_KEY in your shell, OR\n" +
        "  3. Set OPENAI_API_KEY to use OpenAI instead"
      );
    }
    anthropicClient = new Anthropic({ apiKey });
  }
}

async function callAI(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  if (activeProvider === "openai") {
    if (!openaiClient) {
      throw new Error("OpenAI client not initialized. Call initializeClient() first.");
    }

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("No text response from OpenAI");
    }

    return text;
  }

  // Anthropic
  if (!anthropicClient) {
    throw new Error("Anthropic client not initialized. Call initializeClient() first.");
  }

  const response = await anthropicClient.messages.create({
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
  const raw = await callAI(SYSTEM_PROMPT, prompt);
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
  const raw = await callAI(SYSTEM_PROMPT, prompt);
  const cleaned = cleanJsonResponse(raw);
  const parsed = JSON.parse(cleaned);
  return ResumeDataSchema.parse(parsed);
}
