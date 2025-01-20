import { store } from '../store';
import { addToast } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';

interface ApiError {
  message: string;
  statusCode?: number;
}

export const handleApiError = (error: any) => {
  const errorMessage = error.response?.data?.message || 'Ein Fehler ist aufgetreten';
  
  if (error.response?.status === 401) {
    store.dispatch(logout());
    store.dispatch(addToast({
      type: 'error',
      message: 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.'
    }));
  } else {
    store.dispatch(addToast({
      type: 'error',
      message: errorMessage
    }));
  }
  
  return Promise.reject(error);
}; 