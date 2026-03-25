import { Rule, TerraformFileContext, ExecutionContext, LintViolation } from "../core/types";

export class ResourceNamingRule implements Rule {
  id = "oak-resource-naming-001";
  name = "Resource Naming Convention";
  description = "Enforce naming for all resources";
  severity = "error" as const;
  params: Record<string, unknown> = {};

  validate(
    context: TerraformFileContext,
    _executionContext: ExecutionContext,
    params?: Record<string, unknown>
  ): LintViolation[] {
    const violations: LintViolation[] = [];
    const snakeCasePattern = /^[a-z0-9_]+$/;
    const patternParam = params?.pattern || snakeCasePattern;
    const pattern =
      typeof patternParam === "string" ? new RegExp(patternParam) : (patternParam as RegExp);
    const isSnakeCase = snakeCasePattern === pattern;

    const resources = context.hcl.resource;
    if (!resources || typeof resources !== "object") {
      return violations;
    }

    for (const [, resourceInstances] of Object.entries(resources)) {
      if (!resourceInstances || typeof resourceInstances !== "object") {
        continue;
      }

      for (const [resourceName, resourceConfig] of Object.entries(resourceInstances)) {
        if (!resourceName || !resourceConfig || typeof resourceConfig !== "object") {
          continue;
        }

        if (!pattern.test(resourceName)) {
          violations.push({
            ruleId: this.id,
            ruleName: this.name,
            severity: this.severity,
            filePath: context.filePath,
            message: isSnakeCase
              ? `Resource name '${resourceName}' does not match naming convention 'snake_case'.`
              : `Resource name '${resourceName}' does not match naming convention '${pattern}'.`,
            suggestion: isSnakeCase
              ? `Rename to match pattern: ${resourceName.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`
              : undefined,
          });
        }
      }
    }

    return violations;
  }
}
