import { AxiosError, AxiosInstance } from "axios";
import qs from "qs";
import chalk from "chalk";

import { log } from "../utils/log";
import { ModeType } from "../types";

type SalonType = {
  id: number;
  attributes: {
    name: string;
    createdAt: string;
  };
};

type ResponseType = {
  data: SalonType[];
  meta: {
    pagination: { start: number; limit: number; total: number };
  };
};

export const salonsWithoutOwners = async (
  api: AxiosInstance,
  mode: ModeType
) => {
  try {
    const getSalons = async (start: number, limit: number) => {
      const query = qs.stringify(
        {
          filters: {
            owner: {
              username: {
                $null: true,
              },
            },
          },
          populate: {
            owner: true,
          },
          pagination: {
            start,
            limit,
          },
        },
        {
          encodeValuesOnly: true,
        }
      );

      const { data } = await api.get<ResponseType>(`/api/salons?${query}`);
      return data;
    };

    let allSalons: SalonType[] = [];
    let start = 0;
    const limit = 100;

    while (true) {
      const response = await getSalons(start, limit);
      const salons = response.data;

      const { total } = response.meta.pagination;

      allSalons = allSalons.concat(salons);

      if (allSalons.length >= total) {
        break;
      }

      start += limit;
    }

    const salons = allSalons.map((it) => ({
      id: it.id,
      name: it.attributes.name ?? "null",
      createdAt: it.attributes.createdAt,
    }));

    if (mode === "update") {
      for (const salon of allSalons) {
        const { status } = await api.delete(`/api/salons/${salon.id}`);

        if (status >= 200 && status < 300) {
          console.log(chalk.redBright(`${salon.id} - Updated successfully`));
        }
      }
    }

    return salons;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`${error.status} - ${error.message}`);
      return;
    }

    console.error(error);
  }
};
