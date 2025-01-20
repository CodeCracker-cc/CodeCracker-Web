import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Alert } from '@mui/material';

interface LoginProps {
  onSuccess: (token: string) => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Login fehlgeschlagen');
      }

      onSuccess(result.data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert severity="error">{error}</Alert>}
      
      <TextField
        {...register('email', { 
          required: 'Email ist erforderlich',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Ungültige Email Adresse'
          }
        })}
        label="Email"
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <TextField
        {...register('password', { 
          required: 'Passwort ist erforderlich',
          minLength: {
            value: 8,
            message: 'Passwort muss mindestens 8 Zeichen lang sein'
          }
        })}
        label="Passwort"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.password}
        helperText={errors.password?.message}
      />

      <Button 
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
      >
        {loading ? 'Lädt...' : 'Einloggen'}
      </Button>
    </form>
  );
};

export default Login; 