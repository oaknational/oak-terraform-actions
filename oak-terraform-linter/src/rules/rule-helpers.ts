import {
  Rule,
  TerraformFileContext,
  ExecutionContext,
  LintViolation,
} from "../core/types";

export class HelperPassingRule implements Rule {
  id = "oak-helper-pass-001";
  name = "Helper Passing Rule (Dev Only)";
  description = "This rule always passes (for development purposes only)";
  severity = "error" as const;
  params: Record<string, unknown> = {};

  validate(
    _context: TerraformFileContext,
    _executionContext: ExecutionContext,
    _params?: Record<string, unknown>,
  ): LintViolation[] {
    return [];
  }
}

export class HelperFailingRule implements Rule {
  id = "oak-helper-fail-001";
  name = "Helper Failing Rule (Dev Only)";
  description = "This rule always fails (for development purposes only)";
  severity = "error" as const;
  params: Record<string, unknown> = {};

  validate(
    _context: TerraformFileContext,
    _executionContext: ExecutionContext,
    _params?: Record<string, unknown>,
  ): LintViolation[] {
    return [
      {
        ruleName: this.name,
        ruleId: this.id,
        severity: this.severity,
        filePath: _context.filePath,
        message: "This rule always fails (for development purposes only)",
        suggestion: "Remove this rule from your configuration",
      },
    ];
  }
}

export class HelperErrorRule implements Rule {
  id = "oak-helper-error-001";
  name = "Helper Error Rule (Dev Only)";
  description = "This rule always errors (for development purposes only)";
  severity = "error" as const;
  params: Record<string, unknown> = {};

  validate(
    _context: TerraformFileContext,
    _executionContext: ExecutionContext,
    _params?: Record<string, unknown>,
  ): LintViolation[] {
    throw new Error("This rule always errors (for development purposes only)");
  }
}
