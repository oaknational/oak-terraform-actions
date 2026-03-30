import * as fs from "fs";
import { Rule, RuleConfig } from "../core/types";
import { ResourceNamingRule } from "./rule-resource-naming";
import { HelperPassingRule, HelperFailingRule, HelperErrorRule } from "./rule-helpers";
import { VariableFileRule } from "./rule-variable-file";
import { VercelProjectRule } from "./rule-vercel-project";

const AVAILABLE_RULES: Record<string, new () => Rule> = {
  "helper-always-passes": HelperPassingRule,
  "helper-always-fails": HelperFailingRule,
  "helper-always-errors": HelperErrorRule,
  "resource-naming": ResourceNamingRule,
  "variable-file": VariableFileRule,
  "vercel-project": VercelProjectRule,
};

const DEFAULT_RULES: RuleConfig[] = [{ ruleType: "variable-file" }, { ruleType: "vercel-project" }];

export class RuleLoader {
  async loadRulesFromFile(filePath: string): Promise<Rule[]> {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const config = JSON.parse(content) as { rules: RuleConfig[] };
      return this.instantiateRules(config.rules);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load rules from ${filePath}: ${message}`);
    }
  }

  loadDefaultRules(): Rule[] {
    return this.instantiateRules(DEFAULT_RULES);
  }

  private instantiateRules(configs: RuleConfig[]): Rule[] {
    const rules: Rule[] = [];

    for (const config of configs) {
      if (config.enabled === false) {
        continue;
      }

      try {
        const ruleClass = AVAILABLE_RULES[config.ruleType];
        if (!ruleClass) {
          throw new Error(
            `Rule type '${config.ruleType}' not found. Available types: ${Object.keys(
              AVAILABLE_RULES
            ).join(", ")}`
          );
        }

        const rule = new ruleClass();

        if (config.params) {
          rule.params = { ...rule.params, ...config.params };
        }

        rules.push(rule);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to instantiate rule '${config.ruleType}': ${message}`);
      }
    }

    return rules;
  }
}
