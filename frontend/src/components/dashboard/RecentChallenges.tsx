import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Chip, 
  Box 
} from '@mui/material';
import { fetchChallenges } from '../../store/slices/challengeSlice';
import { RootState, AppDispatch } from '../../store';
import { ChallengeFilters } from '../../store/types';

const RecentChallenges: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { challenges, loading } = useSelector((state: RootState) => state.challenges);

  useEffect(() => {
    const filters: ChallengeFilters = {
      limit: 5,
      sort: '-createdAt'
    };
    dispatch(fetchChallenges(filters));
  }, [dispatch]);

  if (loading) return <Typography>Lädt...</Typography>;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Neueste Challenges
      </Typography>
      <List>
        {challenges.map(challenge => (
          <ListItem 
            key={challenge.id}
            component={Link}
            to={`/challenges/${challenge.id}`}
            sx={{ 
              textDecoration: 'none',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ListItemText
              primary={challenge.title}
              secondary={challenge.description.substring(0, 100) + '...'}
            />
            <Chip 
              label={challenge.difficulty}
              color={
                challenge.difficulty === 'beginner' ? 'success' :
                challenge.difficulty === 'intermediate' ? 'warning' :
                'error'
              }
              size="small"
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default RecentChallenges; 