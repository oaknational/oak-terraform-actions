import yargs from "yargs";
import { TerraformParser } from "../../core/parser";

async function runParse(argv: string[]): Promise<number> {
  const args = await yargs(argv)
    .option("file", {
      alias: "f",
      type: "string",
      description: "Path to Terraform file to parse",
      default: "./src/commands/parse/input.tf",
    })
    .help()
    .parseAsync();

  try {
    const parser = new TerraformParser();
    const context = await parser.parseFile(args.file as string);

    console.log(JSON.stringify(context.hcl, null, 2));
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    return 1;
  }
}

(async () => {
  const exitCode = await runParse(process.argv.slice(2));
  process.exit(exitCode);
})();
