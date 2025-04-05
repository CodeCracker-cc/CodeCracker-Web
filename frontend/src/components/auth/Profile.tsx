import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Typography, CircularProgress, Paper, Avatar } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { User } from '../../types';
import { AppDispatch, RootState } from '../../store';
import { authApi } from '../../api/client';
import { setUser, getProfile } from '../../store/slices/authSlice';

const Profile = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Partial<User>>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading: profileLoading } = useSelector((state: RootState) => state.auth);

  // Lade das Benutzerprofil, wenn die Komponente gemountet wird
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  // Setze die Formularwerte, wenn der Benutzer geladen wird
  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        bio: user.bio || ''
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: Partial<User>) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await authApi.updateProfile(data);
      
      if (response.data.data) {
        // Aktualisiere den Redux-Store mit dem aktualisierten Benutzer
        dispatch(setUser(response.data.data.user));
        setSuccess('Profil erfolgreich aktualisiert');
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ein unerwarteter Fehler ist aufgetreten');
      }
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Avatar 
          sx={{ width: 100, height: 100, mb: 2 }} 
          src={user.profileImage || undefined}
        >
          {user.username?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h5" component="h1">
          {user.username}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Mitglied seit {new Date(user.createdAt).toLocaleDateString()}
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {success && (
          <Typography color="success.main" sx={{ mb: 2 }}>
            {success}
          </Typography>
        )}
        
        <TextField
          {...register('username', { 
            required: 'Benutzername ist erforderlich',
            minLength: {
              value: 3,
              message: 'Benutzername muss mindestens 3 Zeichen lang sein'
            }
          })}
          margin="normal"
          fullWidth
          label="Benutzername"
          error={!!errors.username}
          helperText={errors.username?.message}
        />
        
        <TextField
          {...register('email', { 
            required: 'Email ist erforderlich',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Ungültige Email-Adresse'
            }
          })}
          margin="normal"
          fullWidth
          label="Email Adresse"
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        
        <TextField
          {...register('bio')}
          margin="normal"
          fullWidth
          label="Über mich"
          multiline
          rows={4}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Profil aktualisieren'}
        </Button>
      </Box>
    </Paper>
  );
};

export default Profile;
