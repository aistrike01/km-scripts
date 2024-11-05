export type ModeType = "read" | "update";

type MetaType = {
  pagination: { start: number; limit: number; total: number };
};

export type UserType = {
  id: number;
  email: string;
  createdAt: string;
};

export type SalonType = {
  id: number;
  attributes: {
    name: string;
    createdAt: string;
    owner: { data: { id: number; attributes: UserType } };
  };
};

export type SalonsResponseType = {
  data: SalonType[];
  meta: MetaType;
};

export type UsersResponseType = {
  data: UserType[];
  meta: MetaType;
};
