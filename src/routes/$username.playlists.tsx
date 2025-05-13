import { createFileRoute } from '@tanstack/react-router'
import { fetchUserPlaylists } from '../apis/playlistFn'
import Playlists from '../Components/User/Playlists'

export const Route = createFileRoute('/$username/playlists')({
   
  component: Playlists,
})
