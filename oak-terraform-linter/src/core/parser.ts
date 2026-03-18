import { parse } from "@cdktf/hcl2json";
import * as fs from "fs";
import * as path from "path";
import { TerraformFileContext } from "./types";

export class TerraformParser {
  async parseFile(filePath: string): Promise<TerraformFileContext> {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return this.parseContent(fileContent, filePath);
  }

  /**
   * Parses HCL content into a JavaScript object.
   * We use @cdktf/hcl2json - see https://www.npmjs.com/package/@cdktf/hcl2json
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

  async parseDirectory(dirPath: string): Promise<TerraformFileContext[]> {
    const files = this.findTerraformFiles(dirPath);
    const concurrencyLimit = 10;
    const contexts: TerraformFileContext[] = [];

    for (let i = 0; i < files.length; i += concurrencyLimit) {
      const batch = files.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(batch.map((file) => this.parseFile(file)));
      contexts.push(...batchResults);
    }

    return contexts;
  }

  private findTerraformFiles(dirPath: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        files.push(...this.findTerraformFiles(fullPath));
      } else if (entry.name.endsWith(".tf")) {
        files.push(fullPath);
      }
    }

    return files;
  }
}
