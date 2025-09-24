import { use } from "react";
import ClientProfilePage from "../[username]/ClientProfilePage";
import { ROUTE_CONFIG } from "../../config/routes";

export default function MePage() {
  console.log(
    "Fetching profile for /me route (username:",
    ROUTE_CONFIG.ME_ROUTE_USERNAME,
    ")",
    `${process.env.NEXT_PUBLIC_API_BASE_URL}users/${ROUTE_CONFIG.ME_ROUTE_USERNAME}`
  );

  const res = use(
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}users/${ROUTE_CONFIG.ME_ROUTE_USERNAME}`,
      {
        cache: "no-store",
      }
    )
  );

  console.log("Fetch response status:", res.status);

  if (!res.ok) {
    return <div>Profile not found.</div>;
  }

  const profileData = use(res.json());
  return <ClientProfilePage profileData={profileData} />;
}
