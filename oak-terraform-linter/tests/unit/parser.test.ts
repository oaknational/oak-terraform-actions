import { TerraformParser } from "../../src/core/parser";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

describe("TerraformParser", () => {
  const parser = new TerraformParser();

  test("parses simple Terraform file", async () => {
    const content = `
      resource "aws_s3_bucket" "example" {
        bucket = "my-bucket"
      }
    `;
    const context = await parser.parseContent(content, "test.tf");
    expect(context.hcl).toBeDefined();
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
    expect(context.hcl).toBeDefined();

    const hcl = context.hcl as Record<string, unknown>;
    expect(hcl.variable).toBeDefined();

    const variables = hcl.variable as Record<string, unknown>;
    expect(variables.environment).toBeDefined();

    const environment = (variables.environment as unknown[])[0] as Record<string, unknown>;
    expect(environment.type).toBe("${string}");
    expect(environment.default).toBe("dev");
    expect(environment.description).toBe("Environment name");

    expect(context.filePath).toBe("test.tf");
  });

  test("throws error on invalid HCL2", async () => {
    const content = `invalid hcl2 syntax {{{`;
    await expect(parser.parseContent(content, "bad.tf")).rejects.toThrow();
  });

  describe("parseDirectory", () => {
    test("parses .tf files from nested directories", async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "parser-test-"));
      const nestedDir = path.join(tempDir, "nested");
      fs.mkdirSync(nestedDir);

      // Create test files at different levels
      const rootFile = path.join(tempDir, "root.tf");
      const nestedFile = path.join(nestedDir, "nested.tf");
      const tfContent = `resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }`;

      fs.writeFileSync(rootFile, tfContent);
      fs.writeFileSync(nestedFile, tfContent);

      const contexts = await parser.parseDirectory(tempDir);

      // Cleanup
      fs.rmSync(tempDir, { recursive: true });

      expect(contexts.length).toBe(2);
      expect(contexts.map((c) => path.basename(c.filePath))).toContain("root.tf");
      expect(contexts.map((c) => path.basename(c.filePath))).toContain("nested.tf");

      // Verify HCL output for each parsed file
      contexts.forEach((context) => {
        expect(context.hcl).toBeDefined();
        expect(context.fileContent).toBeDefined();

        const hcl = context.hcl as Record<string, unknown>;
        expect(hcl.resource).toBeDefined();

        const resources = hcl.resource as Record<string, unknown>;
        expect(resources.aws_vpc).toBeDefined();

        const vpcResources = resources.aws_vpc as Record<string, unknown>;
        expect(vpcResources.main).toBeDefined();

        const mainVpc = (vpcResources.main as unknown[])[0] as Record<string, unknown>;
        expect(mainVpc.cidr_block).toBe("10.0.0.0/16");
      });
    });

    test("throws descriptive error when any file fails to parse", async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "parser-test-"));
      const validFile = path.join(tempDir, "valid.tf");
      const invalidFile = path.join(tempDir, "invalid.tf");

      fs.writeFileSync(validFile, `resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }`);
      fs.writeFileSync(invalidFile, "invalid hcl2 syntax {{{");

      await expect(parser.parseDirectory(tempDir)).rejects.toThrow(/Failed to parse .*invalid\.tf/);

      // Cleanup
      fs.rmSync(tempDir, { recursive: true });
    });

    test("handles empty directory", async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "parser-test-empty-"));
      const contexts = await parser.parseDirectory(tempDir);

      // Cleanup
      fs.rmSync(tempDir, { recursive: true });

      expect(contexts).toEqual([]);
    });

    test("parses files concurrently in batches", async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "parser-test-concurrent-"));
      const tfContent = `resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }`;

      // Create multiple files to test concurrent parsing
      for (let i = 0; i < 15; i++) {
        fs.writeFileSync(path.join(tempDir, `file${i}.tf`), tfContent);
      }

      const contexts = await parser.parseDirectory(tempDir);

      // Cleanup
      fs.rmSync(tempDir, { recursive: true });

      expect(contexts.length).toBe(15);
      contexts.forEach((context) => {
        expect(context.hcl).toBeDefined();
        expect(context.filePath.endsWith(".tf")).toBe(true);
        expect(context.fileContent).toBe(tfContent);

        // Validate the complete HCL structure
        const hcl = context.hcl as Record<string, unknown>;
        expect(hcl.resource).toBeDefined();

        const resources = hcl.resource as Record<string, unknown>;
        expect(resources.aws_vpc).toBeDefined();

        const vpcResources = resources.aws_vpc as Record<string, unknown>;
        expect(vpcResources.main).toBeDefined();

        const mainVpc = (vpcResources.main as unknown[])[0] as Record<string, unknown>;
        expect(mainVpc.cidr_block).toBe("10.0.0.0/16");
      });
    });

    test("respects recursive false option", async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "parser-test-no-recursive-"));
      const modulesDir = path.join(tempDir, "modules");
      fs.mkdirSync(modulesDir);

      const tfContent = `resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }`;
      fs.writeFileSync(path.join(tempDir, "root.tf"), tfContent);
      fs.writeFileSync(path.join(modulesDir, "main.tf"), tfContent);

      const contexts = await parser.parseDirectory(tempDir, { recursive: false });

      // Cleanup
      fs.rmSync(tempDir, { recursive: true });

      expect(contexts).toHaveLength(1);
      expect(contexts[0].filePath).toContain("root.tf");
      expect(contexts[0].filePath).not.toContain("modules");
    });

    test("skips node_modules directory", async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "parser-test-node-modules-"));
      const nodeModulesDir = path.join(tempDir, "node_modules", "package");
      fs.mkdirSync(nodeModulesDir, { recursive: true });

      const tfContent = `resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }`;
      fs.writeFileSync(path.join(tempDir, "main.tf"), tfContent);
      fs.writeFileSync(path.join(nodeModulesDir, "index.tf"), tfContent);

      const contexts = await parser.parseDirectory(tempDir);

      // Cleanup
      fs.rmSync(tempDir, { recursive: true });

      expect(contexts).toHaveLength(1);
      expect(contexts[0].filePath).toContain("main.tf");
      expect(contexts[0].filePath).not.toContain("node_modules");
    });

    test("skips dot-directories", async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "parser-test-dot-dirs-"));
      const gitDir = path.join(tempDir, ".git");
      const terraformDir = path.join(tempDir, ".terraform");
      const normalDir = path.join(tempDir, "terraform");

      fs.mkdirSync(gitDir);
      fs.mkdirSync(terraformDir);
      fs.mkdirSync(normalDir);

      const tfContent = `resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }`;
      fs.writeFileSync(path.join(tempDir, "main.tf"), tfContent);
      fs.writeFileSync(path.join(gitDir, "config.tf"), tfContent);
      fs.writeFileSync(path.join(terraformDir, "state.tf"), tfContent);
      fs.writeFileSync(path.join(normalDir, "vpc.tf"), tfContent);

      const contexts = await parser.parseDirectory(tempDir);

      // Cleanup
      fs.rmSync(tempDir, { recursive: true });

      expect(contexts).toHaveLength(2); // main.tf + vpc.tf
      expect(contexts.every((c) => !c.filePath.includes(".git"))).toBe(true);
      expect(contexts.every((c) => !c.filePath.includes(".terraform"))).toBe(true);
      expect(contexts.some((c) => c.filePath.includes("terraform/vpc.tf"))).toBe(true);
    });

    test("combines recursive=false and directory filtering", async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "parser-test-combined-"));
      const nodeModulesDir = path.join(tempDir, "node_modules");
      const terraformDir = path.join(tempDir, ".terraform");

      fs.mkdirSync(nodeModulesDir);
      fs.mkdirSync(terraformDir);

      const tfContent = `resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }`;
      fs.writeFileSync(path.join(tempDir, "main.tf"), tfContent);
      fs.writeFileSync(path.join(nodeModulesDir, "main.tf"), tfContent);
      fs.writeFileSync(path.join(terraformDir, "state.tf"), tfContent);

      const contexts = await parser.parseDirectory(tempDir, { recursive: false });

      // Cleanup
      fs.rmSync(tempDir, { recursive: true });

      expect(contexts).toHaveLength(1);
      expect(contexts[0].filePath).toContain("main.tf");
      expect(contexts[0].filePath).not.toContain("node_modules");
      expect(contexts[0].filePath).not.toContain(".terraform");
    });

    test("deeply nested structure with recursive=true", async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "parser-test-deep-"));
      const vpcDir = path.join(tempDir, "modules", "vpc");
      const vpcTfDir = path.join(vpcDir, ".terraform");
      const computeDir = path.join(tempDir, "modules", "compute");
      const computeNmDir = path.join(computeDir, "node_modules");
      const gitDir = path.join(tempDir, ".git");

      // Create all directories
      fs.mkdirSync(vpcDir, { recursive: true });
      fs.mkdirSync(vpcTfDir);
      fs.mkdirSync(computeNmDir, { recursive: true });
      fs.mkdirSync(gitDir);

      const tfContent = `resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }`;

      // Create files
      fs.writeFileSync(path.join(tempDir, "main.tf"), tfContent);
      fs.writeFileSync(path.join(vpcDir, "main.tf"), tfContent);
      fs.writeFileSync(path.join(vpcTfDir, "state.tf"), tfContent);
      fs.writeFileSync(path.join(computeDir, "main.tf"), tfContent);
      fs.writeFileSync(path.join(computeNmDir, "package.tf"), tfContent);
      fs.writeFileSync(path.join(gitDir, "config.tf"), tfContent);

      const contexts = await parser.parseDirectory(tempDir);

      // Cleanup
      fs.rmSync(tempDir, { recursive: true });

      expect(contexts).toHaveLength(3); // root main.tf + vpc main.tf + compute main.tf
      expect(contexts.every((c) => !c.filePath.includes(".git"))).toBe(true);
      expect(contexts.every((c) => !c.filePath.includes("node_modules"))).toBe(true);
      expect(contexts.every((c) => !c.filePath.includes(".terraform"))).toBe(true);
    });

    test("defaults to recursive=true when options omitted", async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "parser-test-defaults-"));
      const nestedDir = path.join(tempDir, "nested");
      fs.mkdirSync(nestedDir);

      const tfContent = `resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }`;
      fs.writeFileSync(path.join(tempDir, "root.tf"), tfContent);
      fs.writeFileSync(path.join(nestedDir, "nested.tf"), tfContent);

      // Call without options parameter
      const contexts = await parser.parseDirectory(tempDir);

      // Cleanup
      fs.rmSync(tempDir, { recursive: true });

      expect(contexts).toHaveLength(2); // Should find both (recursive by default)
    });
  });
});
