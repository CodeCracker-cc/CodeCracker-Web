import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { useDispatch } from 'react-redux';
import { RegisterData } from '../../types';
import { AppDispatch } from '../../store';
import { authApi } from '../../api/client';
import { setUser } from '../../store/slices/authSlice';

interface RegisterProps {
  onSuccess?: () => void;
}

const Register = ({ onSuccess }: RegisterProps) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterData & { confirmPassword: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const password = watch('password', '');

  const onSubmit = async (data: RegisterData & { confirmPassword: string }) => {
    setError(null);
    setLoading(true);

    try {
      // Entferne confirmPassword aus den Daten, die an den Server gesendet werden
      const { confirmPassword, ...registerData } = data;
      
      const response = await authApi.register(registerData);
      
      if (response.data.data) {
        // Speichere Token im localStorage
        localStorage.setItem('token', response.data.data.token);
        
        // Aktualisiere den Redux-Store mit dem Benutzer
        dispatch(setUser(response.data.data.user));
        
        if (onSuccess) {
          onSuccess();
        }
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

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
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
        {...register('password', { 
          required: 'Passwort ist erforderlich',
          minLength: {
            value: 6,
            message: 'Passwort muss mindestens 6 Zeichen lang sein'
          }
        })}
        margin="normal"
        fullWidth
        label="Passwort"
        type="password"
        error={!!errors.password}
        helperText={errors.password?.message}
      />
      
      <TextField
        {...register('confirmPassword', { 
          required: 'Bitte bestätige dein Passwort',
          validate: (value: string) => value === password || 'Die Passwörter stimmen nicht überein'
        })}
        margin="normal"
        fullWidth
        label="Passwort bestätigen"
        type="password"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Registrieren'}
      </Button>
    </Box>
  );
};

export default Register;
