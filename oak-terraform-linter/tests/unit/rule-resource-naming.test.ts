import { ResourceNamingRule } from "../../src/rules/rule-resource-naming";
import { TerraformFileContext } from "../../src/core/types";

describe("ResourceNamingRule", () => {
  const rule = new ResourceNamingRule();

  test("detects invalid naming patterns", () => {
    const context: TerraformFileContext = {
      hcl: {
        resource: {
          aws_s3_bucket: {
            InvalidName: [
              {
                bucket: "my-bucket",
              },
            ],
          },
        },
      },
      filePath: "test.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("InvalidName");
  });

  test("accepts valid naming patterns", () => {
    const context: TerraformFileContext = {
      hcl: {
        resource: {
          aws_s3_bucket: {
            valid_name: [
              {
                bucket: "my-bucket",
              },
            ],
          },
        },
      },
      filePath: "test.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations).toHaveLength(0);
  });

  test("handles missing resources", () => {
    const context: TerraformFileContext = {
      hcl: {},
      filePath: "test.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations).toHaveLength(0);
  });

  test("provides suggestions for invalid names", () => {
    const context: TerraformFileContext = {
      hcl: {
        resource: {
          aws_s3_bucket: {
            "Invalid-Name": [
              {
                bucket: "my-bucket",
              },
            ],
          },
        },
      },
      filePath: "test.tf",
      fileContent: "",
    };

    const violations = rule.validate(context, {});
    expect(violations[0].suggestion).toBeDefined();
    expect(violations[0].suggestion).toContain("invalid_name");
  });
});
