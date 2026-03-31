import { TerraformBlockRule } from "../../src/rules/rule-terraform-block";
import { TerraformFileContext, ExecutionContext } from "../../src/core/types";

describe("TerraformBlockRule", () => {
  const rule = new TerraformBlockRule();

  const privateRepo: ExecutionContext = { isPrivateRepo: true };
  const publicRepo: ExecutionContext = { isPrivateRepo: false };

  test("rejects empty terraform block", () => {
    const context: TerraformFileContext = {
      hcl: {
        terraform: [{}],
      },
      filePath: "any.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, privateRepo);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("oak-terraform-block-001");
    expect(violations[0].message).toContain("Empty");
    expect(violations[0].suggestion).toBeDefined();
  });

  describe("terraform.tf Validation Tests", () => {
    test("allows terraform block without cloud", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [
            {
              required_version: "1.0",
              required_providers: {
                google: [{ source: "hashicorp/google", version: "~> 4.0" }],
              },
            },
          ],
        },
        filePath: "terraform.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, privateRepo);
      expect(violations).toHaveLength(0);
    });

    test("rejects terraform block with cloud", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [
            {
              cloud: [{ organization: "my-org" }],
            },
          ],
        },
        filePath: "terraform.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, privateRepo);
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe("oak-terraform-block-001");
      expect(violations[0].message).toContain("cloud");
      expect(violations[0].suggestion).toBeDefined();
    });

    test("rejects non-terraform blocks in file", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [{ required_version: "1.0" }],
          resource: {
            aws_instance: [{ instance_type: "t2.micro" }],
          },
        },
        filePath: "terraform.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, privateRepo);
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("resource");
      expect(violations[0].suggestion).toBeDefined();
    });

    test("detects multiple violations in terraform.tf", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [{ cloud: [{ organization: "my-org" }] }],
          resource: {
            aws_instance: [{ instance_type: "t2.micro" }],
          },
          output: {
            id: [{ value: "aws_instance.id" }],
          },
        },
        filePath: "terraform.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, privateRepo);
      expect(violations).toHaveLength(2);
    });
  });

  describe("backend.tf Validation Tests", () => {
    test("allows cloud block only in private repo", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [{ cloud: [{ organization: "my-org" }] }],
        },
        filePath: "backend.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, privateRepo);
      expect(violations).toHaveLength(0);
    });

    test("rejects non-cloud terraform properties in private repo", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [
            {
              cloud: [{ organization: "my-org" }],
              required_version: "1.0",
            },
          ],
        },
        filePath: "backend.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, privateRepo);
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("Non-'cloud'");
      expect(violations[0].suggestion).toContain("terraform.tf");
    });

    test("rejects non-terraform blocks in private repo", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [{ cloud: [{ organization: "my-org" }] }],
          resource: {
            aws_instance: [{ instance_type: "t2.micro" }],
          },
        },
        filePath: "backend.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, privateRepo);
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("resource");
    });

    test("rejects backend.tf in public repo", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [{ cloud: [{ organization: "my-org" }] }],
        },
        filePath: "backend.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, publicRepo);
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("should not exist");
      expect(violations[0].message).toContain("public");
      expect(violations[0].suggestion).toContain("backend.tf.template");
    });

    test("detects multiple violations in backend.tf", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [
            {
              cloud: [{ organization: "my-org" }],
              required_providers: {
                google: [{ source: "hashicorp/google", version: "~> 4.0" }],
              },
            },
          ],
          locals: {
            common_tags: [{ env: "prod" }],
          },
        },
        filePath: "backend.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, privateRepo);
      expect(violations).toHaveLength(2);
    });
  });

  describe("backend.tf.template Validation Tests", () => {
    test("allows cloud with placeholder organization in public repo", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [
            {
              cloud: [{ organization: "your-organization-name" }],
            },
          ],
        },
        filePath: "backend.tf.template",
        fileContent: "",
      };

      const violations = rule.validate(context, publicRepo);
      expect(violations).toHaveLength(0);
    });

    test("rejects backend.tf.template in private repo", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [
            {
              cloud: [{ organization: "your-organization-name" }],
            },
          ],
        },
        filePath: "backend.tf.template",
        fileContent: "",
      };

      const violations = rule.validate(context, privateRepo);
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("should not exist");
      expect(violations[0].message).toContain("private");
      expect(violations[0].suggestion).toContain("backend.tf");
    });

    test("rejects non-cloud terraform properties in public repo", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [
            {
              cloud: [{ organization: "your-organization-name" }],
              required_version: "1.0",
            },
          ],
        },
        filePath: "backend.tf.template",
        fileContent: "",
      };

      const violations = rule.validate(context, publicRepo);
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("Non-'cloud'");
    });

    test("rejects non-terraform blocks in public repo", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [{ cloud: [{ organization: "your-organization-name" }] }],
          module: {
            vpc: [{ source: "terraform-aws-modules/vpc/aws" }],
          },
        },
        filePath: "backend.tf.template",
        fileContent: "",
      };

      const violations = rule.validate(context, publicRepo);
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("module");
    });

    test("rejects non-placeholder organization value in public repo", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [
            {
              cloud: [{ organization: "my-org" }],
            },
          ],
        },
        filePath: "backend.tf.template",
        fileContent: "",
      };

      const violations = rule.validate(context, publicRepo);
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("your-organization-name");
      expect(violations[0].suggestion).toContain("your-organization-name");
    });

    test("detects multiple violations in backend.tf.template", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [
            {
              cloud: [{ organization: "my-org" }],
              required_version: "1.0",
            },
          ],
          resource: {
            aws_instance: [{ instance_type: "t2.micro" }],
          },
        },
        filePath: "backend.tf.template",
        fileContent: "",
      };

      const violations = rule.validate(context, publicRepo);
      expect(violations).toHaveLength(3);
    });
  });

  describe("Other Files Validation Tests", () => {
    test("allows files without terraform blocks", () => {
      const context: TerraformFileContext = {
        hcl: {
          resource: {
            aws_instance: [{ instance_type: "t2.micro" }],
          },
          variable: {
            instance_count: [{ type: "number" }],
          },
        },
        filePath: "main.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, privateRepo);
      expect(violations).toHaveLength(0);
    });

    test("rejects terraform blocks in other files", () => {
      const context: TerraformFileContext = {
        hcl: {
          terraform: [{ required_version: "1.0" }],
          resource: {
            aws_instance: [{ instance_type: "t2.micro" }],
          },
        },
        filePath: "main.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, privateRepo);
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("terraform");
      expect(violations[0].message).toContain("allowed");
      expect(violations[0].suggestion).toContain("terraform.tf");
    });
  });
});
