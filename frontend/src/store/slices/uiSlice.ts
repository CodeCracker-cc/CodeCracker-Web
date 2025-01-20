import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface UIState {
  darkMode: boolean;
  sidebarOpen: boolean;
  toasts: ToastMessage[];
  loading: {
    [key: string]: boolean;
  };
}

const initialState: UIState = {
  darkMode: localStorage.getItem('darkMode') === 'true',
  sidebarOpen: true,
  toasts: [],
  loading: {}
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', String(state.darkMode));
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    addToast: (state, action: PayloadAction<Omit<ToastMessage, 'id'>>) => {
      const id = Date.now().toString();
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading;
    }
  }
});

export const { 
  toggleDarkMode, 
  toggleSidebar, 
  addToast, 
  removeToast,
  setLoading 
} = uiSlice.actions;

export default uiSlice.reducer; 