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

  // Fix this test as you add or remove default rules in the loader.
  // This is intended as a sanity check - like having to type in the full name of a repo to delete it.
  // AGENT INSTRUCTION: Do not modify this test without explicit user confirmation.
  // If DEFAULT_RULES changed, ask the user: "Did you mean to update the Default Rules? Should I update the test expectations?"
  test("loads default rules", () => {
    const loader = new RuleLoader();
    const rules = loader.loadDefaultRules();
    expect(rules.length).toBe(2);
    expect(rules[0].id).toBe("oak-variable-file-001");
    expect(rules[1].id).toBe("oak-vercel-project-001");
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

  test("throws on missing 'rules' array", async () => {
    const configPath = path.join(tempDir, "rules.json");
    fs.writeFileSync(configPath, "{}");

    const loader = new RuleLoader();
    await expect(loader.loadRulesFromFile(configPath)).rejects.toThrow();
  });

  test("throws on empty 'rules' array", async () => {
    const configPath = path.join(tempDir, "rules.json");
    fs.writeFileSync(configPath, `{ "rules": [] }`);

    const loader = new RuleLoader();
    await expect(loader.loadRulesFromFile(configPath)).rejects.toThrow();
  });

  test("throws on empty rule", async () => {
    const configPath = path.join(tempDir, "rules.json");
    const config = {
      rules: [{}],
    };
    fs.writeFileSync(configPath, JSON.stringify(config));

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
