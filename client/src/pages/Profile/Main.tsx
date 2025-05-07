import { useAuth } from '../../context/auth';
import LoadingSpinner from '../../components/LoadingSpinner';
import UserProfile from './UserProfile';

const User = () => {

    const auth = useAuth();

    if (!auth) return <LoadingSpinner />

    const { user } = auth;

    if (user.role === "PATIENT") {
        return <UserProfile userId={user._id} />
    }

    return (
        <div>{JSON.stringify(user)}</div>
    )
}

export default User;