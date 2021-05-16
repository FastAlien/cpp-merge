export type Argument = {
  name: string;
  description: string;
  valueName?: string;
};

export type OptionValue = {
  name: string
};

export type Option = {
  name: string;
  options: string[];
  description: string;
  value?: OptionValue;
};
