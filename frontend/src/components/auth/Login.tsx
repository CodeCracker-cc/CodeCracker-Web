import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { LoginCredentials } from '../../store/types';
import { AppDispatch } from '../../store';

interface LoginProps {
  onSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = async (data: LoginCredentials) => {
    try {
      await dispatch(login(data)).unwrap();
      onSuccess?.();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ein unerwarteter Fehler ist aufgetreten');
      }
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
        {...register('email', { required: 'Email ist erforderlich' })}
        margin="normal"
        fullWidth
        label="Email Adresse"
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      
      <TextField
        {...register('password', { required: 'Passwort ist erforderlich' })}
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
      >
        Einloggen
      </Button>
    </Box>
  );
};

export default Login; 