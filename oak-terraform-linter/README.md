# oak-terraform-linter

A custom rule-based linter for Terraform code.

## Features

- **Rule-based validation**: Define custom linting rules in TypeScript
- **JSON configuration**: Configure which rules to apply via JSON files
- **Actionable suggestions**: Rules can provide remediation suggestions
- **Extensibility**: Implement and register custom rules
- **Strict mode**: Treat warnings as errors for CI/CD pipelines
- **Environment-aware**: Rules can access execution context (e.g., private repo flag)

## Installation

```bash
npm install
npm run build
```

## Quick Start

### Run with Defaults

```bash
npm run linter -- --path ./path/to/terraform
```

### Use Custom Rules

```bash
npm run linter -- --path ./path/to/terraform --rules ./path/to/my-rules.json
```

### Strict Mode (fails on warnings)

```bash
npm run linter -- --path ./path/to/terraform --strict
```

### Production

```bash
# assuming 'npm run build'
node ./dist/index.js --path ./path/to/terraform --rules ./path/to/my-rules.json
```

### Inspect HCL2 JSON Structure

```bash
npm run parse -- --file ./your-terraform.tf
```

Use this to understand the parsed structure when authoring rules.

## Documentation

- [Rule Authoring Guide](src/rules/RULE_AUTHORING.md) - Create custom rules
- [Examples](examples/README.md) - Sample configurations and Terraform files
- [Parse Command](src/commands/parse/README.md) - Parse any Terraform file and output it as JSON

## Architecture

The linter is built around four core components:

1. **Parser** (`src/core/parser.ts`) - Converts HCL to JSON using @cdktf/hcl2json
2. **Rules Engine** (`src/rules/engine.ts`) - Loads and executes rules against the parsed HCL
3. **Rule Loader** (`src/rules/loader.ts`) - Instantiates rules (optionally from configuration files)
4. **Reporters** (`src/reporters/`) - Formats and outputs results

Rules are implemented as TypeScript classes that process the parsed HCL.

