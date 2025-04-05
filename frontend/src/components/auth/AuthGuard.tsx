import { useEffect, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getProfile } from '../../store/slices/authSlice';
import { CircularProgress, Box } from '@mui/material';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * AuthGuard-Komponente, die den Zugriff auf geschützte Routen nur für
 * authentifizierte Benutzer ermöglicht.
 * 
 * Wenn der Benutzer nicht authentifiziert ist, wird die fallback-Komponente angezeigt.
 * Standardmäßig wird null zurückgegeben, wenn kein fallback angegeben ist.
 */
const AuthGuard = ({ children, fallback = null }: AuthGuardProps) => {
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Wenn ein Token vorhanden ist, aber kein Benutzer, lade das Profil
    if (!user && localStorage.getItem('token')) {
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  // Zeige Ladeindikator während der Authentifizierungsstatus überprüft wird
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Wenn der Benutzer authentifiziert ist, zeige die Kinder
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Wenn der Benutzer nicht authentifiziert ist, zeige den Fallback
  return <>{fallback}</>;
};

export default AuthGuard;
