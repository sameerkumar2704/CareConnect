import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Dashboard from "./pages/DashBoard";
import AuthFormUser from "./pages/Auth/AuthFormUser";
import AuthFormHospital from "./pages/Auth/AuthFormHospital";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import Layout from "./Layout";
import Auth from "./pages/Auth";
import UnProtectedRoute from "./utils/routeProtection/unprotectedRoute";
import SuccessPage from "./pages/Payment/Success";
import CancelPage from "./pages/Payment/Cancel";
import HospitalsPage from "./pages/Hospitals";
import Hospitals from "./pages/Services/Hospitals";
import SpecializationsPage from "./pages/Specializations";
import HospitalDetails from "./pages/HospitalDetails";
import NotFound from "./pages/NotFound";
import CheckoutPage from "./pages/Checkout";
import AppointmentDetailsPage from "./pages/Appointment";
import ProtectedRoute from "./utils/routeProtection/protectedRoute";
import User from "./pages/Profile/Main";
import DoctorDashboard from "./pages/DoctorDashboard";
import Specialties from "./pages/Services/Specialities";

const App: React.FC = () => {

  const routes = [
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Dashboard />
        },
        {
          path: "/auth",
          children: [
            {
              path: "/auth",
              element: <UnProtectedRoute><Auth /></UnProtectedRoute>
            },
            {
              path: "/auth/user",
              element: <UnProtectedRoute><AuthFormUser /></UnProtectedRoute>
            },
            {
              path: "/auth/hospital",
              element: <UnProtectedRoute><AuthFormHospital /></UnProtectedRoute>
            }
          ]
        },
        {
          path: "/about",
          element: <About />
        },
        {
          path: "/services",
          element: <Services />
        },
        {
          path: "/services/specialties",
          element: <Specialties />
        },
        {
          path: "/services/hospitals",
          element: <Hospitals />
        },
        {
          path: "/contact",
          element: <Contact />
        },
        {
          path: "/checkout/:id",
          element: <ProtectedRoute><CheckoutPage /></ProtectedRoute>
        },
        {
          path: "/appointments/:id",
          element: <ProtectedRoute><AppointmentDetailsPage /></ProtectedRoute>
        },
        {
          path: "/dashboard",
          element: <ProtectedRoute><User /></ProtectedRoute>
        },
        {
          path: "/success",
          element: <SuccessPage />
        },
        {
          path: "/cancel",
          element: <CancelPage />
        },
        {
          path: "/hospitals",
          element: <HospitalsPage />
        },
        {
          path: "/specializations",
          element: <SpecializationsPage />
        },
        {
          path: "/hospital/:id",
          element: <HospitalDetails />
        },
        {
          path: "/profile",
          element: <DoctorDashboard />
        },
        {
          path: "*",
          element: <NotFound />
        }
      ]
    }
  ]

  const router = createBrowserRouter(routes);

  return (
    <div style={{
      fontFamily: "RaleWay, sans-serif"
    }}>
      {/* <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth" element={<AuthFormUser />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
      </Routes> */}
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
