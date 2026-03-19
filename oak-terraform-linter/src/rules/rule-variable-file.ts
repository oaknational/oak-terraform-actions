import { Rule, TerraformFileContext, ExecutionContext, LintViolation } from "../core/types";
import path from "path";

export class VariableFileRule implements Rule {
  id = "oak-variable-file-001";
  name = "Variable File Usage";
  description = "Enforce usage of variables.tf for all variable definitions";
  severity = "error" as const;
  params: Record<string, unknown> = {};

  validate(
    context: TerraformFileContext,
    _executionContext: ExecutionContext,
    _params?: Record<string, unknown>
  ): LintViolation[] {
    const violations: LintViolation[] = [];
    const fileName = path.basename(context.filePath);
    if (fileName === "variables.tf") {
      return violations;
    }

    const variables = context.hcl.variable;
    if (variables && Object.keys(variables).length > 0) {
      const variableNames = Object.keys(variables).join(", ");

      violations.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        message: `All variable definitions should be in variables.tf. Found variables: ${variableNames}`,
        filePath: context.filePath,
        suggestion: "Move variable definitions to variables.tf",
      });
    }

    return violations;
  }
}
