import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Paper, Avatar, CircularProgress, Button } from '@mui/material';
import { RootState, AppDispatch } from '../../store';
import { getProfile } from '../../store/slices/authSlice';
import { challengeApi } from '../../api/client';
import TaskItem from './TaskItem';

// Definiere die Typen für die Dashboard-Daten
interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  unlockedAt: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  type: 'daily' | 'weekly' | 'achievement' | 'challenge';
  progress: {
    current: number;
    target: number;
  };
  reward: {
    crackers: number;
    experience: number;
  };
  completed: boolean;
  expiresAt?: string;
}

const DashboardContent = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  // Dashboard-Daten
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [crackers, setCrackers] = useState<number>(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else if (!loading) {
      // Wenn kein Benutzer eingeloggt ist und nicht gerade geladen wird, Profil abrufen
      dispatch(getProfile());
    }
  }, [user, loading, dispatch]);

  // Lade alle Dashboard-Daten
  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      // Verwende den Dashboard-Endpunkt, um alle Daten in einem Aufruf zu laden
      const dashboardResponse = await challengeApi.getDashboardData();
      
      if (dashboardResponse.data.status === 'success') {
        const dashboardData = dashboardResponse.data.data;
        
        // Daten aus der API-Antwort extrahieren
        setAchievements(dashboardData.achievements || []);
        setStreak(dashboardData.streak?.current || 0);
        setCrackers(dashboardData.crackers || 0);
        setTasks(dashboardData.tasks || []);
      } else {
        // Fallback auf einzelne API-Aufrufe, falls der Dashboard-Endpunkt fehlschlägt
        const achievementsResponse = await challengeApi.getUserAchievements();
        const streakResponse = await challengeApi.getUserStreak();
        const crackersResponse = await challengeApi.getUserCrackers();
        const tasksResponse = await challengeApi.getUserOpenTasks();

        // Daten aus den API-Antworten extrahieren
        if (achievementsResponse.data.status === 'success') {
          setAchievements(achievementsResponse.data.data.achievements || []);
        }
        
        if (streakResponse.data.status === 'success') {
          setStreak(streakResponse.data.data.streak?.current || 0);
        } else {
          // Fallback auf User-Daten
          setStreak(user?.stats?.streak || 0);
        }
        
        if (crackersResponse.data.status === 'success') {
          setCrackers(crackersResponse.data.data.crackers || 0);
        } else {
          // Fallback auf User-Daten
          setCrackers(user?.crackers || 0);
        }
        
        if (tasksResponse.data.status === 'success') {
          setTasks(tasksResponse.data.data.tasks || []);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Dashboard-Daten:', error);
      // Fallback auf User-Daten im Fehlerfall
      setStreak(user?.stats?.streak || 0);
      setCrackers(user?.crackers || 0);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '100vh' }}>
      {/* Seitenleiste */}
      <Box
        sx={{
          width: { xs: '100%', md: 300 },
          bgcolor: 'background.paper',
          borderRight: { md: 1 },
          borderBottom: { xs: 1, md: 0 },
          borderColor: 'divider',
          p: 3,
        }}
      >
        {/* Benutzerprofil */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={user.avatar || user.socialLogins?.google?.picture || user.socialLogins?.github?.avatar}
            alt={user.username}
            sx={{ width: 80, height: 80, mb: 2 }}
          />
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            {user.username}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {user.email}
          </Typography>
        </Box>

        {/* Statistiken */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Deine Statistiken
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Crackers:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {crackers}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Streak:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {streak} Tage 🔥
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Achievements:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {achievements.length}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Schnellzugriff */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Schnellzugriff
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            sx={{ mb: 1 }}
            onClick={() => window.location.href = '/challenges'}
          >
            Challenges
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ mb: 1 }}
            onClick={() => window.location.href = '/community'}
          >
            Community
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => window.location.href = '/profile'}
          >
            Profil bearbeiten
          </Button>
        </Box>
      </Box>

      {/* Hauptbereich */}
      <Box sx={{ flex: 1, p: 3 }}>
        {loadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Offene Aufgaben
              </Typography>
              {tasks && tasks.length > 0 ? (
                <Box>
                  {tasks.map((task, index) => (
                    <div key={index}>
                      <TaskItem 
                        task={task} 
                        onTaskCompleted={() => loadDashboardData()} 
                      />
                    </div>
                  ))}
                </Box>
              ) : (
                <Typography>Du hast keine offenen Aufgaben. Schau dir unsere Empfehlungen an!</Typography>
              )}
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Streak: {streak} Tage 🔥
              </Typography>
              <Typography>
                Halte deinen Streak aufrecht, indem du täglich mindestens eine Aufgabe löst!
              </Typography>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Deine Achievements
              </Typography>
              {achievements && achievements.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {achievements.map((achievement) => (
                    <Paper
                      key={achievement._id}
                      sx={{
                        p: 2,
                        width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 11px)' },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          bgcolor: 'primary.light',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        {achievement.icon || '🏆'}
                      </Box>
                      <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 0.5 }}>
                        {achievement.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: 'center', mb: 1 }}
                      >
                        {achievement.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Freigeschaltet am{' '}
                        {new Date(achievement.unlockedAt).toLocaleDateString('de-DE')}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography>
                  Du hast noch keine Achievements freigeschaltet. Löse Challenges, um Achievements zu erhalten!
                </Typography>
              )}
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
};

const Dashboard = () => {
  return <DashboardContent />;
};

export default Dashboard;
