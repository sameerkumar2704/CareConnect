import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { ReactNode, useEffect } from "react";
import Loading from "../../components/LoadingSpinner";

const UnProtectedRoute = ({ children }: { children: ReactNode }) => {
    const auth = useAuth();
    const user = auth?.user;
    const loading = auth?.loading || false;
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (user) {
                navigate("/");
            }
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <Loading />;
    }

    if (user) {
        return null;
    }

    return children;
};

export default UnProtectedRoute;
