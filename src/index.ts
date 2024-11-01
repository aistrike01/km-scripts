import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { Parser } from "json2csv";

import { getSalonsWithoutEmail } from "./scripts/get-salons-users-without-email";
import { getUsersWithDuplicateEmail } from "./scripts/get-users-with-duplicate-emails";

import { log } from "./utils/log";

const prompt = inquirer.prompt;

dotenv.config();

type EnvUnion = "local" | "staging" | "production";
type ScriptName = "get-salons-without-email" | "get-users-with-duplicate-email";
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
    (api: AxiosInstance, read: boolean) => any
  > = {
    "get-salons-without-email": getSalonsWithoutEmail,
    "get-users-with-duplicate-email": getUsersWithDuplicateEmail,
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

    const { read } = await prompt<{ read: boolean }>([
      {
        type: "confirm",
        name: "read",
        message: "Read data without making changes?",
        default: true,
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

    console.log(`Running script "${script}" in environment "${env}"...`);

    const api = axios.create({
      baseURL: url[env],
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokens[env],
      },
    });

    const run = scripts[script];
    const res = await run(api, read);

    if (res) {
      log(res);

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

        const filePath = path.join(dir, `${script}-data-${Date.now()}.csv`);
        fs.writeFileSync(filePath, csv);
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

init();
