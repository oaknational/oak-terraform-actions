import { LintViolation } from "../core/types";
import chalk from "chalk";

export class HumanReporter {
  report(violations: LintViolation[], _options: { strict: boolean; fileCount: number }): void {
    if (violations.length === 0) {
      console.log(chalk.green("✓ No violations found!"));
      return;
    }

    const byFile = this.groupByFile(violations);

    for (const [file, fileViolations] of Object.entries(byFile)) {
      console.log(chalk.underline(file));

      for (const violation of fileViolations) {
        const icon = this.getIcon(violation.severity);
        const colorFn = this.getColorFn(violation.severity);

        console.log(`  ${icon}  ${colorFn(violation.message)} (${violation.ruleId})`);

        if (violation.suggestion) {
          console.log(chalk.gray(`     💡 ${violation.suggestion}`));
        }
      }
      console.log();
    }

    const errors = violations.filter((v) => v.severity === "error").length;
    const warnings = violations.filter((v) => v.severity === "warning").length;

    console.log(
      `Found ${chalk.red(`${errors} error`)}${errors !== 1 ? "s" : ""}, ${chalk.yellow(
        `${warnings} warning`
      )}${warnings !== 1 ? "s" : ""}`
    );
  }

  private groupByFile(violations: LintViolation[]): Record<string, LintViolation[]> {
    const result: Record<string, LintViolation[]> = {};
    for (const violation of violations) {
      const file = violation.filePath;
      if (!result[file]) {
        result[file] = [];
      }
      result[file].push(violation);
    }
    return result;
  }

  private getIcon(severity: string): string {
    switch (severity) {
      case "error":
        return "✘";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  }

  private getColorFn(severity: string): (text: string) => string {
    switch (severity) {
      case "error":
        return chalk.red;
      case "warning":
        return chalk.yellow;
      case "info":
        return chalk.cyan;
      default:
        return chalk.white;
    }
  }
}
