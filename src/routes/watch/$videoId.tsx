import { createFileRoute, useSearch } from "@tanstack/react-router";
import React from "react";
import ViewVideo from "../../Pages/ViewVideo";

export const Route = createFileRoute("/watch/$videoId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { videoId } = Route.useParams();
  const search = Route.useSearch();

  return <ViewVideo videoId={videoId} playlistId={search?.list} />;
}
