import { AxiosError, AxiosInstance } from "axios";
import qs from "qs";
import { SalonsResponseType, SalonType } from "../types";

export const salonsWithDuplicateName = async (api: AxiosInstance) => {
  try {
    const getSalons = async (start: number, limit: number) => {
      const query = qs.stringify(
        {
          filters: {
            name: { $notNull: true },
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

      const { data } = await api.get<SalonsResponseType>(
        `/api/salons?${query}`
      );
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

    const nameCount = allSalons.reduce<Record<string, number>>((acc, salon) => {
      const name = salon.attributes.name.split(" ").join("").toLowerCase();
      acc[name] = (acc[name] || 0) + 1;

      return acc;
    }, {});

    console.log(nameCount);

    return allSalons
      .filter(
        (salon) =>
          nameCount[salon.attributes.name.split(" ").join("").toLowerCase()] > 1
      )
      .map((salon) => ({
        id: salon.id,
        name: salon.attributes.name,
        createdAt: salon.attributes.createdAt,
      }))
      ?.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`${error.status} - ${error.message}`);
      return;
    }

    console.error(error);
  }
};
