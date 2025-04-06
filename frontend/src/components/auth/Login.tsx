import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { LoginCredentials } from '../../types';
import { AppDispatch, RootState } from '../../store';
import SocialLogin from './SocialLogin';

interface LoginProps {
  onSuccess?: () => void;
}

const Login = ({ onSuccess }: LoginProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error: authError } = useSelector((state: RootState) => state.auth);

  // Wenn ein Fehler aus dem Redux-Store kommt, diesen anzeigen
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const onSubmit = async (data: LoginCredentials) => {
    setError(null);
    try {
      await dispatch(login(data)).unwrap();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ein unerwarteter Fehler ist aufgetreten');
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
        Anmelden
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
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
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Einloggen'}
        </Button>
        
        <SocialLogin onSuccess={onSuccess} />
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            <a href="/forgot-password" style={{ textDecoration: 'none', color: 'primary.main' }}>
              Passwort vergessen?
            </a>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Noch kein Konto?{' '}
            <a href="/register" style={{ textDecoration: 'none', color: 'primary.main' }}>
              Registrieren
            </a>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;