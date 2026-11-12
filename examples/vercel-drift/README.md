### Running Vercel drift detection for more than one Vercel project

The `terraform-vercel-drift` action checks one Terraform Cloud workspace against Vercel. By default it uploads the configuration in `infrastructure/project`.

A repo with more than one Vercel project, such as a monorepo, keeps each project's `vercel_project` configuration in its own `infrastructure/project-<name>` folder, with its own workspace. [`terraform_vercel_drift.yml`](terraform_vercel_drift.yml) runs the action once per project with a matrix, passing each folder as `TF_BASE_DIRECTORY` and each workspace as `TF_WORKSPACE`.

Replace the matrix entries with your repo's folders and workspace names. `fail-fast: false` lets every project be checked even when one of them reports drift.

The `terraform-checks` action needs no matrix: it lints everything under `infrastructure` by default, including every `project-<name>` folder. The `oak-vercel-project-001` lint rule accepts `infrastructure/project-<name>` from v1.14.0.
