import { Rule, TerraformFileContext, ExecutionContext, LintViolation } from "../core/types";
import path from "path";

export class TerraformBlockRule implements Rule {
  id = "oak-terraform-block-001";
  name = "Terraform Block Usage";
  description = "Enforces Oak conventions around where 'terraform' blocks can be used and what they can contain, based on file naming conventions and repo privacy.";
  severity = "error" as const;
  params: Record<string, unknown> = {};

  validate(
    context: TerraformFileContext,
    executionContext: ExecutionContext,
    _params?: Record<string, unknown>
  ): LintViolation[] {
    const fileName = path.basename(context.filePath);
    if (fileName === "terraform.tf") {
      return this.validateTerraformFile(context, executionContext);
    } else if (fileName === "backend.tf") {
      return this.validateBackendFile(context, executionContext);
    } else if (fileName === "backend.tf.template") {
      return this.validateBackendTemplateFile(context, executionContext);
    } else {
      return this.validateOtherFile(context);
    }
  }

  validateTerraformFile(context: TerraformFileContext, executionContext: ExecutionContext): LintViolation[] {
    const violations: LintViolation[] = [];
    
    // terraform blocks are allowed, no cloud blocks
    const terraformProps = getTerraformBlockKeys(context.hcl);
    if (terraformProps.has("cloud")) {
      violations.push(this.newCloudBlockViolation(context, executionContext));
    }
    
    // no non-terraform blocks
    const forbiddenBlocks = Object.keys(context.hcl).filter((key) => key !== "terraform");
    if (forbiddenBlocks.length > 0) {
      violations.push(this.newNonTerraformBlockViolation(context, forbiddenBlocks));
    } 

    return violations;
  }

  validateBackendFile(context: TerraformFileContext, executionContext: ExecutionContext): LintViolation[] {
    // if public shouldn't exist
    if (!executionContext.isPrivateRepo) {
      return [this.newForbiddenFileViolation(context, executionContext,
        `Rename backend.tf to backend.tf.template`
      )];
    }
    
    const violations: LintViolation[] = [];

    // terraform blocks are allowed with cloud blocks ONLY (no other props allowed).
    const forbiddenTFProps = Array.from(getTerraformBlockKeys(context.hcl)).filter((key) => key !== "cloud");
    if (forbiddenTFProps.length > 0) {
      violations.push(this.newNonCloudPropViolation(context, forbiddenTFProps));
    }
    
    // no non-terraform blocks
    const forbiddenBlocks = Object.keys(context.hcl).filter((key) => key !== "terraform");
    if (forbiddenBlocks.length > 0) {
      violations.push(this.newNonTerraformBlockViolation(context, forbiddenBlocks));
    }

    return violations;
  }

  validateBackendTemplateFile(context: TerraformFileContext, executionContext: ExecutionContext): LintViolation[] {
    // if private shouldn't exist
    if (executionContext.isPrivateRepo) {
      return [this.newForbiddenFileViolation(context, executionContext,
        `Rename backend.tf.template to backend.tf`
      )];
    }

    const violations: LintViolation[] = [];

    // terraform blocks are allowed with cloud blocks ONLY (no other props allowed).
    const forbiddenTFProps = Array.from(getTerraformBlockKeys(context.hcl)).filter((key) => key !== "cloud");
    if (forbiddenTFProps.length > 0) {
      violations.push(this.newNonCloudPropViolation(context, forbiddenTFProps));
    }

    // no non-terraform blocks
    const forbiddenBlocks = Object.keys(context.hcl).filter((key) => key !== "terraform");
    if (forbiddenBlocks.length > 0) {
      violations.push(this.newNonTerraformBlockViolation(context, forbiddenBlocks));
    }

    // cloud organization should be "your-organization-name"
    if (context.hcl.terraform && Array.isArray(context.hcl.terraform)) {
      context.hcl.terraform.forEach((terraformBlock: Record<string, unknown>) => {
        if (terraformBlock && typeof terraformBlock === "object" && terraformBlock.cloud && Array.isArray(terraformBlock.cloud)) {
          terraformBlock.cloud.forEach((cloudBlock: Record<string, unknown>) => {
            if (cloudBlock && typeof cloudBlock === "object" && cloudBlock.organization && cloudBlock.organization !== "your-organization-name") {
              violations.push({
                ruleId: this.id,
                ruleName: this.name,
                severity: this.severity,
                filePath: context.filePath,
                message: `In 'cloud' configuration the 'organization' property should be set to "your-organization-name" as this is a public repo.`,
                suggestion: `Change the value of 'organization' in the 'cloud' block to "your-organization-name"`,
              });
            }
          });
        }
      });
    }

    return violations;
  }

