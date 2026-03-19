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
          ruleType: "helper-always-passes",
          enabled: true,
        },
      ],
    };
    fs.writeFileSync(configPath, JSON.stringify(config));

    const loader = new RuleLoader();
    const rules = await loader.loadRulesFromFile(configPath);
    expect(rules).toHaveLength(1);
    expect(rules[0].id).toBe("oak-helper-pass-001");
  });

  test("skips disabled rules", async () => {
    const configPath = path.join(tempDir, "rules.json");
    const config = {
      rules: [
        {
          ruleType: "helper-always-passes",
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

  test("loads custom params into rule from config", async () => {
    const configPath = path.join(tempDir, "rules.json");
    const config = {
      rules: [
        {
          ruleType: "helper-always-passes",
          enabled: true,
          params: {
            customParam: "custom-value",
          },
        },
      ],
    };
    fs.writeFileSync(configPath, JSON.stringify(config));

    const loader = new RuleLoader();
    const rules = await loader.loadRulesFromFile(configPath);
    expect(rules).toHaveLength(1);
    expect(rules[0].params).toBeDefined();
    expect((rules[0].params as Record<string, unknown>).customParam).toBe("custom-value");
  });
});
