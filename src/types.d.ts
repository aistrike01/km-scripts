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
    users: { data: { id: number; attributes: UserType }[] };
    owner: { data: { id: number; attributes: UserType } };
  };
};

export type StylistType = {
  id: number;
  attributes: {
    email: string;
    createdAt: string;
    salon: { data: { id: number; attributes: SalonType } };
  };
};

export type UsersResponseType = {
  data: UserType[];
  meta: MetaType;
};

export type SalonsResponseType = {
  data: SalonType[];
  meta: MetaType;
};

export type StylistsResponseType = {
  data: StylistType[];
  meta: MetaType;
};
