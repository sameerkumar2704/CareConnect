import { useAuth } from '../../context/auth';
import LoadingSpinner from '../../components/LoadingSpinner';
import UserProfile from './UserProfile';

const User = () => {

    const auth = useAuth();

    if (!auth) return <LoadingSpinner />

    const { user } = auth;

    console.log("User At Main", user)

    return <UserProfile userId={user._id} role={user.role} />
}

export default User;