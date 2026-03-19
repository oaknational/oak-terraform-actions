import { VariableFileRule } from "../../src/rules/rule-variable-file";
import { TerraformFileContext } from "../../src/core/types";

describe("VariableFileRule", () => {
  const rule = new VariableFileRule();

  describe("Valid Cases", () => {
    test("allows variables in variables.tf", () => {
      const context: TerraformFileContext = {
        hcl: {
          variable: {
            environment: [
              {
                type: "string",
                default: "dev",
              },
            ],
            region: [
              {
                type: "string",
                default: "us-east-1",
              },
            ],
          },
        },
        filePath: "variables.tf",
        fileContent: "variable blocks here",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(0);
    });

    test("allows other files without variables", () => {
      const context: TerraformFileContext = {
        hcl: {
          resource: {
            aws_instance: {
              main: [
                {
                  ami: "ami-12345",
                  instance_type: "t2.micro",
                },
              ],
            },
          },
        },
        filePath: "main.tf",
        fileContent: "resource blocks here",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(0);
    });

    test("allows empty variables.tf", () => {
      const context: TerraformFileContext = {
        hcl: {
          resource: {
            aws_vpc: {
              main: [
                {
                  cidr_block: "10.0.0.0/16",
                },
              ],
            },
          },
        },
        filePath: "variables.tf",
        fileContent: "only resources here",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(0);
    });

    test("allows variables.tf in nested module paths", () => {
      const context: TerraformFileContext = {
        hcl: {
          variable: {
            module_var: [
              {
                type: "string",
              },
            ],
          },
        },
        filePath: "modules/vpc/variables.tf",
        fileContent: "module variable",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(0);
    });

    test("allows absolute path to variables.tf", () => {
      const context: TerraformFileContext = {
        hcl: {
          variable: {
            app_name: [
              {
                type: "string",
              },
            ],
          },
        },
        filePath: "/full/path/to/variables.tf",
        fileContent: "variable",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(0);
    });
  });

  describe("Invalid Cases", () => {
    test("detects single variable in main.tf", () => {
      const context: TerraformFileContext = {
        hcl: {
          variable: {
            environment: [
              {
                type: "string",
                default: "dev",
              },
            ],
          },
        },
        filePath: "main.tf",
        fileContent: "has variable",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe("oak-variable-file-001");
      expect(violations[0].severity).toBe("error");
      expect(violations[0].message).toContain("environment");
      expect(violations[0].filePath).toBe("main.tf");
    });

    test("includes all variable names in violation message", () => {
      const context: TerraformFileContext = {
        hcl: {
          variable: {
            app_name: [{ type: "string" }],
            api_port: [{ type: "number" }],
            debug_mode: [{ type: "bool" }],
          },
        },
        filePath: "outputs.tf",
        fileContent: "multiple variables",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("app_name");
      expect(violations[0].message).toContain("api_port");
      expect(violations[0].message).toContain("debug_mode");
    });

    test("violation includes complete required fields", () => {
      const context: TerraformFileContext = {
        hcl: {
          variable: {
            test_var: [{ type: "string" }],
          },
        },
        filePath: "terraform.tf",
        fileContent: "variable here",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(1);

      const violation = violations[0];
      expect(violation.ruleId).toBe("oak-variable-file-001");
      expect(violation.ruleName).toBe("Variable File Usage");
      expect(violation.severity).toBe("error");
      expect(violation.filePath).toBe("terraform.tf");
      expect(violation.message).toMatch(/variables\.tf/);
      expect(violation.suggestion).toBe("Move variable definitions to variables.tf");
    });

    test("detects variables in custom-named files", () => {
      const testFiles = ["config.tf", "vars.tf", "my_variables.tf", "settings.tf"];

      testFiles.forEach((filePath) => {
        const context: TerraformFileContext = {
          hcl: {
            variable: {
              app_config: [{ type: "string" }],
            },
          },
          filePath,
          fileContent: "variable",
        };

        const violations = rule.validate(context, {});
        expect(violations).toHaveLength(1);
        expect(violations[0].filePath).toBe(filePath);
      });
    });
  });

  describe("Edge Cases", () => {
    test("handles nested module with variables in variables.tf", () => {
      const validContext: TerraformFileContext = {
        hcl: {
          variable: {
            vpc_cidr: [{ type: "string" }],
          },
        },
        filePath: "modules/vpc/variables.tf",
        fileContent: "variable",
      };

      const validViolations = rule.validate(validContext, {});
      expect(validViolations).toHaveLength(0);

      const invalidContext: TerraformFileContext = {
        hcl: {
          variable: {
            vpc_cidr: [{ type: "string" }],
          },
        },
        filePath: "modules/vpc/main.tf",
        fileContent: "variable",
      };

      const invalidViolations = rule.validate(invalidContext, {});
      expect(invalidViolations).toHaveLength(1);
    });

    test("respects case sensitivity for filename", () => {
      const caseVariants = [
        { path: "VARIABLES.TF", shouldViolate: true },
        { path: "Variables.tf", shouldViolate: true },
        { path: "variables.TF", shouldViolate: true },
        { path: "variables.tf", shouldViolate: false },
      ];

      caseVariants.forEach(({ path, shouldViolate }) => {
        const context: TerraformFileContext = {
          hcl: {
            variable: {
              test_var: [{ type: "string" }],
            },
          },
          filePath: path,
          fileContent: "variable",
        };

        const violations = rule.validate(context, {});
        if (shouldViolate) {
          expect(violations).toHaveLength(1);
        } else {
          expect(violations).toHaveLength(0);
        }
      });
    });

    test("requires exact .tf extension", () => {
      const invalidExtensions = ["variables", "variables.tf.bak", "variables.txt"];

      invalidExtensions.forEach((filePath) => {
        const context: TerraformFileContext = {
          hcl: {
            variable: {
              test_var: [{ type: "string" }],
            },
          },
          filePath,
          fileContent: "variable",
        };

        const violations = rule.validate(context, {});
        expect(violations).toHaveLength(1);
        expect(violations[0].filePath).toBe(filePath);
      });
    });

    test("handles multiple variables with comma separation in message", () => {
      const context: TerraformFileContext = {
        hcl: {
          variable: {
            var_a: [{ type: "string" }],
            var_b: [{ type: "string" }],
            var_c: [{ type: "string" }],
            var_d: [{ type: "string" }],
          },
        },
        filePath: "main.tf",
        fileContent: "many variables",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain(", ");
    });
  });

  describe("Integration", () => {
    test("rule metadata is correct", () => {
      expect(rule.id).toBe("oak-variable-file-001");
      expect(rule.name).toBe("Variable File Usage");
      expect(rule.severity).toBe("error");
      expect(rule.description).toBeDefined();
      expect(rule.description.length).toBeGreaterThan(0);
    });

    test("rule ignores custom params", () => {
      const context: TerraformFileContext = {
        hcl: {
          variable: {
            env: [{ type: "string" }],
          },
        },
        filePath: "main.tf",
        fileContent: "variable",
      };

      const violationsWithoutParams = rule.validate(context, {});
      const violationsWithParams = rule.validate(context, {}, { anything: "here" });

      expect(violationsWithoutParams).toEqual(violationsWithParams);
      expect(violationsWithParams).toHaveLength(1);
    });

    test("rule ignores execution context", () => {
      const context: TerraformFileContext = {
        hcl: {
          variable: {
            test_var: [{ type: "string" }],
          },
        },
        filePath: "main.tf",
        fileContent: "variable",
      };

      const violationsEmpty = rule.validate(context, {});
      const violationsPrivateTrue = rule.validate(context, { isPrivateRepo: true });
      const violationsPrivateFalse = rule.validate(context, { isPrivateRepo: false });

      expect(violationsEmpty).toEqual(violationsPrivateTrue);
      expect(violationsPrivateTrue).toEqual(violationsPrivateFalse);
      expect(violationsEmpty).toHaveLength(1);
    });

    test("returns violations array even when empty", () => {
      const context: TerraformFileContext = {
        hcl: {},
        filePath: "main.tf",
        fileContent: "empty",
      };

      const violations = rule.validate(context, {});
      expect(Array.isArray(violations)).toBe(true);
      expect(violations).toHaveLength(0);
    });
  });
});
