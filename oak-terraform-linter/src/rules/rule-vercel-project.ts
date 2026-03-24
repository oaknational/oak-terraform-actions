import { Rule, TerraformFileContext, ExecutionContext, LintViolation } from "../core/types";
import path from "path";

export class VercelProjectRule implements Rule {
  id = "oak-vercel-project-001";
  name = "Vercel Project Module Location";
  description = "If the Oak 'vercel_project' module is used, the configuration should be under the path 'infrastructure/project'.";
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
      const usesVercelProjectModule = source && source.startsWith("github.com/oaknational/oak-terraform-modules//modules/vercel_project");
      if (!usesVercelProjectModule) {
        continue;
      }

      const absolutePath = path.resolve(__dirname, context.filePath);
      if (/infrastructure\/project\/.+\..+$/.test(absolutePath)) {
        console.log(`File ${context.filePath} correctly uses the 'vercel_project' module in the expected path.`);
      }
    }


    return violations;
  }
}
