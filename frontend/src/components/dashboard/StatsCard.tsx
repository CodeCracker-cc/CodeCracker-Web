import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { UserStats } from '../../types';

interface StatsCardProps {
  stats?: UserStats;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Deine Statistiken
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Gelöste Challenges
              </Typography>
              <Typography variant="h6">
                {stats.solvedChallenges}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Gesamtpunkte
              </Typography>
              <Typography variant="h6">
                {stats.totalPoints}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Streak
              </Typography>
              <Typography variant="h6">
                {stats.streak} Tage
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Rang
              </Typography>
              <Typography variant="h6">
                #{stats.rank}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StatsCard; 