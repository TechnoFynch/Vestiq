import { createSlice } from "@reduxjs/toolkit";
import type { Notification } from "@/types/Notification";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    notifications: [] as Notification[],
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.push(action.payload as Notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload.id,
      );
    },
  },
});

export const { addNotification, removeNotification } = uiSlice.actions;

export default uiSlice.reducer;
