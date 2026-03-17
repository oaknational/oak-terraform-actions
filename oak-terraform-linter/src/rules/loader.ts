import * as fs from "fs";
import { Rule, RuleConfig } from "../core/types";
import { NamingConventionRule } from "./rule-naming-example";

const AVAILABLE_RULES: Record<string, new () => Rule> = {
  "naming-convention": NamingConventionRule,
};

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
    const ruleConfigs: RuleConfig[] = Object.keys(AVAILABLE_RULES).map((ruleType) => ({
      ruleType,
      enabled: true,
    }));
    return this.instantiateRules(ruleConfigs);
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

        if (config.description) {
            rule.description = config.description;
        }

        if (config.params) {
          rule.params = { ...rule.params, ...config.params };
        }

        rules.push(rule);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Failed to instantiate rule: ${message}`);
      }
    }

    return rules;
  }
}
