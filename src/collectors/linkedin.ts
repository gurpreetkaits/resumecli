import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { LinkedInProfile } from "../types/resume.js";
import {
  promptLinkedInMethod,
  promptLinkedInManual,
  promptLinkedInPaste,
  promptJsonResumePath,
} from "../cli/prompts.js";

export interface LinkedInResult {
  profile: LinkedInProfile | null;
  rawPastedText: string | null;
}

export async function collectLinkedInData(): Promise<LinkedInResult> {
  const method = await promptLinkedInMethod();

  switch (method) {
    case "manual": {
      const profile = await promptLinkedInManual();
      return { profile, rawPastedText: null };
    }

    case "paste": {
      const rawText = await promptLinkedInPaste();
      return { profile: null, rawPastedText: rawText };
    }

    case "json": {
      const filePath = await promptJsonResumePath();
      const profile = await loadJsonResume(filePath);
      return { profile, rawPastedText: null };
    }

    case "skip":
    default:
      return { profile: null, rawPastedText: null };
  }
}

async function loadJsonResume(filePath: string): Promise<LinkedInProfile> {
  const abs = resolve(filePath);
  const raw = await readFile(abs, "utf-8");
  const json = JSON.parse(raw);

  // Support JSON Resume schema (https://jsonresume.org/schema/)
  const basics = json.basics || {};
  const work = json.work || [];
  const education = json.education || [];
  const skillsList = json.skills || [];

  return {
    name: basics.name || "Unknown",
    headline: basics.label || undefined,
    summary: basics.summary || undefined,
    location: basics.location?.city
      ? `${basics.location.city}, ${basics.location.region || ""}`
      : undefined,
    email: basics.email || undefined,
    phone: basics.phone || undefined,
    website: basics.url || basics.website || undefined,
    experience: work.map((w: Record<string, string>) => ({
      title: w.position || w.title,
      company: w.name || w.company,
      location: w.location,
      startDate: w.startDate,
      endDate: w.endDate,
      description: w.summary || w.description,
    })),
    education: education.map((e: Record<string, string>) => ({
      school: e.institution || e.school,
      degree: e.studyType || e.degree,
      field: e.area || e.field,
      startDate: e.startDate,
      endDate: e.endDate,
    })),
    skills: skillsList.flatMap((s: { keywords?: string[]; name?: string }) =>
      s.keywords ? s.keywords : s.name ? [s.name] : []
    ),
  };
}
