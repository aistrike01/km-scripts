// TODO: refactor

// const { populate } = require("dotenv");
// const { tokens, url } = require("../../consts.js");
// const qs = require("qs");
// const fs = require("fs");
// const { log } = require("../../utils/log.js");

// /**
//  * @param {"LOCAL"|"STAGING"|"PROD"} env
//  */
// const init = async (env) => {
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: "Bearer " + tokens[env],
//   };

//   const getUsers = async () => {
//     const query = qs.stringify(
//       {
//         filters: {
//           role: { type: { $eq: "salon" } },
//           isAppActivated: true,
//           salon: { id: { $null: true } },
//         },
//         populate: {
//           role: true,
//           salon: true,
//         },
//       },
//       {
//         encodeValuesOnly: true,
//       }
//     );

//     const res = await fetch(`${url[env]}/api/users?${query}`, { headers });
//     return await res.json();
//   };

//   const users = await getUsers();

//   log(users);

//   const run = async () => {
//     try {
//       for (const user of users) {
//         const res = await fetch(`${url[env]}/api/users/${user.id}`, {
//           headers: {
//             ...headers,
//           },
//           body: JSON.stringify({
//             isAppActivated: false,
//           }),
//           method: "PUT",
//         });
//         const json = await res.json();
//         console.log({
//           status: res.status,
//           statusText: res.statusText,
//           email: json.email,
//           isAppActivated: json.isAppActivated,
//         });
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   await run();
// };

// init("LOCAL");
