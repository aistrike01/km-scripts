import { AxiosError, AxiosInstance } from "axios";

export const usersWithDuplicateEmail = async (api: AxiosInstance) => {
  try {
    const { data: users } = await api.get<
      { id: Number; email: string; createdAt: string }[]
    >(`/api/users`);

    const emailCount = users.reduce<Record<string, number>>((acc, user) => {
      acc[user.email] = (acc[user.email] || 0) + 1;
      return acc;
    }, {});

    return users
      .filter((user) => emailCount[user.email] > 1)
      .map((it) => ({ id: it.id, email: it.email, createdAt: it.createdAt }));
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`${error.status} - ${error.message}`);
      return;
    }

    console.error(error);
  }
};
