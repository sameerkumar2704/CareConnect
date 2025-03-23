import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { ReactNode, useEffect } from "react";
import Loading from "../../components/LoadingSpinner";

const ProtectedRoute = ({ children }: {children: ReactNode}) => {
    const auth = useAuth();
    const user = auth?.user;
    const loading = auth?.loading;
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate("/");
            }
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <Loading />;
    }

    if (!user && !loading) {
        return null;
    }

    if (user) return children;

    return null;
};

export default ProtectedRoute;
