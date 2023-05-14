import {EOL} from "os";
import {limitLineLength} from "../common/StringUtils";
import {Argument, Option} from "./Types";

export default class HelpFormatter {
  private readonly syntaxTitle = "Syntax";
  private readonly argumentsTitle = "Arguments";
  private readonly optionsTitle = "Options";
  private readonly lineMaxLength = 80;
  private readonly smallMargin = " ".repeat(2);
  private readonly largeMargin = " ".repeat(16);
  private readonly descriptionMaxLength = this.lineMaxLength - this.largeMargin.length;

  public formatHelp(programName: string, description: string, args: Argument[], options: Option[]): string {
    let help = programName;
    help += EOL;
    help += EOL;
    help += limitLineLength(description, this.lineMaxLength).join(EOL);
    help += EOL;

    help += this.formatSectionTitle(this.syntaxTitle);
    help += this.formatSyntaxHelp(programName, args, options);
    help += EOL;

    if (args.length > 0) {
      help += this.formatArgumentsHelp(args);
    }

    if (options.length > 0) {
      help += this.formatOptionsHelp(options);
    }

    return help;
  }

  public formatSyntaxHelp(programName: string, args: Argument[], options: Option[]): string {
    let help = this.smallMargin;
    help += programName;
    if (options.length > 0) {
      help += ` [${this.optionsTitle.toUpperCase()}]`;
    }

    for (const argument of args) {
      const valueName = argument.valueName || argument.name;
      help += ` <${valueName}>`;
    }

    return help;
  }

  public formatArgumentHelp(argument: Argument): string {
    let help = this.smallMargin;
    help += argument.valueName || argument.name;
    help += EOL;
    help += this.formatDescription(argument.description);
    return help;
  }

  public formatOptionHelp(option: Option): string {
    let help = this.smallMargin;
    help += option.options.map(opt => {
      let optionHelp = opt;
      if (option.value) {
        optionHelp += ` <${option.value.name}>`;
      }
      return optionHelp;
    }).join(", ");

    help += EOL;
    help += this.formatDescription(option.description);
    return help;
  }

  private formatSectionTitle(title: string) {
    let help = EOL;
    help += `${title}:`;
    help += EOL;
    return help;
  }

  private formatArgumentsHelp(args: Argument[]): string {
    let help = this.formatSectionTitle(this.argumentsTitle);
    let separator = "";
    for (const argument of args) {
      help += separator;
      help += this.formatArgumentHelp(argument);
      separator = EOL;
    }
    return help;
  }

  private formatDescription(description: string): string {
    let help = "";
    const descriptionLines = limitLineLength(description, this.descriptionMaxLength);
    descriptionLines.forEach(line => {
      help += this.largeMargin;
      help += line;
      help += EOL;
    });
    return help;
  }

  private formatOptionsHelp(options: Option[]): string {
    let help = this.formatSectionTitle(this.optionsTitle);
    let separator = "";
    for (const option of options) {
      help += separator;
      help += this.formatOptionHelp(option);
      separator = EOL;
    }
    return help;
  }
}
