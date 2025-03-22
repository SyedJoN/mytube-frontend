import React, {useContext} from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { OpenContext } from './__root';
import Home from '../Pages/Home';


export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const context = useContext(OpenContext);
  if (!context) {
    throw new Error("OpenContext must be used within OpenContext.Provider");
  }
  const { open, setOpen } = context;

  return (
    <Home open={open}/>
  )
}