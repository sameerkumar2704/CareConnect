import { useAuth } from '../../context/auth';
import LoadingSpinner from '../../components/LoadingSpinner';
import UserProfile from './UserProfile';
import AdminApprovalPanel from '../Admin';

const User = () => {

    const auth = useAuth();

    console.log("Auth At Main", auth)

    if (auth) {

        const { user, admin } = auth;

        console.log("User At Main", user)
        console.log("Admin At Main", admin)

        if (!admin && !user) {
            return <LoadingSpinner />
        }

        if (!admin && user)
            return <UserProfile userId={user._id} role={user.role} />

        if (admin && user)
            return <AdminApprovalPanel />
    }
    return <LoadingSpinner />
}

export default User;