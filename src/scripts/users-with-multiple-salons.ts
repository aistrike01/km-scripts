import { AxiosError, AxiosInstance } from "axios";
import qs from "qs";
import { SalonsResponseType, SalonType } from "../types";

export const usersWithMultipleSalons = async (api: AxiosInstance) => {
  try {
    const getSalons = async (start: number, limit: number) => {
      const query = qs.stringify(
        {
          filters: {
            owner: { email: { $notNull: true } },
            users: { id: { $null: true } },
          },
          populate: {
            owner: true,
            users: true,
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
      const users = response.data;

      const { total } = response.meta.pagination;

      allSalons = allSalons.concat(users);

      if (allSalons.length >= total) {
        break;
      }

      start += limit;
    }

    const ownerCount = allSalons.reduce<Record<string, number>>(
      (acc, salon) => {
        acc[salon.attributes.owner.data.id] =
          (acc[salon.attributes.owner.data.id] || 0) + 1;

        return acc;
      },
      {}
    );

    return allSalons
      .filter((salon) => ownerCount[salon.attributes.owner.data.id] > 1)
      .map((salon) => ({
        salonId: salon.id,
        salonName: salon.attributes.name,
        salonCreatedAt: salon.attributes.createdAt,
        salonUsersEmail:
          salon?.attributes?.users?.data?.[0]?.attributes?.email ?? null,
        ownerId: salon.attributes.owner.data.id,
        ownerEmail: salon.attributes.owner.data.attributes.email,
        ownerCreatedAt: salon.attributes.owner.data.attributes.createdAt,
      }))
      ?.sort((a, b) => a.ownerEmail.localeCompare(b.ownerEmail));
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`${error.status} - ${error.message}`);
      return;
    }

    console.error(error);
  }
};
