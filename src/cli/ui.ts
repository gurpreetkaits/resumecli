import chalk from "chalk";
import ora, { type Ora } from "ora";

// Claude-inspired colors
export const theme = {
  coral: chalk.hex("#D97757"),
  text: chalk.hex("#141413"),
  secondary: chalk.hex("#5A5A58"),
  success: chalk.hex("#4CAF50"),
  error: chalk.hex("#E53935"),
  dim: chalk.dim,
};

export function printBanner(): void {
  console.log();
  console.log(
    theme.coral.bold("  ╔═══════════════════════════════════════╗")
  );
  console.log(
    theme.coral.bold("  ║") +
      chalk.white.bold("       resume-cli   ") +
      theme.secondary("v1.0.0") +
      theme.coral.bold("        ║")
  );
  console.log(
    theme.coral.bold("  ║") +
      theme.secondary("   AI-Powered Resume Builder CLI   ") +
      theme.coral.bold("║")
  );
  console.log(
    theme.coral.bold("  ╚═══════════════════════════════════════╝")
  );
  console.log();
}

export function printStep(step: number, total: number, message: string): void {
  console.log(
    theme.coral(`  [${step}/${total}]`) + chalk.white(` ${message}`)
  );
}

export function printSuccess(message: string): void {
  console.log(theme.success(`  ✓ ${message}`));
}

export function printError(message: string): void {
  console.log(theme.error(`  ✗ ${message}`));
}

export function printInfo(message: string): void {
  console.log(theme.secondary(`  ℹ ${message}`));
}

export function createSpinner(text: string): Ora {
  return ora({
    text,
    color: "yellow",
    prefixText: "  ",
  });
}

export function printDivider(): void {
  console.log(theme.dim("  " + "─".repeat(43)));
}
