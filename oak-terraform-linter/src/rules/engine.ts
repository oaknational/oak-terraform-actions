import { TerraformFileContext, ExecutionContext, LintViolation, Rule } from "../core/types";
import { RuleLoader } from "./loader";

export class RulesEngine {
  private rules: Rule[] = [];
  private loader: RuleLoader;

  constructor() {
    this.loader = new RuleLoader();
  }

  async loadRules(filePath: string): Promise<void> {
    this.rules = await this.loader.loadRulesFromFile(filePath);
  }

  loadDefaultRules(): void {
    this.rules = this.loader.loadDefaultRules();
  }

  executeRules(context: TerraformFileContext, executionContext: ExecutionContext): LintViolation[] {
    const violations: LintViolation[] = [];

    for (const rule of this.rules) {
      try {
        const ruleViolations = rule.validate(context, executionContext, rule.params);
        violations.push(...ruleViolations);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error executing rule ${rule.id}: ${message}`);
      }
    }

    return violations;
  }

  registerRule(rule: Rule): void {
    this.rules.push(rule);
  }

  getRules(): Rule[] {
    return this.rules;
  }
}
