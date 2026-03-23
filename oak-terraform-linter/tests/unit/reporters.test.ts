import { HumanReporter } from "../../src/reporters/human";
import { LintViolation } from "../../src/core/types";

describe("HumanReporter", () => {
  let consoleSpy: jest.SpyInstance;
  const reporter = new HumanReporter();

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("reports no violations message", () => {
    reporter.report([], { strict: false, fileCount: 1 });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("No violations"));
  });

  test("groups violations by file", () => {
    const violations: LintViolation[] = [
      {
        ruleId: "rule-1",
        ruleName: "Rule 1",
        severity: "error",
        message: "Error 1",
        filePath: "file1.tf",
      },
      {
        ruleId: "rule-2",
        ruleName: "Rule 2",
        severity: "warning",
        message: "Warning 1",
        filePath: "file2.tf",
      },
    ];

    reporter.report(violations, { strict: false, fileCount: 2 });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("file1.tf"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("file2.tf"));
  });

  test("summarizes violations", () => {
    const violations: LintViolation[] = [
      {
        ruleId: "rule-1",
        ruleName: "Rule 1",
        severity: "error",
        message: "Error",
        filePath: "test.tf",
      },
      {
        ruleId: "rule-2",
        ruleName: "Rule 2",
        severity: "warning",
        message: "Warning",
        filePath: "test.tf",
      },
    ];

    reporter.report(violations, { strict: false, fileCount: 1 });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("1 error"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("1 warning"));
  });

  test("includes suggestions when available", () => {
    const violations: LintViolation[] = [
      {
        ruleId: "rule-1",
        ruleName: "Rule 1",
        severity: "error",
        message: "Error",
        filePath: "test.tf",
        suggestion: "Use this instead",
      },
    ];

    reporter.report(violations, { strict: false, fileCount: 1 });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Use this instead"));
  });

  test("handles info severity violations", () => {
    const violations: LintViolation[] = [
      {
        ruleId: "rule-1",
        ruleName: "Rule 1",
        severity: "info",
        message: "Info message",
        filePath: "test.tf",
      },
    ];

    reporter.report(violations, { strict: false, fileCount: 1 });
    // Should print the info violation with ℹ icon
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Info message"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("ℹ"));
  });

  test("handles unknown severity gracefully", () => {
    const violations: LintViolation[] = [
      {
        ruleId: "rule-1",
        ruleName: "Rule 1",
        severity: "unknown" as "error",
        message: "Unknown severity",
        filePath: "test.tf",
      },
    ];

    // Should not throw and should output something
    expect(() => {
      reporter.report(violations, { strict: false, fileCount: 1 });
    }).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
  });
});