  validateOtherFile(context: TerraformFileContext): LintViolation[] {
    // no terraform blocks allowed
    if (context.hcl.terraform) {
      return [this.newTerraformBlockViolation(context)];
    }

    return [];
  }

  newCloudBlockViolation(context: TerraformFileContext, executionContext: ExecutionContext): LintViolation {
    const repoPrivacy = executionContext.isPrivateRepo ? "private" : "public";
    const targetFile = executionContext.isPrivateRepo ? "backend.tf" : "backend.tf.template";
    return {
      ruleId: this.id,
      ruleName: this.name,
      severity: this.severity,
      filePath: context.filePath,
      message: `In a ${repoPrivacy} repo 'terraform' blocks should not contain 'cloud' blocks outside of ${targetFile}`,
      suggestion: `Remove the 'cloud' block from in ${path.basename(context.filePath)} and move it inside a 'terraform' block in ${targetFile}`,
    };
  }

  newNonCloudPropViolation(context: TerraformFileContext, forbiddenProps: string[]): LintViolation {
    const forbiddenPropsStr = forbiddenProps.join(", ");
    return {
      ruleId: this.id,
      ruleName: this.name,
      severity: this.severity,
      filePath: context.filePath,
      message: `Non-'cloud' properties in 'terraform' blocks should go in terraform.tf. Found non-'cloud' prop(s): ${forbiddenPropsStr}`,
      suggestion: `Remove 'terraform' prop(s) ${forbiddenPropsStr} from ${path.basename(context.filePath)} and move them to a 'terraform' block in terraform.tf`,
    };
  }

  newTerraformBlockViolation(context: TerraformFileContext): LintViolation {
    return {
      ruleId: this.id,
      ruleName: this.name,
      severity: this.severity,
      filePath: context.filePath,
      message: `No 'terraform' blocks are allowed outside of terraform.tf (and backend.tf/backend.tf.template for 'cloud' blocks)`,
      suggestion: `Remove the 'terraform' block from ${path.basename(context.filePath)} and move it to terraform.tf`,
    };
  }

  newNonTerraformBlockViolation(context: TerraformFileContext, forbiddenBlocks: string[]): LintViolation {
    const forbiddenBlocksStr = forbiddenBlocks.join(", ");
    return {
      ruleId: this.id,
      ruleName: this.name,
      severity: this.severity,
      filePath: context.filePath,
      message: `No non-'terraform' blocks are allowed in ${path.basename(context.filePath)}. Found block(s): ${forbiddenBlocksStr}`,
      suggestion: `Remove block(s) ${forbiddenBlocksStr} from ${path.basename(context.filePath)}`,
    };
  }

  newForbiddenFileViolation(context: TerraformFileContext, executionContext: ExecutionContext, suggestion: string): LintViolation {
    const repoPrivacy = executionContext.isPrivateRepo ? "private" : "public";
    return {
      ruleId: this.id,
      ruleName: this.name,
      severity: this.severity,
      filePath: context.filePath,
      message: `The file ${path.basename(context.filePath)} should not exist in a ${repoPrivacy} repo.`,
      suggestion,
    };
  }
}

// Get and flatten any keys in any terraform blocks
function getTerraformBlockKeys(hclObject: Record<string, unknown>): Set<string> {
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
