import { createFileRoute } from '@tanstack/react-router'
import UserVideos from '../Components/User/UserVideos'


export const Route = createFileRoute('/$username/videos')({
  component: UserVideos,
})

