export interface Config {
  defaultSigLabel?: string;
  timeout?: number;
  branches?: string[];
}

export const DEFAULT_CONFIG_FILE_PATH = "challenge-bot.yml";
export const DEFAULT_TIMEOUT = 7;
export const DEFAULT_CHALLENGE_PROGRAM_THEME = "long-term";
export const DEFAULT_BRANCHES = ["master", "main"];
