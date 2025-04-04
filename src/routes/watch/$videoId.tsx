import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import ViewVideo from '../../Pages/ViewVideo'
import { useParams } from '@tanstack/react-router'

export const Route = createFileRoute("/watch/$videoId")({
  component: RouteComponent
})

function RouteComponent() {
 const { videoId } = useParams({ strict: false }); 

  return <ViewVideo videoId={videoId} />
}
