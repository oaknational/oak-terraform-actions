import * as path from "path";
import { TerraformParser } from "../../src/core/parser";
import { RulesEngine } from "../../src/rules/engine";
import { ExecutionContext } from "../../src/core/types";
import { ResourceNamingRule } from "../../src/rules/rule-resource-naming";

describe("End-to-End Linting", () => {
  const parser = new TerraformParser();

  test("detects naming violations in fixture directory", async () => {
    const fixtureDir = path.join(__dirname, "../integration/fixtures/naming-violations");
    const contexts = await parser.parseDirectory(fixtureDir);

    const engine = new RulesEngine();
    engine.registerRule(new ResourceNamingRule());

    const executionContext: ExecutionContext = { isPrivateRepo: false };
    const allViolations = contexts.flatMap((ctx) => engine.executeRules(ctx, executionContext));

    expect(allViolations.length).toBeGreaterThan(0);
    expect(allViolations[0].ruleId).toBe("oak-resource-naming-001");
  });

  test("passes clean Terraform files", async () => {
    const fixtureDir = path.join(__dirname, "../integration/fixtures/valid-terraform");
    const contexts = await parser.parseDirectory(fixtureDir);

    const engine = new RulesEngine();
    engine.registerRule(new ResourceNamingRule());

    const executionContext: ExecutionContext = { isPrivateRepo: false };
    const allViolations = contexts.flatMap((ctx) => engine.executeRules(ctx, executionContext));

    expect(allViolations).toHaveLength(0);
  });

  test("processes multiple files", async () => {
    const fixtureDir = path.join(__dirname, "../integration/fixtures/valid-terraform");
    const contexts = await parser.parseDirectory(fixtureDir);

    expect(contexts.length).toBeGreaterThan(1);
  });

  test("loads and applies rules from strict config", async () => {
    const fixtureDir = path.join(__dirname, "../integration/fixtures/naming-violations");
    const configPath = path.join(__dirname, "../integration/configs/naming-strict.json");
    const contexts = await parser.parseDirectory(fixtureDir);

    const engine = new RulesEngine();
    await engine.loadRules(configPath);

    const executionContext: ExecutionContext = { isPrivateRepo: false };
    const allViolations = contexts.flatMap((ctx) => engine.executeRules(ctx, executionContext));

    expect(allViolations.length).toBeGreaterThan(0);
    expect(allViolations[0].ruleId).toBe("oak-resource-naming-001");
  });

  test("loads and respects disabled rules from config", async () => {
    const fixtureDir = path.join(__dirname, "../integration/fixtures/naming-violations");
    const configPath = path.join(__dirname, "../integration/configs/naming-relaxed.json");
    const contexts = await parser.parseDirectory(fixtureDir);

    const engine = new RulesEngine();
    await engine.loadRules(configPath);

    const executionContext: ExecutionContext = { isPrivateRepo: false };
    const allViolations = contexts.flatMap((ctx) => engine.executeRules(ctx, executionContext));

    // No violations because the naming rule is disabled in the config
    expect(allViolations).toHaveLength(0);
  });
});
