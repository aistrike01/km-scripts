import { AxiosError, AxiosInstance } from "axios";
import chalk from "chalk";
import qs from "qs";

import type { ModeType, StylistsResponseType, StylistType } from "../types";

export const stylistsWithoutSalon = async (
  api: AxiosInstance,
  mode: ModeType
) => {
  try {
    const getStylists = async (start: number, limit: number) => {
      const query = qs.stringify(
        {
          filters: {
            salon: {
              name: { $null: true },
            },
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

      const { data } = await api.get<StylistsResponseType>(
        `/api/stylists?${query}`
      );
      return data;
    };

    let allStylists: StylistType[] = [];
    let start = 0;
    const limit = 100;

    while (true) {
      const response = await getStylists(start, limit);
      const stylists = response.data;

      const { total } = response.meta.pagination;

      allStylists = allStylists.concat(stylists);

      if (allStylists.length >= total) {
        break;
      }

      start += limit;
    }

    const stylists = allStylists.map((it) => ({
      id: it.id,
      email: it.attributes.email,
      createdAt: it.attributes.createdAt,
    }));

    if (mode === "update") {
      for (const stylist of allStylists) {
        const { status } = await api.delete(`/api/stylists/${stylist.id}`);

        if (status >= 200 && status < 300) {
          console.log(
            chalk.redBright(`${stylist.id} - Stylist was deleted successfully`)
          );
        }
      }
    }

    return stylists;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`${error.status} - ${error.message}`);
      return;
    }

    console.error(error);
  }
};
