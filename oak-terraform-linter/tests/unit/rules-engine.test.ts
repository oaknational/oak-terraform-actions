import { RulesEngine } from "../../src/rules/engine";
import { TerraformFileContext } from "../../src/core/types";
import {
  HelperPassingRule,
  HelperFailingRule,
  HelperErrorRule,
} from "../../src/rules/rule-helpers";

describe("RulesEngine", () => {
  test("registers custom rule", () => {
    const engine = new RulesEngine();
    const rule = new HelperPassingRule();
    engine.registerRule(rule);
    expect(engine.getRules()).toHaveLength(1);
  });

  test("passes with a passing rule", () => {
    const engine = new RulesEngine();
    const rule = new HelperPassingRule();
    engine.registerRule(rule);

    const context: TerraformFileContext = {
      hcl: {},
      filePath: "test.tf",
      fileContent: "",
    };

    const violations = engine.executeRules(context, {});
    expect(violations).toHaveLength(0);
  });

  test("fails with a failing rule", () => {
    const engine = new RulesEngine();
    engine.registerRule(new HelperFailingRule());

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

  test("throws with a throwing rule", () => {
    const engine = new RulesEngine();
    engine.registerRule(new HelperErrorRule());

    const context: TerraformFileContext = {
      hcl: {},
      filePath: "test.tf",
      fileContent: "",
    };

    expect(() => {
      engine.executeRules(context, {});
    }).toThrow("This rule always errors (for development purposes only)");
  });
});
