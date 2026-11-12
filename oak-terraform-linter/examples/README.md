## Usage

1. Review example configuration:
   ```bash
   cat examples/configs/example-config.json
   ```

2. Run linter against terraform samples:
   ```bash
   npm run linter -- --path ./examples/terraform-samples --rules ./examples/configs/example-config.json
   ```

3. See the violations reported with suggestions. The samples include `vercel_project` modules in two folders:
   - `infrastructure/project-api/` passes. The module may be used directly inside `infrastructure/project/` or `infrastructure/project-<name>/`.
   - `infrastructure/project_api/` is reported, because the folder name uses an underscore instead of a hyphen.

4. To understand the parsed HCL2 structure (useful for creating rules):
   ```bash
   npm run parse -- --file ./examples/terraform-samples/bad.tf
   ```
