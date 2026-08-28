import { parse } from "@cdktf/hcl2json";
import * as fs from "fs";
import * as path from "path";
import { TerraformFileContext, ParseOptions } from "./types";

const TERRAFORM_EXTENSIONS = [".tf", ".tf.template"];

export class TerraformParser {
  async parseFile(filePath: string): Promise<TerraformFileContext> {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return this.parseContent(fileContent, filePath);
  }

  /**
   * Parses HCL content into a JavaScript object.
   * We use @cdktf/hcl2json - see https://www.npmjs.com/package/@cdktf/hcl2json
   * You can use the parse command in this package to see the exact output structure of the parser.
   *
   * Example output structure for the parsed HCL object (note how config blocks are wrapped in arrays):
   * ```json
   * {
   *   "resource": {
   *     "aws_vpc": {
   *       "main": [{ "cidr_block": "10.0.0.0/16" }]
   *     }
   *   },
   *   "variable": {
   *     "name": [
   *       {
   *         "description": "Name to be used on all resources",
   *         "type": "${string}",
   *         "default": ""
   *       }
   *     ]
   *   }
   * }
   * ```
   */
  async parseContent(content: string, filePath: string): Promise<TerraformFileContext> {
    try {
      const parsed = await parse(filePath, content);
      return {
        hcl: parsed,
        filePath,
        fileContent: content,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse ${filePath}: ${message}`);
    }
  }

  async parseDirectory(dirPath: string, options?: ParseOptions): Promise<TerraformFileContext[]> {
    const parseOptions: ParseOptions = options || { recursive: true };
    const files = this.findTerraformFiles(dirPath, parseOptions);
    const concurrencyLimit = 10;
    const contexts: TerraformFileContext[] = [];

    for (let i = 0; i < files.length; i += concurrencyLimit) {
      const batch = files.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(batch.map((file) => this.parseFile(file)));
      contexts.push(...batchResults);
    }

    return contexts;
  }

  private findTerraformFiles(dirPath: string, options: ParseOptions): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        // Skip node_modules
        if (entry.name === "node_modules") {
          continue;
        }

        // Skip dot-directories (e.g. '.terraform')
        if (entry.name.startsWith(".")) {
          continue;
        }

        // Only recurse if recursive mode is enabled
        if (options.recursive) {
          files.push(...this.findTerraformFiles(fullPath, options));
        }
      } else if (TERRAFORM_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }

    return files;
  }
}
