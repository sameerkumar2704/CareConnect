import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { ReactNode, useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner"; 

const HighlyProtectedRoute = ({ children }: { children: ReactNode }) => {
    const auth = useAuth();
    const user = auth?.user;
    const admin = auth?.admin;
    const loading = auth?.loading;
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!user && !admin) {
                navigate("/");
            }
        }
    }, [user, admin, loading, navigate]);

    if (loading) {
        return <LoadingSpinner />; 
    }

    if (!user && !admin) {
        return null;
    }

    if (admin) {
        return children;
    }

    return null;
};

export default HighlyProtectedRoute;
