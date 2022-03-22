import { Navigate, useLocation } from 'react-router-dom';
import { ACCESS_TOKEN } from '../../services/CONSTANTS';

export default function RequireAuth({ children }: { children: JSX.Element }) {
    if (!localStorage.getItem(ACCESS_TOKEN)) {
        return <Navigate to="/Login" replace />;
    }

    return children;
}
