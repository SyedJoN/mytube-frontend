import { configureStore } from '@reduxjs/toolkit'
import videoSlice from "./videoSlice"


const store = configureStore({
    reducer: {
        // auth: authSlice,
        // search: searchSlice,
         video: videoSlice
    }
}
  
)

export default store