// import React from "react";

// import ClientProfilePage from "./ClientProfilePage";

// export default async function Page({
//   params,
// }: {
//   params: { username: string };
// }) {
//   const username = params.username;
//   console.log(
//     "Fetching profile for username:",
//     `${process.env.NEXT_PUBLIC_API_BASE_URL}users/${username}`
//   );
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_BASE_URL}users/${username}`,
//     {
//       cache: "no-store",
//     }
//   );
//   console.log("Fetch response status:", res.status);
//   console.log("Fetch response ok:", res);
//   if (!res.ok) {
//     // You can customize this error UI as needed
//     return <div>Profile not found.</div>;
//   }
//   const profileData = await res.json();
//   return <ClientProfilePage profileData={profileData} />;
// }

import { use } from "react";
import ClientProfilePage from "./ClientProfilePage";

export default function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  console.log(
    "Fetching profile for username:",
    `${process.env.NEXT_PUBLIC_API_BASE_URL}users/${username}`
  );
  const res = use(
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}users/${username}`, {
      cache: "no-store",
    })
  );
  console.log("Fetch response status:", res.status);
  if (!res.ok) {
    return <div>Profile not found.</div>;
  }
  const profileData = use(res.json());
  return <ClientProfilePage profileData={profileData} />;
}
