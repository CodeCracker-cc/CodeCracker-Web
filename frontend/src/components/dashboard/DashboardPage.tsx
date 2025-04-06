import { Box, Typography, Button } from '@mui/material';
import Dashboard from './Dashboard';
import AuthGuard from '../auth/AuthGuard';

const DashboardPage = () => {
  const fallbackContent = (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Bitte melde dich an, um auf das Dashboard zuzugreifen
      </Typography>
      <Button 
        variant="contained" 
        href="/login"
        sx={{ mt: 2 }}
      >
        Zum Login
      </Button>
    </Box>
  );

  return (
    <AuthGuard fallback={fallbackContent} children={<Dashboard />} />
  );
};

export default DashboardPage;
