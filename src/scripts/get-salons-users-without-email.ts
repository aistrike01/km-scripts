import { AxiosError, AxiosInstance } from "axios";
import qs from "qs";
import chalk from "chalk";

export const getSalonsWithoutEmail = async (
  api: AxiosInstance,
  read: boolean
) => {
  try {
    const query = qs.stringify(
      {
        filters: {
          role: { type: { $eq: "salon" } },
          isAppActivated: true,
          salon: { id: { $null: true } },
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

    if (!read) {
      for (const user of users) {
        const { status } = await api.put(`/api/users/${user.id}`, {
          isAppActivated: false,
        });

        if (status >= 200 && status < 300) {
          chalk.yellow("Updated successfully");
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
