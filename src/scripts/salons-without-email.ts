import { AxiosError, AxiosInstance } from "axios";
import qs from "qs";
import chalk from "chalk";
import { ModeType } from "../types";

export const salonsWithoutEmail = async (
  api: AxiosInstance,
  mode: ModeType
) => {
  try {
    const query = qs.stringify(
      {
        filters: {
          role: { type: { $eq: "salon" } },
          isAppActivated: true,
          email: { $null: true },
        },
        populate: {
          role: true,
          salon: true,
        },
      },
      {
        encodeValuesOnly: true,
      }
    );

    const { data: users } = await api.get(`/api/users?${query}`);

    if (mode === "update") {
      for (const user of users) {
        const { status } = await api.delete(`/api/users/${user.id}`);

        if (status >= 200 && status < 300) {
          console.log(chalk.redBright(`${user.id} - Deleted successfully`));
        }
      }
    }

    return users;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`${error.status} - ${error.message}`);
      return;
    }

    console.error(error);
  }
};
