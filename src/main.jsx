import React from 'react'
import Home from './Components/Home.jsx'
import store from './store/store.js'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

import { Provider } from 'react-redux'
import { RouterProvider, createBrowserRouter, useParams } from 'react-router-dom'



const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />
      },
     
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>


)
