import { configureStore } from "@reduxjs/toolkit";

import usersReducer from "./slices/usersSlice";
import commentsReducer from "./slices/commentsSlice";
import docsReducer from "./slices/docSlice";

const store = configureStore({
  reducer: {
    users: usersReducer,
    comments: commentsReducer,
    docs: docsReducer,
  },
});

export default store;
