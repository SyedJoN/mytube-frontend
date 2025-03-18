import { configureStore } from '@reduxjs/toolkit'


const store = configureStore({
    reducer: {
        // auth: authSlice,
        // search: searchSlice,
        // product: productSlice
    }
}
  
)

export default store