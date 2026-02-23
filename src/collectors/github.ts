import { Octokit } from "@octokit/rest";
import type { GitHubProfile, GitHubRepo } from "../types/resume.js";

function extractUsername(input: string): string {
  const cleaned = input.replace(/\/$/, "");
  const match = cleaned.match(/github\.com\/([\w-]+)/);
  if (match) return match[1];
  // Assume it's a bare username
  return cleaned.replace(/^@/, "");
}

export async function fetchGitHubProfile(
  urlOrUsername: string
): Promise<GitHubProfile> {
  const username = extractUsername(urlOrUsername);

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined,
  });

  // Fetch user profile and repos in parallel
  const [userResponse, reposResponse] = await Promise.all([
    octokit.users.getByUsername({ username }),
    octokit.repos.listForUser({
      username,
      sort: "updated",
      per_page: 100,
      type: "owner",
    }),
  ]);

  const user = userResponse.data;
  const repos = reposResponse.data;

  // Calculate language stats
  const languages: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  }

  // Sort repos by stars, then by recent activity
  const sortedRepos = repos
    .filter((r) => !r.fork)
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 10);

  const topRepos: GitHubRepo[] = sortedRepos.map((r) => ({
    name: r.name,
    description: r.description,
    language: r.language ?? null,
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    url: r.html_url,
    topics: r.topics || [],
  }));

  // Try to fetch profile README
  let readmeContent: string | null = null;
  try {
    const readmeResp = await octokit.repos.getReadme({
      owner: username,
      repo: username,
    });
    readmeContent = Buffer.from(
      readmeResp.data.content,
      "base64"
    ).toString("utf-8");
  } catch {
    // No profile README
  }

  return {
    username,
    name: user.name,
    bio: user.bio,
    company: user.company,
    location: user.location,
    blog: user.blog || null,
    email: user.email,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    publicRepos: user.public_repos,
    followers: user.followers,
    topRepos,
    languages,
    readmeContent,
  };
}
