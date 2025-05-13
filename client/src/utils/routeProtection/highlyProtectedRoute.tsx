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

    if (user && !admin) {
        window.alert("You are not authorized to access this page.");
        window.history.back();
        return null;
    }

    if (!user && !admin) {
        window.alert("Please log in to access this page.");
        navigate("/auth");
        return null;
    }

    if (admin) {
        return children;
    }

    return null;
};

export default HighlyProtectedRoute;
