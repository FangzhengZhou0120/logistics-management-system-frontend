import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/user-context';

export const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};