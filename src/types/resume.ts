import { z } from "zod";

// ─── Zod Schemas ───────────────────────────────────────────────

export const GitHubRepoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  stars: z.number(),
  forks: z.number(),
  url: z.string().url(),
  topics: z.array(z.string()),
});

export const GitHubProfileSchema = z.object({
  username: z.string(),
  name: z.string().nullable(),
  bio: z.string().nullable(),
  company: z.string().nullable(),
  location: z.string().nullable(),
  blog: z.string().nullable(),
  email: z.string().nullable(),
  avatarUrl: z.string().url(),
  profileUrl: z.string().url(),
  publicRepos: z.number(),
  followers: z.number(),
  topRepos: z.array(GitHubRepoSchema),
  languages: z.record(z.string(), z.number()),
  readmeContent: z.string().nullable(),
});

export const LinkedInExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

export const LinkedInEducationSchema = z.object({
  school: z.string(),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

export const LinkedInCertificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string().optional(),
});

export const LinkedInProfileSchema = z.object({
  name: z.string(),
  headline: z.string().optional(),
  summary: z.string().optional(),
  location: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  experience: z.array(LinkedInExperienceSchema),
  education: z.array(LinkedInEducationSchema),
  skills: z.array(z.string()),
  certifications: z.array(LinkedInCertificationSchema).optional(),
});

export const JobDescriptionSchema = z.object({
  title: z.string(),
  company: z.string().optional(),
  description: z.string(),
  requirements: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
});

// ─── Resume Output Schemas ─────────────────────────────────────

export const ResumeContactSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
});

export const ResumeExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  bullets: z.array(z.string()),
});

export const ResumeEducationSchema = z.object({
  school: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const ResumeProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  url: z.string().optional(),
  bullets: z.array(z.string()).optional(),
});

export const ResumeCertificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string().optional(),
});

export const ResumeDataSchema = z.object({
  contact: ResumeContactSchema,
  summary: z.string(),
  experience: z.array(ResumeExperienceSchema),
  education: z.array(ResumeEducationSchema),
  skills: z.object({
    languages: z.array(z.string()).optional(),
    frameworks: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    other: z.array(z.string()).optional(),
  }),
  projects: z.array(ResumeProjectSchema).optional(),
  certifications: z.array(ResumeCertificationSchema).optional(),
});

// ─── TypeScript Types ──────────────────────────────────────────

export type GitHubRepo = z.infer<typeof GitHubRepoSchema>;
export type GitHubProfile = z.infer<typeof GitHubProfileSchema>;
export type LinkedInExperience = z.infer<typeof LinkedInExperienceSchema>;
export type LinkedInEducation = z.infer<typeof LinkedInEducationSchema>;
export type LinkedInCertification = z.infer<typeof LinkedInCertificationSchema>;
export type LinkedInProfile = z.infer<typeof LinkedInProfileSchema>;
export type JobDescription = z.infer<typeof JobDescriptionSchema>;
export type ResumeContact = z.infer<typeof ResumeContactSchema>;
export type ResumeExperience = z.infer<typeof ResumeExperienceSchema>;
export type ResumeEducation = z.infer<typeof ResumeEducationSchema>;
export type ResumeProject = z.infer<typeof ResumeProjectSchema>;
export type ResumeCertification = z.infer<typeof ResumeCertificationSchema>;
export type ResumeData = z.infer<typeof ResumeDataSchema>;

// ─── Config Types ──────────────────────────────────────────────

export interface AppConfig {
  githubUrl?: string;
  jobDescription?: string;
  outputDir: string;
  outputFormat: "pdf" | "docx" | "both";
  fileName: string;
}

export type LinkedInInputMethod = "json" | "manual" | "paste" | "skip";
