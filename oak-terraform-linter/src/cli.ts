import yargs from "yargs";
import { TerraformParser } from "./core/parser";
import { RulesEngine } from "./rules/engine";
import { HumanReporter } from "./reporters/human";
import { ExecutionContext } from "./core/types";

export async function runCLI(argv: string[]): Promise<number> {
  const args = await yargs(argv)
    .option("path", {
      alias: "p",
      type: "string",
      description: "Path to Terraform directory or file",
      required: true,
    })
    .option("rules", {
      alias: "r",
      type: "string",
      description: "Path to rules configuration file (JSON)",
    })
    .option("strict", {
      alias: "s",
      type: "boolean",
      default: false,
      description: "Treat warnings as errors",
    })
    .option("private-repo", {
      type: "boolean",
      default: false,
      description: "Flag indicating if the repository is private",
    })
    .help()
    .parseAsync();

  try {
    const parser = new TerraformParser();
    const contexts = await parser.parseDirectory(args.path as string);

    const engine = new RulesEngine();
    if (args.rules) {
      await engine.loadRules(args.rules as string);
    } else {
      engine.loadDefaultRules();
    }

    const executionContext: ExecutionContext = {
      isPrivateRepo: args["private-repo"] as boolean,
    };

    const allViolations = contexts.flatMap((ctx) => engine.executeRules(ctx, executionContext));

    const reporter = new HumanReporter();
    reporter.report(allViolations, {
      strict: args.strict as boolean,
      fileCount: contexts.length,
    });

    const hasErrors = allViolations.some((v) => v.severity === "error");
    const hasWarnings = allViolations.some((v) => v.severity === "warning");

    if (hasErrors) return 1;
    if (hasWarnings && args.strict) return 1;
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    return 1;
  }
}
