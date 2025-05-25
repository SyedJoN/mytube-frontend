
import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export const ProgressBar = () => {
  const routerState = useRouterState()
  
NProgress.configure({
  minimum: 0.08,
  easing: 'ease',
  speed: 500,
  trickle: true,
  trickleSpeed: 300,
  showSpinner: false,
})
  useEffect(() => {
    if (routerState.status === 'pending') {
      NProgress.start()
    } else {
      NProgress.done()
    }
  }, [routerState.status])

  return null
}