import { RuleLoader } from "../../src/rules/loader";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("RuleLoader", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rule-loader-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true });
  });

  test("loads rules from valid config file", async () => {
    const configPath = path.join(tempDir, "rules.json");
    const config = {
      rules: [
        {
          ruleType: "naming-convention",
          enabled: true,
        },
      ],
    };
    fs.writeFileSync(configPath, JSON.stringify(config));

    const loader = new RuleLoader();
    const rules = await loader.loadRulesFromFile(configPath);
    expect(rules).toHaveLength(1);
    expect(rules[0].id).toBe("oak-naming-001");
  });

  test("skips disabled rules", async () => {
    const configPath = path.join(tempDir, "rules.json");
    const config = {
      rules: [
        {
          ruleType: "naming-convention",
          enabled: false,
        },
      ],
    };
    fs.writeFileSync(configPath, JSON.stringify(config));

    const loader = new RuleLoader();
    const rules = await loader.loadRulesFromFile(configPath);
    expect(rules).toHaveLength(0);
  });

  test("loads default rules", () => {
    const loader = new RuleLoader();
    const rules = loader.loadDefaultRules();
    expect(rules.length).toBeGreaterThan(0);
  });

  test("throws on missing rule type", async () => {
    const configPath = path.join(tempDir, "rules.json");
    const config = {
      rules: [
        {
          ruleType: "non-existent-rule",
          enabled: true,
        },
      ],
    };
    fs.writeFileSync(configPath, JSON.stringify(config));

    const loader = new RuleLoader();
    await expect(loader.loadRulesFromFile(configPath)).rejects.toThrow();
  });

  test("throws on invalid JSON", async () => {
    const configPath = path.join(tempDir, "rules.json");
    fs.writeFileSync(configPath, "invalid json {{{");

    const loader = new RuleLoader();
    await expect(loader.loadRulesFromFile(configPath)).rejects.toThrow();
  });

  test("overwrites default description if provided in config", async () => {
    const configPath = path.join(tempDir, "rules.json");
    const customDescription = "Custom description for naming convention rule.";
    const config = {
      rules: [
        {
          ruleType: "naming-convention",
          enabled: true,
          description: customDescription,
        },
      ],
    };
    fs.writeFileSync(configPath, JSON.stringify(config));

    const loader = new RuleLoader();
    const rules = await loader.loadRulesFromFile(configPath);
    expect(rules).toHaveLength(1);
    expect(rules[0].description).toBe(customDescription);
  });
});
