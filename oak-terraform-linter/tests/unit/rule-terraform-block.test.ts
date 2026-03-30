import { TerraformBlockRule } from "../../src/rules/rule-terraform-block";
import { TerraformFileContext, ExecutionContext } from "../../src/core/types";

describe("TerraformBlockRule", () => {
  const rule = new TerraformBlockRule();

  const createExecutionContext = (isPrivateRepo: boolean): ExecutionContext => ({
    isPrivateRepo,
  });

  const terraformTfValidHcl = {
    terraform: [
      {
        required_version: "1.0",
        required_providers: {
          google: [{ source: "hashicorp/google", version: "~> 4.0" }],
        },
      },
    ],
  };

  const terraformTfWithCloudHcl = {
    terraform: [
      {
        cloud: [{ organization: "my-org" }],
      },
    ],
  };

  const terraformTfWithResourceHcl = {
    terraform: [{ required_version: "1.0" }],
    resource: {
      aws_instance: [{ instance_type: "t2.micro" }],
    },
  };

  const terraformTfMultipleViolationsHcl = {
    terraform: [{ cloud: [{ organization: "my-org" }] }],
    resource: {
      aws_instance: [{ instance_type: "t2.micro" }],
    },
    output: {
      id: [{ value: "aws_instance.id" }],
    },
  };

  const backendTfValidHcl = {
    terraform: [{ cloud: [{ organization: "my-org" }] }],
  };

  const backendTfWithNonCloudPropHcl = {
    terraform: [
      {
        cloud: [{ organization: "my-org" }],
        required_version: "1.0",
      },
    ],
  };

  const backendTfWithResourceHcl = {
    terraform: [{ cloud: [{ organization: "my-org" }] }],
    resource: {
      aws_instance: [{ instance_type: "t2.micro" }],
    },
  };

  const backendTfMultipleViolationsHcl = {
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
  };

  const backendTfEmptyTerraformHcl = {
    terraform: [{}],
  };

  const backendTemplateTfValidHcl = {
    terraform: [
      {
        cloud: [{ organization: "your-organization-name" }],
      },
    ],
  };

  const backendTemplateTfWithNonCloudPropHcl = {
    terraform: [
      {
        cloud: [{ organization: "your-organization-name" }],
        required_version: "1.0",
      },
    ],
  };

  const backendTemplateTfWithModuleHcl = {
    terraform: [{ cloud: [{ organization: "your-organization-name" }] }],
    module: {
      vpc: [{ source: "terraform-aws-modules/vpc/aws" }],
    },
  };

  const backendTemplateTfWrongOrgHcl = {
    terraform: [
      {
        cloud: [{ organization: "my-org" }],
      },
    ],
  };

  const backendTemplateTfMultipleViolationsHcl = {
    terraform: [
      {
        cloud: [{ organization: "my-org" }],
        required_version: "1.0",
      },
    ],
    resource: {
      aws_instance: [{ instance_type: "t2.micro" }],
    },
  };

  const otherFileNoTerraformHcl = {
    resource: {
      aws_instance: [{ instance_type: "t2.micro" }],
    },
    variable: {
      instance_count: [{ type: "number" }],
    },
  };

  const otherFileWithTerraformHcl = {
    terraform: [{ required_version: "1.0" }],
    resource: {
      aws_instance: [{ instance_type: "t2.micro" }],
    },
  };

  describe("terraform.tf Validation Tests", () => {
    test("allows terraform block without cloud", () => {
      const context: TerraformFileContext = {
        hcl: terraformTfValidHcl,
        filePath: "terraform.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(true));
      expect(violations).toHaveLength(0);
    });

    test("rejects terraform block with cloud", () => {
      const context: TerraformFileContext = {
        hcl: terraformTfWithCloudHcl,
        filePath: "terraform.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(true));
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe("oak-terraform-block-001");
      expect(violations[0].message).toContain("cloud");
      expect(violations[0].suggestion).toBeDefined();
    });

    test("rejects non-terraform blocks in file", () => {
      const context: TerraformFileContext = {
        hcl: terraformTfWithResourceHcl,
        filePath: "terraform.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(true));
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("resource");
      expect(violations[0].suggestion).toBeDefined();
    });

    test("detects multiple violations in terraform.tf", () => {
      const context: TerraformFileContext = {
        hcl: terraformTfMultipleViolationsHcl,
        filePath: "terraform.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(true));
      expect(violations).toHaveLength(2);
    });
  });

  describe("backend.tf Validation Tests", () => {
    test("allows cloud block only in private repo", () => {
      const context: TerraformFileContext = {
        hcl: backendTfValidHcl,
        filePath: "backend.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(true));
      expect(violations).toHaveLength(0);
    });

    test("rejects non-cloud terraform properties in private repo", () => {
      const context: TerraformFileContext = {
        hcl: backendTfWithNonCloudPropHcl,
        filePath: "backend.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(true));
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("Non-'cloud'");
      expect(violations[0].suggestion).toContain("terraform.tf");
    });

    test("rejects non-terraform blocks in private repo", () => {
      const context: TerraformFileContext = {
        hcl: backendTfWithResourceHcl,
        filePath: "backend.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(true));
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("resource");
    });

    test("rejects backend.tf in public repo", () => {
      const context: TerraformFileContext = {
        hcl: backendTfValidHcl,
        filePath: "backend.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(false));
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("should not exist");
      expect(violations[0].message).toContain("public");
      expect(violations[0].suggestion).toContain("backend.tf.template");
    });

    test("detects multiple violations in backend.tf", () => {
      const context: TerraformFileContext = {
        hcl: backendTfMultipleViolationsHcl,
        filePath: "backend.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(true));
      expect(violations).toHaveLength(2);
    });

    test("allows empty terraform block in backend.tf", () => {
      const context: TerraformFileContext = {
        hcl: backendTfEmptyTerraformHcl,
        filePath: "backend.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(true));
      expect(violations).toHaveLength(0);
    });
  });

  describe("backend.tf.template Validation Tests", () => {
    test("allows cloud with placeholder organization in public repo", () => {
      const context: TerraformFileContext = {
        hcl: backendTemplateTfValidHcl,
        filePath: "backend.tf.template",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(false));
      expect(violations).toHaveLength(0);
    });

    test("rejects backend.tf.template in private repo", () => {
      const context: TerraformFileContext = {
        hcl: backendTemplateTfValidHcl,
        filePath: "backend.tf.template",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(true));
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("should not exist");
      expect(violations[0].message).toContain("private");
      expect(violations[0].suggestion).toContain("backend.tf");
    });

    test("rejects non-cloud terraform properties in public repo", () => {
      const context: TerraformFileContext = {
        hcl: backendTemplateTfWithNonCloudPropHcl,
        filePath: "backend.tf.template",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(false));
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("Non-'cloud'");
    });

    test("rejects non-terraform blocks in public repo", () => {
      const context: TerraformFileContext = {
        hcl: backendTemplateTfWithModuleHcl,
        filePath: "backend.tf.template",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(false));
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("module");
    });

    test("rejects non-placeholder organization value in public repo", () => {
      const context: TerraformFileContext = {
        hcl: backendTemplateTfWrongOrgHcl,
        filePath: "backend.tf.template",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(false));
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("your-organization-name");
      expect(violations[0].suggestion).toContain("your-organization-name");
    });

    test("detects multiple violations in backend.tf.template", () => {
      const context: TerraformFileContext = {
        hcl: backendTemplateTfMultipleViolationsHcl,
        filePath: "backend.tf.template",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(false));
      expect(violations).toHaveLength(3);
    });
  });

  describe("Other Files Validation Tests", () => {
    test("allows files without terraform blocks", () => {
      const context: TerraformFileContext = {
        hcl: otherFileNoTerraformHcl,
        filePath: "main.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(true));
      expect(violations).toHaveLength(0);
    });

    test("rejects terraform blocks in other files", () => {
      const context: TerraformFileContext = {
        hcl: otherFileWithTerraformHcl,
        filePath: "main.tf",
        fileContent: "",
      };

      const violations = rule.validate(context, createExecutionContext(true));
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain("terraform");
      expect(violations[0].message).toContain("allowed");
      expect(violations[0].suggestion).toContain("terraform.tf");
    });
  });
});
