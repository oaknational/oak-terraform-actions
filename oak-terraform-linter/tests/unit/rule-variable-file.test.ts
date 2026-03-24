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
        fileContent: "",
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
        fileContent: "",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(0);
    });

    test("allows empty variables.tf", () => {
      const context: TerraformFileContext = {
        hcl: {},
        filePath: "variables.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(0);
    });

    test("allows variables.tf in nested path", () => {
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
        fileContent: "",
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
        fileContent: "",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(0);
    });
  });

  describe("Invalid Cases", () => {
    test("detects non-variable blocks in variables.tf", () => {
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
        fileContent: "",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe("oak-variable-file-001");
      expect(violations[0].severity).toBe("error");
      expect(violations[0].message).toContain("resource");
      expect(violations[0].filePath).toBe("variables.tf");
    });

    test("detects multiple non-variable block types in variables.tf", () => {
      const context: TerraformFileContext = {
        hcl: {
          variable: {
            env: [{ type: "string" }],
            another_var: [{ type: "string" }],
          },
          resource: {
            aws_instance: {
              app: [{ instance_type: "t2.micro" }],
            },
          },
          output: {
            instance_id: [{ value: "aws_instance.app.id" }],
          },
          locals: {
            common_tags: [{ Environment: "dev" }],
          },
        },
        filePath: "./infrastructure/project/variables.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe("oak-variable-file-001");
      expect(violations[0].severity).toBe("error");
      expect(violations[0].message).toContain("resource");
      expect(violations[0].message).toContain("output");
      expect(violations[0].message).toContain("locals");
      expect(violations[0].filePath).toBe("./infrastructure/project/variables.tf");
    });

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
        fileContent: "",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe("oak-variable-file-001");
      expect(violations[0].severity).toBe("error");
      expect(violations[0].message).toContain("environment");
      expect(violations[0].filePath).toBe("main.tf");
    });

    test("detects multiple variables as a single violation", () => {
      const context: TerraformFileContext = {
        hcl: {
          variable: {
            app_name: [{ type: "string" }],
            api_port: [{ type: "number" }],
            debug_mode: [{ type: "bool" }],
          },
        },
        filePath: "outputs.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("app_name");
      expect(violations[0].message).toContain("api_port");
      expect(violations[0].message).toContain("debug_mode");
    });

    test("violation includes all required fields", () => {
      const context: TerraformFileContext = {
        hcl: {
          variable: {
            test_var: [{ type: "string" }],
          },
        },
        filePath: "terraform.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, {});
      expect(violations).toHaveLength(1);

      const violation = violations[0];
      expect(violation.ruleId).toBe("oak-variable-file-001");
      expect(violation.ruleName).toBe("Variable File Usage");
      expect(violation.severity).toBe("error");
      expect(violation.filePath).toBe("terraform.tf");
      expect(violation.message).toContain(
        "All variable definitions should be in variables.tf. Found variable(s): "
      );
      expect(violation.message).toContain("test_var");
      expect(violation.suggestion).toBe("Move variable definition(s) to variables.tf");
    });
  });
});
