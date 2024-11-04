import { AxiosError, AxiosInstance } from "axios";
import qs from "qs";
import chalk from "chalk";
import { ModeType } from "../types";

type UserType = { id: number; email: string; createdAt: string };

export const salonsOwnersWithoutSalon = async (
  api: AxiosInstance,
  mode: ModeType
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

    const { data: users } = await api.get<UserType[]>(`/api/users?${query}`);

    if (mode === "update") {
      for (const user of users) {
        const { status } = await api.put(`/api/users/${user.id}`, {
          isAppActivated: false,
        });

        if (status >= 200 && status < 300) {
          console.log(chalk.yellow(`${user.id} - Updated successfully`));
        }
      }
    }

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    }));
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`${error.status} - ${error.message}`);
      return;
    }

    console.error(error);
  }
};
