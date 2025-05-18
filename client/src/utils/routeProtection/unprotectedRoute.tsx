import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { ReactNode, useEffect } from "react";
import Loading from "../../components/LoadingSpinner";
import { getRedirectPath } from "../redirect";

const UnProtectedRoute = ({ children }: { children: ReactNode }) => {
    const auth = useAuth();
    const user = auth?.user;
    const loading = auth?.loading || false;
    const navigate = useNavigate();

    const location = useLocation();

    const redirectPath = getRedirectPath(location.search, '/dashboard');

    console.log("Redirect Path at Context Unprotected", redirectPath);

    useEffect(() => {
        if (!loading) {
            if (user) {
                navigate(redirectPath, { replace: true });
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
