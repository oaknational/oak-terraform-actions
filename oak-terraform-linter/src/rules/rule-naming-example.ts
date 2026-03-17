import {
  Rule,
  TerraformFileContext,
  ExecutionContext,
  LintViolation,
} from "../core/types";

export class NamingConventionRule implements Rule {
  id = "oak-naming-001";
  name = "Resource Naming Convention";
  description = "Enforce snake_case naming for all resources";
  severity = "error" as const;
  params: Record<string, unknown> = {};

  validate(
    context: TerraformFileContext,
    _executionContext: ExecutionContext,
    params?: Record<string, unknown>
  ): LintViolation[] {
    const violations: LintViolation[] = [];
    const patternParam = params?.pattern || /^[a-z0-9_]+$/;
    const pattern =
      typeof patternParam === "string" ? new RegExp(patternParam) : (patternParam as RegExp);

    const resources = context.json.resource;
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
            message: `Resource name '${resourceName}' does not match naming convention. Use snake_case (lowercase letters, numbers, underscores).`,
            filePath: context.filePath,
            suggestion: `Rename to match pattern: ${resourceName
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, "_")}`,
          });
        }
      }
    }

    return violations;
  }
}
