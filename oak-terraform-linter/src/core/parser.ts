import { parse } from "@cdktf/hcl2json";
import * as fs from "fs";
import * as path from "path";
import { TerraformFileContext } from "./types";

export class TerraformParser {
  async parseFile(filePath: string): Promise<TerraformFileContext> {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return this.parseContent(fileContent, filePath);
  }

  async parseContent(content: string, filePath: string): Promise<TerraformFileContext> {
    try {
      const json = await parse(filePath, content);
      return {
        json,
        filePath,
        fileContent: content,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse ${filePath}: ${message}`);
    }
  }

  async parseDirectory(dirPath: string): Promise<TerraformFileContext[]> {
    const contexts: TerraformFileContext[] = [];
    const files = this.findTerraformFiles(dirPath);

    for (const file of files) {
      try {
        contexts.push(await this.parseFile(file));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Warning: ${message}`);
      }
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
