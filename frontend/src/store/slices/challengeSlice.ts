import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';
import { Challenge, Submission } from '../../types';

interface ChallengeState {
  challenges: Challenge[];
  currentChallenge: Challenge | null;
  submissions: Submission[];
  loading: boolean;
  error: string | null;
}

const initialState: ChallengeState = {
  challenges: [],
  currentChallenge: null,
  submissions: [],
  loading: false,
  error: null
};

export const fetchChallenges = createAsyncThunk(
  'challenges/fetchAll',
  async (filters?: { category?: string; difficulty?: string }) => {
    const response = await api.get('/challenges', { params: filters });
    return response.data.data.challenges;
  }
);

export const submitSolution = createAsyncThunk(
  'challenges/submit',
  async ({ challengeId, code, language }: { 
    challengeId: string; 
    code: string; 
    language: string 
  }) => {
    const response = await api.post(`/challenges/${challengeId}/submit`, {
      code,
      language
    });
    return response.data.data;
  }
);

const challengeSlice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {
    setCurrentChallenge: (state, action) => {
      state.currentChallenge = action.payload;
    },
    clearSubmissions: (state) => {
      state.submissions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChallenges.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.loading = false;
        state.challenges = action.payload;
      })
      .addCase(fetchChallenges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Fehler beim Laden der Challenges';
      })
      .addCase(submitSolution.fulfilled, (state, action) => {
        state.submissions.unshift(action.payload);
      });
  }
});

export const { setCurrentChallenge, clearSubmissions } = challengeSlice.actions;
export default challengeSlice.reducer; 