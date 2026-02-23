import type {
  GitHubProfile,
  LinkedInProfile,
  JobDescription,
} from "../types/resume.js";

export const SYSTEM_PROMPT = `You are an expert resume writer and career coach. You create highly effective, ATS-optimized resumes that:
- Use strong action verbs and quantified achievements
- Are tailored to the specific job description
- Highlight transferable skills and relevant experience
- Follow modern resume best practices (concise, impactful, keyword-rich)
- Present information in reverse chronological order
- Keep bullet points to 1-2 lines each, starting with action verbs
- Use industry-standard terminology that ATS systems recognize

You ALWAYS output structured JSON matching the exact schema requested. Never include markdown, explanations, or anything outside the JSON.`;

export function buildAnalyzeJobPrompt(jobText: string): string {
  return `Analyze this job description and extract structured data. Return a JSON object with these fields:
- title: The job title
- company: The company name (if mentioned)
- description: A 2-3 sentence summary of the role
- requirements: An array of key requirements/qualifications
- keywords: An array of important keywords for ATS optimization (technical skills, tools, methodologies)

Job Description:
"""
${jobText}
"""

Return ONLY valid JSON, no markdown fences or explanation.`;
}

export function buildResumePrompt(
  github: GitHubProfile | null,
  linkedin: LinkedInProfile | null,
  linkedinRawText: string | null,
  job: JobDescription
): string {
  let profileContext = "";

  if (github) {
    profileContext += `
## GitHub Profile
- Username: ${github.username}
- Name: ${github.name || "N/A"}
- Bio: ${github.bio || "N/A"}
- Company: ${github.company || "N/A"}
- Location: ${github.location || "N/A"}
- Blog/Website: ${github.blog || "N/A"}
- Public Repos: ${github.publicRepos}
- Top Languages: ${Object.entries(github.languages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([lang, count]) => `${lang} (${count} repos)`)
      .join(", ")}

### Top Repositories:
${github.topRepos
  .slice(0, 6)
  .map(
    (r) =>
      `- **${r.name}** (${r.stars}★): ${r.description || "No description"} [${r.language || "N/A"}] Topics: ${r.topics.join(", ") || "none"}`
  )
  .join("\n")}

${github.readmeContent ? `### Profile README:\n${github.readmeContent.slice(0, 2000)}` : ""}
`;
  }

  if (linkedin) {
    profileContext += `
## LinkedIn/Professional Data
- Name: ${linkedin.name}
- Headline: ${linkedin.headline || "N/A"}
- Summary: ${linkedin.summary || "N/A"}
- Location: ${linkedin.location || "N/A"}
- Email: ${linkedin.email || "N/A"}
- Phone: ${linkedin.phone || "N/A"}
- Website: ${linkedin.website || "N/A"}

### Work Experience:
${linkedin.experience
  .map(
    (e) =>
      `- **${e.title}** at ${e.company} (${e.startDate} - ${e.endDate || "Present"})${e.location ? `, ${e.location}` : ""}\n  ${e.description || ""}`
  )
  .join("\n")}

### Education:
${linkedin.education
  .map(
    (e) =>
      `- ${e.degree || ""} ${e.field ? `in ${e.field}` : ""} at ${e.school} (${e.startDate || ""} - ${e.endDate || ""})`
  )
  .join("\n")}

### Skills: ${linkedin.skills.join(", ")}
${linkedin.certifications ? `### Certifications: ${linkedin.certifications.map((c) => `${c.name} (${c.issuer})`).join(", ")}` : ""}
`;
  }

  if (linkedinRawText) {
    profileContext += `
## LinkedIn Profile (Raw Text - extract relevant info):
"""
${linkedinRawText.slice(0, 4000)}
"""
`;
  }

  return `Generate a tailored, ATS-optimized resume based on the candidate's profile data and the target job description.

## Target Job
- Title: ${job.title}
- Company: ${job.company || "Not specified"}
- Description: ${job.description}
- Key Requirements: ${job.requirements?.join("; ") || "See description"}
- ATS Keywords: ${job.keywords?.join(", ") || "See description"}

${profileContext}

## Instructions
1. Tailor the resume specifically for this job - mirror keywords from the JD
2. Write a compelling professional summary (2-3 sentences) that positions the candidate for this role
3. For experience bullets: use strong action verbs, quantify where possible, focus on impact
4. Select and prioritize skills that match the job requirements
5. Include relevant projects from GitHub if applicable
6. If data is sparse, use what's available - don't fabricate information
7. Organize skills into categories: languages, frameworks, tools, other

Return a JSON object matching this EXACT schema:
{
  "contact": {
    "name": "string",
    "email": "string (optional)",
    "phone": "string (optional)",
    "location": "string (optional)",
    "website": "string (optional)",
    "github": "string (optional)",
    "linkedin": "string (optional)"
  },
  "summary": "string - 2-3 sentence professional summary",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string (optional)",
      "startDate": "string",
      "endDate": "string (optional, omit for current role)",
      "bullets": ["string - achievement-focused bullet points"]
    }
  ],
  "education": [
    {
      "school": "string",
      "degree": "string",
      "field": "string (optional)",
      "startDate": "string (optional)",
      "endDate": "string (optional)",
      "gpa": "string (optional)",
      "highlights": ["string (optional)"]
    }
  ],
  "skills": {
    "languages": ["string"],
    "frameworks": ["string"],
    "tools": ["string"],
    "other": ["string"]
  },
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "url": "string (optional)",
      "bullets": ["string (optional)"]
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string (optional)"
    }
  ]
}

Return ONLY valid JSON. No markdown fences, no explanation text.`;
}
