import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/auth";
import DoctorAppointmentView from "./Appointment/DoctorAppointment";
import PatientAppointmentView from "./Appointment/PatientAppointment";

const Appointment = () => {

    const auth = useAuth();

    if (!auth) {
        console.error("Auth context not found");
        return null;
    }

    const { user, loading } = auth;

    if (loading) {
        <LoadingSpinner />
    }

    if (!loading) {
        if (!user) {
            return <div className="flex justify-center items-center h-screen">Please login to book an appointment</div>;
        }

        if (user.role === "PATIENT") {
            return <PatientAppointmentView />;
        } else {
            return <DoctorAppointmentView />;
        }
    }

}

export default Appointment;

