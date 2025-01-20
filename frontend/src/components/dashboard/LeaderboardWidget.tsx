import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar 
} from '@mui/material';
import api from '../../api/client';

interface LeaderboardUser {
  id: string;
  username: string;
  points: number;
  rank: number;
  avatar?: string;
}

const LeaderboardWidget: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/users/leaderboard?limit=5');
        setUsers(response.data.data.users);
      } catch (error) {
        console.error('Fehler beim Laden des Leaderboards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <Typography>Lädt...</Typography>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Coder
        </Typography>
        <List>
          {users.map((user) => (
            <ListItem key={user.id}>
              <ListItemAvatar>
                <Avatar src={user.avatar}>
                  {user.username[0].toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={user.username}
                secondary={`${user.points} Punkte`}
              />
              <Typography variant="body2" color="textSecondary">
                #{user.rank}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default LeaderboardWidget; 