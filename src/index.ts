import { ExitPromptError } from "@inquirer/core";
import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";
import fs from "fs";
import inquirer from "inquirer";
import { Parser } from "json2csv";
import path from "path";
import chalk from "chalk";

import type { ModeType } from "./types";

import { log } from "./utils/log";

import { salonsOwnersWithoutSalon } from "./scripts/salons-owners-without-salon";
import { salonsWithoutEmail } from "./scripts/salons-without-email";
import { salonsWithoutOwners } from "./scripts/salons-without-owners";
import { usersWithDuplicateEmail } from "./scripts/users-with-duplicate-emails";

const prompt = inquirer.prompt;

dotenv.config();

type EnvUnion = "local" | "staging" | "production";

type ScriptName =
  | "salons-without-email"
  | "salons-without-owners"
  | "salons-owners-without-salon"
  | "users-with-duplicate-email";

const tokens: Record<EnvUnion, string | undefined> = {
  local: process.env.LOCAL_TOKEN,
  staging: process.env.STAGING_TOKEN,
  production: process.env.PROD_TOKEN,
};

const url: Record<EnvUnion, string | undefined> = {
  local: process.env.LOCAL_URL,
  staging: process.env.STAGING_URL,
  production: process.env.PROD_URL,
};

const init = async () => {
  const scripts: Record<
    ScriptName,
    (api: AxiosInstance, mode: ModeType) => any
  > = {
    "salons-without-email": salonsWithoutEmail,
    "salons-without-owners": salonsWithoutOwners,
    "salons-owners-without-salon": salonsOwnersWithoutSalon,
    "users-with-duplicate-email": usersWithDuplicateEmail,
  };

  try {
    const { script } = await prompt<{ script: ScriptName }>([
      {
        type: "list",
        name: "script",
        message: "Which script do you want to run?",
        choices: Object.keys(scripts),
      },
    ]);

    const { env } = await prompt<{ env: EnvUnion }>([
      {
        type: "list",
        name: "env",
        message: "In which environment do you want to run the script?",
        choices: ["local", "staging", "production"],
        default: "local",
      },
    ]);

    const { mode } = await prompt<{ mode: ModeType }>([
      {
        type: "list",
        name: "mode",
        message: "Just read data or update it?",
        choices: ["read", "update"],
        default: "read",
      },
    ]);

    if (env === "production") {
      const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
        {
          type: "confirm",
          name: "confirm",
          message: "Are you sure you want to run the script in production?",
          default: false,
        },
      ]);

      if (!confirm) {
        console.log("Operation canceled.");
        return;
      }
    }

    console.log(
      chalk.cyanBright(`Running script "${script}" in environment "${env}"...`)
    );

    if (!url[env]) {
      console.log(chalk.bgRed(`Please add ${env} url to ".env"`));
      return;
    }

    if (!tokens[env]) {
      console.log(chalk.bgRed(`Please add ${env} api token to ".env"`));
      return;
    }

    const api = axios.create({
      baseURL: url[env],
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokens[env],
      },
    });

    const run = scripts[script];
    const res = await run(api, mode);

    if (res) {
      if (!res.length) {
        console.log(chalk.yellow("Nothing found!"));
        return;
      }

      log(res);
      console.log(chalk.green(`${res.length} - items found`));

      const { exportToCsv } = await prompt<{ exportToCsv: boolean }>([
        {
          type: "confirm",
          name: "exportToCsv",
          message: "Export to CSV?",
          default: false,
        },
      ]);

      if (exportToCsv) {
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(res);

        const dir = "./src/exported-data";

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const date = new Date()
          .toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "-");

        const filePath = path.join(dir, `${script}-data-${date}.csv`);
        fs.writeFileSync(filePath, csv);
      }
    }
  } catch (error) {
    if (error instanceof ExitPromptError) {
      return;
    }

    console.error("An error occurred:", error);
  }
};

init();
