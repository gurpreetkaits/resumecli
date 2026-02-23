# resumecli

AI-powered resume builder CLI that generates professional, ATS-optimized PDF and DOCX resumes using Claude.

Provide your GitHub profile, LinkedIn data, and a target job description — Claude analyzes everything and generates a tailored resume with clean typography.

## Features

- **GitHub Integration** — Fetches your profile, repos, languages, and README via the GitHub API
- **LinkedIn Support** — Manual input, JSON Resume import, or paste raw text (AI-parsed)
- **AI-Powered** — Claude Sonnet analyzes the job description and generates tailored content
- **PDF Output** — Clean HTML-to-PDF via Puppeteer with Inter font and coral accent theme
- **DOCX Output** — Word-compatible document matching the PDF layout
- **ATS-Optimized** — Single-column layout, parseable text, keyword-rich content
- **Interactive CLI** — Guided prompts with spinners and styled output

## Quick Start

```bash
# Clone and install
git clone https://github.com/gurpreetkaits/resumecli.git
cd resumecli
npm install

# Set up authentication (choose one method)
# Method 1: Use API key in .env file
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Method 2: Use Claude setup/login (if you have Claude CLI/Code installed)
# Just run the tool - it will use your existing Claude authentication

# Run
npx tsx bin/resumeforge.ts
```

## Usage

### Interactive Mode

```bash
npx tsx bin/resumeforge.ts
```

The CLI walks you through:
1. GitHub profile URL (optional)
2. LinkedIn/professional data (paste, manual, JSON import, or skip)
3. Target job description
4. Output format (PDF, DOCX, or both)

### With Flags

```bash
npx tsx bin/resumeforge.ts \
  --github torvalds \
  --format both \
  --name my-resume \
  --output ./output
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `-g, --github <url>` | GitHub profile URL or username | — |
| `-j, --job <text>` | Job description text | — |
| `-o, --output <dir>` | Output directory | `./output` |
| `-f, --format <fmt>` | `pdf`, `docx`, or `both` | `pdf` |
| `-n, --name <name>` | Output filename (no extension) | `resume` |

## Authentication

The CLI supports multiple authentication methods (checked in order):

**Option 1: .env file (recommended)**
```bash
cp .env.example .env
# Edit .env and add your Anthropic API key
ANTHROPIC_API_KEY=sk-ant-...
```

**Option 2: Environment Variable**
```bash
export ANTHROPIC_API_KEY=sk-ant-...
# or
export CLAUDE_API_KEY=sk-ant-...
```

**Option 3: Claude Config File**
Create `~/.claude/config.json`:
```json
{
  "apiKey": "sk-ant-..."
}
```

The tool will automatically use the first available authentication method.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | No* | Your Anthropic API key (*required if not using Claude auth) |
| `GITHUB_TOKEN` | No | GitHub PAT (increases rate limits) |

## Design

The generated resume uses a Claude-inspired typography theme:

- **Font**: Inter (400, 500, 600, 700)
- **Accent**: `#D97757` (coral) for section headings
- **Text**: `#141413` body, `#5A5A58` secondary
- **Borders**: `#E8E6DC` dividers
- **Layout**: Single-column, ATS-friendly

## Tech Stack

- **Runtime**: Node.js + TypeScript (ESM)
- **CLI**: Commander, @inquirer/prompts, chalk, ora
- **AI**: @anthropic-ai/sdk (Claude Sonnet 4.5)
- **GitHub**: @octokit/rest
- **PDF**: Puppeteer (HTML-to-PDF)
- **DOCX**: docx npm package
- **Validation**: Zod
- **Build**: tsx

## License

MIT
