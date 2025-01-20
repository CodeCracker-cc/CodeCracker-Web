import React from 'react';
import { useSelector } from 'react-redux';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { RootState } from '../../store';
import StatsCard from './StatsCard';
import RecentChallenges from './RecentChallenges';
import LeaderboardWidget from './LeaderboardWidget';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Willkommen zurück, {user?.username}!
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <StatsCard stats={user?.stats} />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <RecentChallenges />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <LeaderboardWidget />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 