import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../store/authSlice';

// Reads the same state as everything else rather than decoding the token
// again. An expired token is cleared when the store is created.
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, role, expiresAt } = useSelector(selectAuth);

    if (!isAuthenticated || (expiresAt && expiresAt < Date.now())) {
        return <Navigate to="/loginregister" replace />;
    }

    if (adminOnly && role !== 'admin') {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute;
