import { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { challengeApi } from '../../api/client';

interface TaskItemProps {
  task: {
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
  };
  onTaskCompleted: () => void;
}

const TaskItem = ({ task, onTaskCompleted }: TaskItemProps) => {
  const [loading, setLoading] = useState(false);
  
  const handleCompleteTask = async () => {
    if (task.completed || loading) return;
    
    setLoading(true);
    try {
      const response = await challengeApi.completeTask(task._id);
      if (response.data.status === 'success') {
        onTaskCompleted();
      }
    } catch (error) {
      console.error('Fehler beim Abschließen der Aufgabe:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Berechne den Fortschritt in Prozent
  const progressPercent = (task.progress.current / task.progress.target) * 100;
  
  // Bestimme die Farbe des Chips basierend auf dem Aufgabentyp
  const getChipColor = () => {
    switch (task.type) {
      case 'daily':
        return 'primary';
      case 'weekly':
        return 'secondary';
      case 'achievement':
        return 'success';
      case 'challenge':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Formatiere den Aufgabentyp für die Anzeige
  const getTaskTypeLabel = () => {
    switch (task.type) {
      case 'daily':
        return 'Täglich';
      case 'weekly':
        return 'Wöchentlich';
      case 'achievement':
        return 'Achievement';
      case 'challenge':
        return 'Challenge';
      default:
        return task.type;
    }
  };
  
  // Berechne die verbleibende Zeit bis zum Ablauf
  const getTimeRemaining = () => {
    if (!task.expiresAt) return null;
    
    const expiresAt = new Date(task.expiresAt);
    const now = new Date();
    
    if (expiresAt <= now) return 'Abgelaufen';
    
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} Minuten`;
    }
    
    if (diffHrs < 24) {
      return `${diffHrs} Stunden`;
    }
    
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} Tage`;
  };
  
  const timeRemaining = getTimeRemaining();
  
  return (
    <Paper sx={{ p: 2, mb: 2, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="h6" component="h3">
          {task.title}
        </Typography>
        <Box 
          sx={{ 
            ml: 1, 
            px: 1, 
            py: 0.5, 
            borderRadius: 1, 
            fontSize: '0.75rem',
            bgcolor: `${getChipColor()}.main`,
            color: 'white'
          }}
        >
          {getTaskTypeLabel()}
        </Box>
      </Box>
      
      {task.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {task.description}
        </Typography>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">
            Fortschritt: {task.progress.current}/{task.progress.target}
          </Typography>
          <Typography variant="body2">
            {progressPercent.toFixed(0)}%
          </Typography>
        </Box>
        <Box 
          sx={{ 
            width: '100%', 
            height: '4px', 
            bgcolor: 'grey.300',
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              bgcolor: task.completed ? 'success.main' : 'primary.main',
              transition: 'width 0.3s ease'
            }} 
          />
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" component="span">
            Belohnung: {task.reward.crackers} Crackers
            {task.reward.experience > 0 && `, ${task.reward.experience} XP`}
          </Typography>
          
          {timeRemaining && (
            <Typography variant="caption" display="block" color="text.secondary">
              Verbleibend: {timeRemaining}
            </Typography>
          )}
        </Box>
        
        <Button
          variant="contained"
          color={task.completed ? "success" : "primary"}
          disabled={task.completed || loading || task.progress.current < task.progress.target}
          onClick={handleCompleteTask}
          size="small"
        >
          {task.completed ? "Abgeschlossen" : "Abschließen"}
        </Button>
      </Box>
    </Paper>
  );
};

export default TaskItem;
