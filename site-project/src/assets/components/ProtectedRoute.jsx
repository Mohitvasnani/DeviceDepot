import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const ProtectedRoute = ({ children, adminOnly = false }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to='/loginregister' />;
    }

    try {
        const decoded = jwtDecode(token);
        
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            return <Navigate to='/loginregister' />;
        }

        if (adminOnly && decoded.role !== 'admin') {
            return <Navigate to='/home' />;
        }

        return children;

    } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        return <Navigate to='/loginregister' />;
    }
};

export default ProtectedRoute;