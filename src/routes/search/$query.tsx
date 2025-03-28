import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import SearchVideo from '../../Pages/SearchVideo'

export const Route = createFileRoute("/search/$query")({
  component: RouteComponent
})

function RouteComponent() {
  return <SearchVideo/>
}
