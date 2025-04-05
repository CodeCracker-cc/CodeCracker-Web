import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginCredentials } from '../../types';
import { authApi } from '../../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token')
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    const data = response.data;
    
    if (data.data && data.data.token) {
      localStorage.setItem('token', data.data.token);
    }
    
    return data;
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getProfile();
      return response.data.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Fehler beim Laden des Profils');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state: AuthState) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    setUser: (state: AuthState, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder: any) => {
    builder
      // Login
      .addCase(login.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state: AuthState, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload.data) {
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(login.rejected, (state: AuthState, action: any) => {
        state.loading = false;
        state.error = action.error.message || 'Ein Fehler ist aufgetreten';
      })
      
      // Get Profile
      .addCase(getProfile.pending, (state: AuthState) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state: AuthState, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state: AuthState, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload === 'Unauthorized') {
          state.isAuthenticated = false;
          state.token = null;
          localStorage.removeItem('token');
        }
      });
  }
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;