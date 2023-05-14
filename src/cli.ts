#!/usr/bin/env node
import {EOL} from "os";
import {argv, exit, stderr} from "process";
import Cli from "./cli/Cli";
import CliError, {ErrorCode} from "./cli/CliError";

import {formatErrorStack} from "./common/ErrorUtils";

const unexpectedErrorMessage = `Sorry, an unexpected error has occurred :-(
It would be great if you spend few minutes and report it at:

  https://github.com/RandomVoid/cpp-merge/issues/new

Please attach following information:
`;

const cli = new Cli();

try {
  const args = argv.slice(2);
  cli.run(args);
} catch (error) {
  if (error instanceof CliError) {
    stderr.write(error.message);
    stderr.write(EOL);
    exit(error.errorCode);
  }
  stderr.write(unexpectedErrorMessage);
  stderr.write(formatErrorStack(error));
  stderr.write(EOL);
  exit(ErrorCode.UnexpectedError);
}
