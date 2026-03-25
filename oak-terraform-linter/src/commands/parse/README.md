# Parse Command

Parses Terraform HCL2 files and outputs the JSON structure used by the linter.

## Usage

```bash
# Use default input file
npm run parse

# Parse a specific file
npm run parse -- --file ./your-terraform.tf
```

## Why This Matters

When creating new rules, you need to understand the JSON structure that `@cdktf/hcl2json` produces. This command lets you see exactly what the parser generates from HCL2, making it easier to understand how to navigate and validate the data in your rules.

The `input.tf` file provides a realistic example of Terraform configuration with various resource types, variables, and outputs.
