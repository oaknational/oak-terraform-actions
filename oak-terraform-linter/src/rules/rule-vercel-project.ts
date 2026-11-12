import { Rule, TerraformFileContext, ExecutionContext, LintViolation } from "../core/types";

const PROJECT_DIRECTORY = /^project(-[a-z0-9]+)*$/;

function isInProjectDirectory(filePath: string): boolean {
  const segments = filePath.split(/[\\/]/);
  return (
    segments.length >= 3 &&
    segments[segments.length - 3] === "infrastructure" &&
    PROJECT_DIRECTORY.test(segments[segments.length - 2])
  );
}

export class VercelProjectRule implements Rule {
  id = "oak-vercel-project-001";
  name = "Vercel Project Module Location";
  description =
    "If the Oak 'vercel_project' module is used, the configuration should be under the path 'infrastructure/project' or 'infrastructure/project-<name>'.";
  severity = "error" as const;
  params: Record<string, unknown> = {};

  validate(
    context: TerraformFileContext,
    _executionContext: ExecutionContext,
    _params?: Record<string, unknown>
  ): LintViolation[] {
    const violations: LintViolation[] = [];
    const modules = context.hcl.module;
    if (!modules || typeof modules !== "object") {
      return violations;
    }

    for (const [, moduleConfig] of Object.entries(modules)) {
      if (!moduleConfig || !Array.isArray(moduleConfig) || typeof moduleConfig[0] !== "object") {
        continue;
      }

      const source = moduleConfig[0].source as string | undefined;
      const usesVercelProjectModule =
        source &&
        source.startsWith("github.com/oaknational/oak-terraform-modules//modules/vercel_project");
      if (!usesVercelProjectModule) {
        continue;
      }

      if (!isInProjectDirectory(context.filePath)) {
        violations.push({
          ruleId: this.id,
          ruleName: this.name,
          severity: this.severity,
          filePath: context.filePath,
          message: `The 'vercel_project' module should be used in files located under 'infrastructure/project/' or 'infrastructure/project-<name>/'`,
          suggestion: `Configure the 'vercel_project' module in a file at the root of 'infrastructure/project/', or of 'infrastructure/project-<name>/' when a repo has more than one Vercel project`,
        });
      }
    }

    return violations;
  }
}
