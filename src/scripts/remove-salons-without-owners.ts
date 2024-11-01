// TODO: refactor

// const { tokens, url } = require("../consts.js");
// const qs = require("qs");
// const { log } = require("../utils/log.js");
// const fs = require("fs");
// const { Parser } = require("json2csv");

// /**
//  * @param {"LOCAL"|"STAGING"|"PROD"} env
//  */
// const init = async (env) => {
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: "Bearer " + tokens[env],
//   };
//   const getSalons = async (start, limit) => {
//     const query = qs.stringify(
//       {
//         filters: {
//           owner: {
//             username: {
//               $null: true,
//             },
//           },
//         },
//         populate: {
//           owner: true,
//         },
//         pagination: {
//           start,
//           limit,
//         },
//       },
//       {
//         encodeValuesOnly: true,
//       }
//     );

//     const res = await fetch(`${url[env]}/api/salons?${query}`, { headers });
//     return await res.json();
//   };

//   let allSalons = [];
//   let start = 0;
//   const limit = 100;

//   while (true) {
//     const response = await getSalons(start, limit);
//     const salons = response.data;
//     const { total } = response.meta.pagination;

//     allSalons = allSalons.concat(salons);

//     if (allSalons.length >= total) {
//       break;
//     }

//     start += limit;
//   }

//   // log(allSalons);

//   const salons = allSalons.map((it) => ({
//     id: it.id,
//     name: it.attributes.name ?? "null",
//     createdAt: it.attributes.createdAt,
//   }));

//   const fields = ["id", "name", "createdAt"];
//   const json2csvParser = new Parser({ fields });
//   const csv = json2csvParser.parse(salons);
//   fs.writeFileSync("salons.csv", csv);

//   console.log(salons);
//   // try {
//   //   for (const salon of allSalons.slice(0, 1)) {
//   //     const res = await fetch(`${url[env]}/api/salons/${salon.id}`, {
//   //       ...headers,
//   //       method: "DELETE",
//   //     });
//   //     console.log(`${res.status} - ${res.statusText}`);
//   //     const json = await res.json();
//   //     console.log(json);
//   //   }
//   // } catch (e) {
//   //   console.error(e);
//   // }
// };

// init("PROD");
