import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import ViewVideo from '../../Pages/ViewVideo'

export const Route = createFileRoute("/watch/$videoId")({
  component: RouteComponent
})

function RouteComponent() {
  return <ViewVideo />
}
