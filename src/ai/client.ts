import Anthropic from "@anthropic-ai/sdk";
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

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY not set. Add it to .env or export it."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
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
