import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Toast from '../common/Toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar />
      <Container component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Container>
      <Toast />
    </Box>
  );
};

export default Layout; 