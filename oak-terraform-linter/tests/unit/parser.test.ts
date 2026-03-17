import { TerraformParser } from "../../src/core/parser";

describe("TerraformParser", () => {
  const parser = new TerraformParser();

  test("parses simple Terraform file", async () => {
    const content = `
      resource "aws_s3_bucket" "example" {
        bucket = "my-bucket"
      }
    `;
    const context = await parser.parseContent(content, "test.tf");
    expect(context.json).toBeDefined();
    expect(context.filePath).toBe("test.tf");
    expect(context.fileContent).toBe(content);
  });

  test("parses variables", async () => {
    const content = `
      variable "environment" {
        type = string
        default = "dev"
        description = "Environment name"
      }
    `;
    const context = await parser.parseContent(content, "test.tf");
    expect(context.json).toBeDefined();
    expect(context.filePath).toBe("test.tf");
  });

  test("throws error on invalid HCL2", async () => {
    const content = `invalid hcl2 syntax {{{`;
    await expect(parser.parseContent(content, "bad.tf")).rejects.toThrow();
  });
});
