// routes/watch.tsx
import { createFileRoute, useSearch } from "@tanstack/react-router";
import React from "react";
import ViewVideo from "../Pages/ViewVideo";

export const Route = createFileRoute("/watch")({
  component: RouteComponent,
  validateSearch: (search) => ({
    v: search.v as string,
    list: search.list as string | undefined,
  }),
});

function RouteComponent() {
  const { v: videoId, list: playlistId } = Route.useSearch();

  return <ViewVideo videoId={videoId} playlistId={playlistId} />;
}
