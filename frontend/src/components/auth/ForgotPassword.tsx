import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { authApi } from '../../api/client';

interface ForgotPasswordProps {
  onSuccess?: () => void;
}

const ForgotPassword = ({ onSuccess }: ForgotPasswordProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: { email: string }) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await authApi.forgotPassword(data);
      
      if (response.data.status === 'success') {
        setSuccess('Eine E-Mail mit Anweisungen zum Zurücksetzen deines Passworts wurde gesendet.');
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
        Gib deine E-Mail-Adresse ein, und wir senden dir einen Link zum Zurücksetzen deines Passworts.
      </Typography>
      
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

export default ForgotPassword;
