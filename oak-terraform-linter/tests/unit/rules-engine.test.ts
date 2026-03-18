import { RulesEngine } from "../../src/rules/engine";
import { Rule, TerraformFileContext, LintViolation } from "../../src/core/types";

class TestRule implements Rule {
  id = "test-001";
  name = "Test Rule";
  description = "A test rule";
  severity = "error" as const;

  validate(): LintViolation[] {
    return [
      {
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        message: "Test violation",
        filePath: "test.tf",
      },
    ];
  }
}

describe("RulesEngine", () => {
  test("registers custom rule", () => {
    const engine = new RulesEngine();
    const rule = new TestRule();
    engine.registerRule(rule);
    expect(engine.getRules()).toHaveLength(1);
  });

  test("executes rules against context", () => {
    const engine = new RulesEngine();
    engine.registerRule(new TestRule());

    const context: TerraformFileContext = {
      hcl: {},
      filePath: "test.tf",
      fileContent: "",
    };

    const violations = engine.executeRules(context, {});
    expect(violations).toHaveLength(1);
  });

  test("passes with no rules", () => {
    const engine = new RulesEngine();

    const context: TerraformFileContext = {
      hcl: {},
      filePath: "test.tf",
      fileContent: "",
    };

    const violations = engine.executeRules(context, {});
    expect(violations).toHaveLength(0);
  });

  test("loads default rules", () => {
    const engine = new RulesEngine();
    engine.loadDefaultRules();
    expect(engine.getRules().length).toBeGreaterThan(0);
  });
});
