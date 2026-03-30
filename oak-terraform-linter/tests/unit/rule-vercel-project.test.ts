import { VercelProjectRule } from "../../src/rules/rule-vercel-project";
import { TerraformFileContext } from "../../src/core/types";

describe("VercelProjectRule", () => {
  const rule = new VercelProjectRule();

  test("allows vercel_project in correct location", () => {
    const context: TerraformFileContext = {
      hcl: {
        module: {
          vercel: [
            {
              source: "github.com/oaknational/oak-terraform-modules//modules/vercel_project",
            },
          ],
        },
      },
      filePath: "infrastructure/project/main.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations).toHaveLength(0);
  });

  test("rejects vercel_project in wrong directory", () => {
    const context: TerraformFileContext = {
      hcl: {
        module: {
          vercel: [
            {
              source: "github.com/oaknational/oak-terraform-modules//modules/vercel_project",
            },
          ],
        },
      },
      filePath: "infrastructure/application/main.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("oak-vercel-project-001");
    expect(violations[0].severity).toBe("error");
    expect(violations[0].message).toContain("infrastructure/project");
    expect(violations[0].suggestion).toContain("infrastructure/project");
  });

  test("allows vercel_project with ref in correct location", () => {
    const context: TerraformFileContext = {
      hcl: {
        module: {
          vercel: [
            {
              source:
                "github.com/oaknational/oak-terraform-modules//modules/vercel_project?ref=v1.1.1",
            },
          ],
        },
      },
      filePath: "infrastructure/project/main.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations).toHaveLength(0);
  });

  test("rejects vercel_project with ref in wrong directory", () => {
    const context: TerraformFileContext = {
      hcl: {
        module: {
          vercel: [
            {
              source:
                "github.com/oaknational/oak-terraform-modules//modules/vercel_project?ref=v1.1.1",
            },
          ],
        },
      },
      filePath: "infrastructure/application/main.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("oak-vercel-project-001");
    expect(violations[0].severity).toBe("error");
    expect(violations[0].message).toContain("infrastructure/project");
    expect(violations[0].suggestion).toContain("infrastructure/project");
  });

  test("rejects vercel_project in different path", () => {
    const context: TerraformFileContext = {
      hcl: {
        module: {
          vercel: [
            {
              source: "github.com/oaknational/oak-terraform-modules//modules/vercel_project",
            },
          ],
        },
      },
      filePath: "any/path/main.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("oak-vercel-project-001");
    expect(violations[0].severity).toBe("error");
    expect(violations[0].message).toContain("infrastructure/project");
    expect(violations[0].suggestion).toContain("infrastructure/project");
  });

  test("allows any file without vercel_project", () => {
    const context: TerraformFileContext = {
      hcl: {
        module: {
          gcp_job: [
            {
              source: "github.com/oaknational/oak-terraform-modules//modules/gcp_job",
            },
          ],
        },
      },
      filePath: "any/path/main.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations).toHaveLength(0);
  });

  test("allows file with multiple modules including vercel_project in correct directory", () => {
    const context: TerraformFileContext = {
      hcl: {
        module: {
          gcp_job: [
            {
              source: "github.com/oaknational/oak-terraform-modules//modules/gcp_job",
            },
          ],
          vercel: [
            {
              source: "github.com/oaknational/oak-terraform-modules//modules/vercel_project",
            },
          ],
          gcp_func: [
            {
              source: "github.com/oaknational/oak-terraform-modules//modules/gcp_function",
            },
          ],
        },
      },
      filePath: "infrastructure/project/main.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations).toHaveLength(0);
  });

  test("rejects file with multiple modules including vercel_project in different path", () => {
    const context: TerraformFileContext = {
      hcl: {
        module: {
          gcp_job: [
            {
              source: "github.com/oaknational/oak-terraform-modules//modules/gcp_job",
            },
          ],
          vercel: [
            {
              source: "github.com/oaknational/oak-terraform-modules//modules/vercel_project",
            },
          ],
          gcp_func: [
            {
              source: "github.com/oaknational/oak-terraform-modules//modules/gcp_function",
            },
          ],
        },
      },
      filePath: "any/path/main.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("oak-vercel-project-001");
    expect(violations[0].severity).toBe("error");
    expect(violations[0].message).toContain("infrastructure/project");
    expect(violations[0].suggestion).toContain("infrastructure/project");
  });

  test("allows file with multiple modules not including vercel_project in different path", () => {
    const context: TerraformFileContext = {
      hcl: {
        module: {
          gcp_job: [
            {
              source: "github.com/oaknational/oak-terraform-modules//modules/gcp_job",
            },
          ],
          gcp_sql: [
            {
              source: "github.com/oaknational/oak-terraform-modules//modules/gcp_sql",
            },
          ],
          gcp_func: [
            {
              source: "github.com/oaknational/oak-terraform-modules//modules/gcp_function",
            },
          ],
        },
      },
      filePath: "any/path/main.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations).toHaveLength(0);
  });

  test("allows empty modules block", () => {
    const context: TerraformFileContext = {
      hcl: {
        module: {},
      },
      filePath: "any/path/main.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations).toHaveLength(0);
  });

  test("allows vercel_project in longer path prefix", () => {
    const context: TerraformFileContext = {
      hcl: {
        module: {
          vercel: [
            {
              source: "github.com/oaknational/oak-terraform-modules//modules/vercel_project",
            },
          ],
        },
      },
      filePath: "a/longer/path/to/infrastructure/project/main.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations).toHaveLength(0);
  });
});
