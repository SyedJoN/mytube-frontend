import { createFileRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { getUserChannelProfile } from "../apis/userFn";
import ChannelProfile from "../Components/User/ChannelProfile";
import React from "react";

export const Route = createFileRoute("/$username")({
  loader: async ({ params }) => {
    return {
      userData: await getUserChannelProfile(params.username.slice(1)),
    };
  },
  component: AppLayoutComponent,
});

function AppLayoutComponent() {

  const { userData } = Route.useLoaderData();
  const { username } = useParams({ strict: false });
  const cleanUsername = username.startsWith("@") ? username.slice(1) : username;

  return (
    <>
      <ChannelProfile username={cleanUsername} userData={userData} />
    </>
  );
}
