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
    const variables = context.hcl.variable;
    if (fileName === "variables.tf") {
      const blockTypes = Object.keys(context.hcl);
      const nonVariableBlocks = blockTypes.filter((blockType) => blockType !== "variable");
      if (nonVariableBlocks.length > 0) {
        const nonVariableBlocksStr = nonVariableBlocks.join(", ");
        violations.push({
          ruleId: this.id,
          ruleName: this.name,
          severity: this.severity,
          filePath: context.filePath,
          message: `variables.tf should only contain variable definitions. Found non-variable block type(s): ${nonVariableBlocksStr}`,
          suggestion: `Move non-variable definition(s) out of variables.tf`,
        });
      }
    } else if (variables && Object.keys(variables).length > 0) {
      const variableNamesStr = Object.keys(variables).join(", ");
      violations.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        filePath: context.filePath,
        message: `All variable definitions should be in variables.tf. Found variable(s): ${variableNamesStr}`,
        suggestion: `Move variable definition(s) to variables.tf`,
      });
    }

    return violations;
  }
}
