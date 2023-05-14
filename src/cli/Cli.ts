import fs from "fs";
import {Writable} from "stream";
import CppFileMerger from "../parse/CppFileMerger";
import {ParseError} from "../parse/Errors";
import ArgumentParser from "./ArgumentParser";
import CliError, {ErrorCode} from "./CliError";
import {ArgumentError, UnknownArgumentError, UnknownOptionError} from "./Errors";

enum ArgumentName {
  File = "file"
}

enum OptionName {
  Help = "help",
  Include = "include",
  Source = "source",
  Output = "output"
}

type Arguments = {
  help: boolean;
  inputFilePath?: string;
  includeDirectory?: string;
  sourceDirectory?: string;
  outputFilePath?: string;
};

export default class Cli {
  private readonly output: Writable;
  private readonly argumentParser: ArgumentParser;

  public constructor(output: Writable = process.stdout) {
    this.output = output;
    this.argumentParser = new ArgumentParser({
      programName: "cpp-merge",
      description: "A tool to produce single file from multiple C/C++ files. By default the produced content is " +
        "displayed on the standard output. To store it in a file use option -o or --output."
    });

    this.argumentParser.addArgument({
      name: ArgumentName.File,
      description: "Input file which will be processed. In most cases it will be file with main function.",
      valueName: "file"
    });

    this.argumentParser.addOption({
      name: OptionName.Help,
      options: ["--help"],
      description: "Show this help text."
    });

    this.argumentParser.addOption({
      name: OptionName.Include,
      options: ["-i", "--include"],
      description: "Path to additional directory where header files are located. Program will search for include " +
        "files first in directory where currently processed file is located and then in this directory.",
      value: {name: "path"}
    });

    this.argumentParser.addOption({
      name: OptionName.Source,
      options: ["-s", "--source"],
      description: "Path to additional directory where source files are located. After processing all included files, " +
        "program will try to find related source file for each of included local header files. If file with same " +
        "base name and extension .c or .cpp exists, it will be appended to the output. Program will search first " +
        "in the same directory where main source file is located and then in additional source directory.",
      value: {name: "path"}
    });

    this.argumentParser.addOption({
      name: OptionName.Output,
      options: ["-o", "--output"],
      description: "Store output in a file, instead of displaying it on the standard output.",
      value: {name: "file"}
    });
  }

  public run(args: string[]): void {
    if (args.length === 0) {
      this.printHelp();
      return;
    }

    try {
      const {help, inputFilePath, includeDirectory, sourceDirectory, outputFilePath} = this.parseArguments(args);
      if (help) {
        this.printHelp();
        return;
      }

      const content = this.parseFile(inputFilePath, includeDirectory, sourceDirectory);
      if (outputFilePath) {
        this.writeToFile(outputFilePath, content);
      } else {
        this.output.write(content);
      }
    } catch (error) {
      if (error instanceof ParseError) {
        throw new CliError(`Error parsing file '${error.file}': ${error.message}`, ErrorCode.ParseError);
      }

      if (error instanceof UnknownOptionError) {
        throw new CliError(`Unknown option: '${error.argument}'`, ErrorCode.ArgumentError);
      }

      if (error instanceof UnknownArgumentError) {
        throw new CliError(`Unknown argument: '${error.argument}'`, ErrorCode.ArgumentError);
      }

      if (error instanceof ArgumentError) {
        throw new CliError(`Invalid argument '${error.argument}': ${error.message}`, ErrorCode.ArgumentError);
      }

      throw error;
    }
  }

  private printHelp() {
    this.output.write(this.argumentParser.formatHelp());
  }

  private parseArguments(args: string[]): Arguments {
    const result = this.argumentParser.parseArguments(args);
    return {
      help: result.options[OptionName.Help] != null,
      inputFilePath: result.arguments[ArgumentName.File],
      includeDirectory: result.options[OptionName.Include],
      sourceDirectory: result.options[OptionName.Source],
      outputFilePath: result.options[OptionName.Output]
    };
  }

  private parseFile(inputFilePath?: string, includeDirectory?: string, sourceDirectory?: string): string {
    if (!inputFilePath) {
      throw new CliError('Missing input file', ErrorCode.ArgumentError);
    }

    this.validateInputFile(inputFilePath);

    if (includeDirectory) {
      this.validateIncludeDirectory(includeDirectory);
    }

    if (sourceDirectory) {
      this.validateSourceDirectory(sourceDirectory);
    }

    const fileMerger = new CppFileMerger({includeDirectory, sourceDirectory});
    return fileMerger.parse(inputFilePath);
  }

  private validateInputFile(inputFilePath: string) {
    if (!fs.existsSync(inputFilePath)) {
      throw new CliError(`Input file '${inputFilePath}' doesn't exist`, ErrorCode.ArgumentError);
    }

    if (!fs.statSync(inputFilePath).isFile()) {
      throw new CliError(`${inputFilePath} is not a file`, ErrorCode.ArgumentError);
    }
  }

  private validateIncludeDirectory(includeDirectory: string) {
    if (!fs.existsSync(includeDirectory)) {
      throw new CliError(`Include directory '${includeDirectory}' doesn't exist`, ErrorCode.ArgumentError);
    }

    if (!fs.statSync(includeDirectory).isDirectory()) {
      throw new CliError(`${includeDirectory} is not a directory`, ErrorCode.ArgumentError);
    }
  }

  private validateSourceDirectory(sourceDirectory: string) {
    if (!fs.existsSync(sourceDirectory)) {
      throw new CliError(`Source directory '${sourceDirectory}' doesn't exist`, ErrorCode.ArgumentError);
    }

    if (!fs.statSync(sourceDirectory).isDirectory()) {
      throw new CliError(`${sourceDirectory} is not a directory`, ErrorCode.ArgumentError);
    }
  }

  private writeToFile(outputFilePath: string, content: string) {
    try {
      fs.writeFileSync(outputFilePath, content)
    } catch (error) {
      const causeMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new CliError(`Error writing output to file '${outputFilePath}': ${causeMessage}`, ErrorCode.WriteError);
    }
  }
}
