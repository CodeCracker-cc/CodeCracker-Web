import { useState } from 'react';
import { Button, Box, Typography, CircularProgress, Divider } from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { authApi } from '../../api/client';
import { setUser, setToken } from '../../store/slices/authSlice';

interface SocialLoginProps {
  onSuccess?: () => void;
}

const SocialLogin = ({ onSuccess }: SocialLoginProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading('google');
    
    try {
      const response = await authApi.getGoogleAuthUrl();
      if (response.data.data?.url) {
        // Öffne die Google-Authentifizierungs-URL in einem neuen Fenster
        window.location.href = response.data.data.url;
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ein unerwarteter Fehler ist aufgetreten');
      }
      setLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    setError(null);
    setLoading('github');
    
    try {
      const response = await authApi.getGithubAuthUrl();
      if (response.data.data?.url) {
        // Öffne die GitHub-Authentifizierungs-URL in einem neuen Fenster
        window.location.href = response.data.data.url;
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ein unerwarteter Fehler ist aufgetreten');
      }
      setLoading(null);
    }
  };

  // Diese Funktion wird aufgerufen, wenn der Benutzer von der OAuth-Seite zurückgeleitet wird
  const handleSocialCallback = async (provider: string, code: string) => {
    setError(null);
    setLoading(provider);
    
    try {
      const response = await authApi.socialCallback({ provider, code });
      
      if (response.data.data) {
        // Speichere Token im localStorage
        localStorage.setItem('token', response.data.data.token);
        
        // Aktualisiere den Redux-Store mit dem Benutzer und Token
        dispatch(setToken(response.data.data.token));
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
      setLoading(null);
    }
  };

  // Überprüfe beim Laden der Komponente, ob ein Code in der URL vorhanden ist
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const provider = urlParams.get('provider') || 'google'; // Standardmäßig Google, wenn nicht angegeben
    
    if (code) {
      handleSocialCallback(provider, code);
      
      // Entferne den Code aus der URL, um Mehrfach-Logins zu vermeiden
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  });

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Divider sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Oder anmelden mit
        </Typography>
      </Divider>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleGoogleLogin}
          disabled={!!loading}
          sx={{ 
            borderColor: '#4285F4',
            color: '#4285F4',
            '&:hover': {
              borderColor: '#4285F4',
              backgroundColor: 'rgba(66, 133, 244, 0.04)'
            }
          }}
        >
          {loading === 'google' ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
                alt="Google Logo" 
                style={{ width: 18, height: 18, marginRight: 8 }} 
              />
              Google
            </>
          )}
        </Button>
        
        <Button
          fullWidth
          variant="outlined"
          onClick={handleGithubLogin}
          disabled={!!loading}
          sx={{ 
            borderColor: '#333',
            color: '#333',
            '&:hover': {
              borderColor: '#333',
              backgroundColor: 'rgba(51, 51, 51, 0.04)'
            }
          }}
        >
          {loading === 'github' ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <img 
                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
                alt="GitHub Logo" 
                style={{ width: 18, height: 18, marginRight: 8 }} 
              />
              GitHub
            </>
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default SocialLogin;
