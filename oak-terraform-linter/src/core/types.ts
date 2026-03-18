export interface TerraformFileContext {
  /**
   * The parsed HCL content as a JavaScript object.
   * See parser.ts for details on the structure.
   */
  hcl: Record<string, unknown>;
  filePath: string;
  fileContent: string;
}

export interface LintViolation {
  ruleId: string;
  ruleName: string;
  severity: "error" | "warning" | "info";
  message: string;
  filePath: string;
  suggestion?: string;
}

export interface LintResult {
  violations: LintViolation[];
  fileCount: number;
  duration: number;
  passed: boolean;
}

export interface RuleConfig {
  ruleType: string;
  enabled?: boolean;
  description?: string;
  params?: Record<string, unknown>;
}

export interface ExecutionContext {
  isPrivateRepo?: boolean;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  severity: "error" | "warning" | "info";
  params?: Record<string, unknown>;
  validate(
    context: TerraformFileContext,
    executionContext: ExecutionContext,
    params?: Record<string, unknown>
  ): LintViolation[];
}
