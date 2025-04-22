import { createFileRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import ChannelProfile from "../Components/User/ChannelProfile";

export const Route = createFileRoute("/$username")({
  component: RouteComponent,
});

function RouteComponent() {
  const { username } = useParams({ strict: false });
  const cleanUsername = username.startsWith("@") ? username.slice(1) : username;
  return <ChannelProfile username={cleanUsername} />;
}
