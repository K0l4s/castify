import { createSlice } from '@reduxjs/toolkit';

interface sideBarState {
    isOpen: boolean;
}

const initialState: sideBarState = {
    isOpen: false
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
        state.isOpen = !state.isOpen;
    },
    openSidebar: (state) => {
        state.isOpen = true;
    },
    closeSidebar: (state) => {
        state.isOpen = false;
    }
  },
});

export const { toggleSidebar, openSidebar, closeSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;