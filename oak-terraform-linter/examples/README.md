## Usage

1. Review example configuration:
   ```bash
   cat examples/custom-rules/custom-naming-rules.json
   ```

2. Run linter against terraform samples:
   ```bash
   npm run linter -- --path ./examples/terraform-samples --rules ./examples/custom-rules/custom-naming-rules.json
   ```

3. See the violations reported with suggestions.

4. Create your own rules configuration based on these examples.
