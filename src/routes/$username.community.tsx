import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$username/community')({
  component: RouteComponent,
})

function RouteComponent() {
  console.log("community");
  return <div>Hello "/watch/$username/community"!</div>

}
