// TODO: refactor

// import qs from "qs";
// import { log } from "../../utils/log.js";

// /**
//  * @param {"LOCAL"|"STAGING"|"PROD"} env
//  */
// const init = async (baseUrl) => {
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: "Bearer " + tokens[env],
//   };

//   const getSalons = async (start, limit) => {
//     const query = qs.stringify(
//       {
//         filters: {
//           isActive: false,
//           owner: {
//             isAppActivated: true,
//           },
//         },
//         populate: ["owner"],
//         pagination: {
//           start,
//           limit,
//         },
//       },
//       {
//         encodeValuesOnly: true,
//       }
//     );

//     const res = await fetch(`${baseUrl}/api/salons?${query}`, { headers });
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

//   log(allSalons);

//   try {
//     for (const salon of allSalons) {
//       const res = await fetch(`${url[env]}/api/salons/${salon.id}`, {
//         headers: {
//           ...headers,
//         },
//         body: JSON.stringify({
//           data: {
//             isActive: true,
//           },
//         }),
//         method: "PUT",
//       });
//       console.log(`${res.status} - ${res.statusText}`);
//       const json = await res.json();
//       console.log(json);
//     }
//   } catch (e) {
//     console.error(e);
//   }
// };

// init("LOCAL");
