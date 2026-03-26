import { Rule, TerraformFileContext, ExecutionContext, LintViolation } from "../core/types";
import path from "path";

export class TerraformBlockRule implements Rule {
  id = "oak-terraform-blocks-001";
  name = "Terraform Block Usage";
  description = "";
  severity = "error" as const;
  params: Record<string, unknown> = {};

  validate(
    context: TerraformFileContext,
    _executionContext: ExecutionContext,
    _params?: Record<string, unknown>
  ): LintViolation[] {
    const fileName = path.basename(context.filePath);
    if (fileName === "terraform.tf") {
      return this.validateTerraformFile(context);
    } else if (fileName === "backend.tf") {
      // if private
      // * terraform blocks are allowed with cloud blocks ONLY (no other props allowed).
      // * no non-terraform blocks
      // if public
      // * shouldn't exist
      throw new Error('not implemented yet');
    } else if (fileName === "backend.tf.template") {
      // terraform blocks are allowed with cloud blocks ONLY.
      // no non-terraform blocks
      // org should be "your-organizaton-name"
      throw new Error('not implemented yet');
    } else {
      // no terraform blocks
      throw new Error('not implemented yet');
    }
  }

  // terraform blocks are allowed, no cloud blocks
  // no non-terraform blocks
  validateTerraformFile(context: TerraformFileContext): LintViolation[] {
    const violations: LintViolation[] = [];
    const terraformKeys = getTerraformKeys(context.hcl);
    if (terraformKeys.has("cloud")) {
      violations.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        filePath: context.filePath,
        message: `'terraform' blocks in terraform.tf should not contain 'cloud' blocks.`,
        suggestion: "Remove the 'cloud' block from the 'terraform' block in terraform.tf and move it to backend.tf or backend.tf.template",
      });
    }

    const forbiddenKeys = Object.keys(context.hcl).filter((key) => key !== "terraform");
    if (forbiddenKeys.length > 0) {
      const forbiddenKeysStr = forbiddenKeys.join(", ");
      violations.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        filePath: context.filePath,
        message: `No non-'terraform' blocks are allowed in terraform.tf. Found block(s): ${forbiddenKeysStr}`,
        suggestion: `Remove block(s) ${forbiddenKeysStr} from terraform.tf`,
      });
    } 

    return violations;
  }
}

// Get and flatten any keys in any terraform blocks
function getTerraformKeys(hclObject: Record<string, unknown>): Set<string> {
  const keys: Set<string> = new Set();

  if (hclObject.terraform && Array.isArray(hclObject.terraform)) {
    hclObject.terraform.forEach((terraformBlock: unknown) => {
      if (terraformBlock && typeof terraformBlock === "object") {
        Object.keys(terraformBlock).forEach((key) => {
          keys.add(key);
        });
      }
    });
  }

  return keys;
}
