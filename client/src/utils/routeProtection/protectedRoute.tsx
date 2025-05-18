import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { ReactNode, useEffect } from "react";
import Loading from "../../components/LoadingSpinner";
import { getRedirectPath } from "../redirect";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const auth = useAuth();
    const user = auth?.user;
    const loading = auth?.loading;
    const navigate = useNavigate();

    const location = useLocation();

    const redirectPath = getRedirectPath(location.search, '/dashboard');

    console.log("Redirect Path at Context", redirectPath);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate(`/auth?redirect=${redirectPath}`, { replace: true });
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
