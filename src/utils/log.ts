import util from "util";

export const log = (obj: any) =>
  console.log(util.inspect(obj, false, null, true));
