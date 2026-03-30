import * as path from "path";
import { TerraformParser } from "../../src/core/parser";
import { RulesEngine } from "../../src/rules/engine";
import { ExecutionContext } from "../../src/core/types";

describe("End-to-End Linting", () => {
  const parser = new TerraformParser();

  test("parser processes multiple files", async () => {
    const fixtureDir = path.join(__dirname, "./fixtures/valid-terraform");
    const contexts = await parser.parseDirectory(fixtureDir);

    expect(contexts.length).toBeGreaterThan(1);
    expect(contexts.some((ctx) => ctx.filePath.endsWith("good-naming.tf"))).toBe(true);
  });

  test("loads rules from config and detects violations in invalid Terraform files", async () => {
    const fixtureDir = path.join(__dirname, "./fixtures/invalid-terraform");
    const contexts = await parser.parseDirectory(fixtureDir);
    expect(contexts.length).toBeGreaterThan(0);
    expect(contexts.some((ctx) => ctx.filePath.endsWith("bad-naming.tf"))).toBe(true);

    const engine = new RulesEngine();
    await engine.loadRules(path.join(__dirname, "./configs/all.json"));

    const executionContext: ExecutionContext = { isPrivateRepo: false };
    const allViolations = contexts.flatMap((ctx) => engine.executeRules(ctx, executionContext));

    expect(allViolations.length).toBeGreaterThan(0);
    expect(allViolations.some((v) => v.ruleId === "oak-resource-naming-001")).toBe(true);
    expect(allViolations.some((v) => v.ruleId === "oak-variable-file-001")).toBe(true);
    expect(allViolations.some((v) => v.ruleId === "oak-vercel-project-001")).toBe(true);
    expect(allViolations.some((v) => v.ruleId === "oak-terraform-block-001")).toBe(true);
  });

  test("loads rules from config and passes clean Terraform files", async () => {
    const fixtureDir = path.join(__dirname, "./fixtures/valid-terraform");
    const contexts = await parser.parseDirectory(fixtureDir);
    expect(contexts.length).toBeGreaterThan(0);
    expect(contexts.some((ctx) => ctx.filePath.endsWith("good-naming.tf"))).toBe(true);

    const configPath = path.join(__dirname, "./configs/all.json");
    const engine = new RulesEngine();
    await engine.loadRules(configPath);

    const executionContext: ExecutionContext = { isPrivateRepo: false };
    const allViolations = contexts.flatMap((ctx) => engine.executeRules(ctx, executionContext));

    expect(allViolations).toHaveLength(0);
  });

  test("loads and respects disabled rules from config", async () => {
    const fixtureDir = path.join(__dirname, "./fixtures/invalid-terraform");
    const configPath = path.join(__dirname, "./configs/naming-disabled.json");
    const contexts = await parser.parseDirectory(fixtureDir);
    expect(contexts.length).toBeGreaterThan(0);
    expect(contexts.some((ctx) => ctx.filePath.endsWith("bad-naming.tf"))).toBe(true);

    const engine = new RulesEngine();
    await engine.loadRules(configPath);

    const executionContext: ExecutionContext = { isPrivateRepo: false };
    const allViolations = contexts.flatMap((ctx) => engine.executeRules(ctx, executionContext));

    // No violations because the naming rule is disabled in the config
    expect(allViolations).toHaveLength(0);
  });
});
