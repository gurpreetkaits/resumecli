import {
  input,
  select,
  editor,
  confirm,
} from "@inquirer/prompts";
import { theme, printDivider, printInfo } from "./ui.js";
import type {
  AppConfig,
  LinkedInInputMethod,
  LinkedInProfile,
} from "../types/resume.js";

export async function promptGitHubUrl(
  existingUrl?: string
): Promise<string | undefined> {
  if (existingUrl) return existingUrl;

  const url = await input({
    message: theme.coral("GitHub profile URL or username:"),
    validate: (val) => {
      if (!val) return true; // optional
      const cleaned = val.replace(/\/$/, "");
      if (
        cleaned.match(/^https?:\/\/github\.com\/[\w-]+$/) ||
        cleaned.match(/^[\w-]+$/)
      ) {
        return true;
      }
      return "Enter a valid GitHub URL (https://github.com/username) or username";
    },
  });

  return url || undefined;
}

export async function promptJobDescription(
  existing?: string
): Promise<string> {
  if (existing) return existing;

  const method = await select({
    message: theme.coral("How would you like to provide the job description?"),
    choices: [
      { name: "Paste it here", value: "paste" },
      { name: "Open text editor", value: "editor" },
    ],
  });

  if (method === "editor") {
    const text = await editor({
      message: "Write or paste the job description:",
    });
    return text.trim();
  }

  const text = await input({
    message: theme.coral("Paste the job description (single line or URL):"),
    validate: (val) => (val.length > 10 ? true : "Please provide more detail"),
  });

  return text;
}

export async function promptLinkedInMethod(): Promise<LinkedInInputMethod> {
  return select({
    message: theme.coral("How would you like to provide LinkedIn data?"),
    choices: [
      {
        name: "Paste text from LinkedIn profile",
        value: "paste" as const,
      },
      {
        name: "Import JSON Resume file",
        value: "json" as const,
      },
      {
        name: "Enter manually",
        value: "manual" as const,
      },
      {
        name: "Skip LinkedIn data",
        value: "skip" as const,
      },
    ],
  });
}

export async function promptLinkedInManual(): Promise<LinkedInProfile> {
  printInfo("Enter your professional details:");
  printDivider();

  const name = await input({
    message: theme.coral("Full name:"),
    validate: (v) => (v ? true : "Name is required"),
  });

  const headline = await input({
    message: theme.coral("Professional headline:"),
  });

  const summary = await input({
    message: theme.coral("Professional summary:"),
  });

  const location = await input({
    message: theme.coral("Location:"),
  });

  const email = await input({
    message: theme.coral("Email:"),
  });

  const phone = await input({
    message: theme.coral("Phone:"),
  });

  const website = await input({
    message: theme.coral("Website/Portfolio URL:"),
  });

  // Experience
  const experiences = [];
  let addMore = await confirm({
    message: theme.coral("Add work experience?"),
    default: true,
  });

  while (addMore) {
    const title = await input({
      message: theme.coral("  Job title:"),
      validate: (v) => (v ? true : "Required"),
    });
    const company = await input({
      message: theme.coral("  Company:"),
      validate: (v) => (v ? true : "Required"),
    });
    const expLocation = await input({
      message: theme.coral("  Location:"),
    });
    const startDate = await input({
      message: theme.coral("  Start date (e.g., Jan 2022):"),
      validate: (v) => (v ? true : "Required"),
    });
    const endDate = await input({
      message: theme.coral("  End date (leave blank for current):"),
    });
    const description = await input({
      message: theme.coral("  Description (key achievements):"),
    });

    experiences.push({
      title,
      company,
      location: expLocation || undefined,
      startDate,
      endDate: endDate || undefined,
      description: description || undefined,
    });

    addMore = await confirm({
      message: theme.coral("Add another position?"),
      default: false,
    });
  }

  // Education
  const education = [];
  let addEdu = await confirm({
    message: theme.coral("Add education?"),
    default: true,
  });

  while (addEdu) {
    const school = await input({
      message: theme.coral("  School:"),
      validate: (v) => (v ? true : "Required"),
    });
    const degree = await input({
      message: theme.coral("  Degree:"),
    });
    const field = await input({
      message: theme.coral("  Field of study:"),
    });
    const eduStart = await input({
      message: theme.coral("  Start date:"),
    });
    const eduEnd = await input({
      message: theme.coral("  End date:"),
    });

    education.push({
      school,
      degree: degree || undefined,
      field: field || undefined,
      startDate: eduStart || undefined,
      endDate: eduEnd || undefined,
    });

    addEdu = await confirm({
      message: theme.coral("Add another?"),
      default: false,
    });
  }

  // Skills
  const skillsRaw = await input({
    message: theme.coral("Skills (comma-separated):"),
  });
  const skills = skillsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    name,
    headline: headline || undefined,
    summary: summary || undefined,
    location: location || undefined,
    email: email || undefined,
    phone: phone || undefined,
    website: website || undefined,
    experience: experiences,
    education,
    skills,
  };
}

export async function promptLinkedInPaste(): Promise<string> {
  printInfo(
    'Go to your LinkedIn profile, select all text, and paste it below.'
  );
  printInfo(
    "The AI will extract structured data from the raw text."
  );
  printDivider();

  const text = await editor({
    message: "Paste your LinkedIn profile text:",
  });

  return text.trim();
}

export async function promptJsonResumePath(): Promise<string> {
  return input({
    message: theme.coral("Path to JSON Resume file:"),
    validate: (v) => (v ? true : "Path is required"),
  });
}

export async function promptOutputPrefs(
  existing: Partial<AppConfig>
): Promise<{ format: AppConfig["outputFormat"]; fileName: string }> {
  const format =
    (existing.outputFormat as AppConfig["outputFormat"]) ??
    (await select({
      message: theme.coral("Output format:"),
      choices: [
        { name: "PDF (recommended)", value: "pdf" as const },
        { name: "DOCX (Word)", value: "docx" as const },
        { name: "Both PDF & DOCX", value: "both" as const },
      ],
    }));

  const fileName =
    existing.fileName ??
    (await input({
      message: theme.coral("Output file name (without extension):"),
      default: "resume",
    }));

  return { format, fileName };
}

export async function confirmGenerate(): Promise<boolean> {
  return confirm({
    message: theme.coral("Ready to generate your resume?"),
    default: true,
  });
}
