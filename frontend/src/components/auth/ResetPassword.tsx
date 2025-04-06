import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { authApi } from '../../api/client';

interface ResetPasswordProps {
  token: string;
  onSuccess?: () => void;
}

const ResetPassword = ({ token, onSuccess }: ResetPasswordProps) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<{
    password: string;
    confirmPassword: string;
  }>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const password = watch('password', '');

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await authApi.resetPassword({
        token,
        password: data.password
      });
      
      if (response.data.status === 'success') {
        setSuccess('Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt einloggen.');
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
      
      {success && (
        <Typography color="success.main" sx={{ mb: 2 }}>
          {success}
        </Typography>
      )}
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        Bitte gib dein neues Passwort ein.
      </Typography>
      
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
        label="Neues Passwort"
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
        {loading ? <CircularProgress size={24} /> : 'Passwort zurücksetzen'}
      </Button>
    </Box>
  );
};

export default ResetPassword;
