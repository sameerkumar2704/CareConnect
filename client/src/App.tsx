import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Dashboard from "./components/DashBoard";
import AuthForm from "./components/AuthForm";
import About from "./components/About";
import Contact from "./components/Contact";
import Services from "./pages/Services";
import Layout from "./Layout";
import Auth from "./pages/Auth";
import UnProtectedRoute from "./utils/routeProtection/unprotectedRoute";

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
              element: <UnProtectedRoute><AuthForm /></UnProtectedRoute>
            },
            {
              path: "/auth/hospital",
              element: <UnProtectedRoute><AuthForm /></UnProtectedRoute>
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
          path: "/contact",
          element: <Contact />
        }
      ]
    }
  ]

  const router = createBrowserRouter(routes);

  return (
    <div style={{
      fontFamily: "OpenSans, sans-serif"
    }}>
      {/* <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
      </Routes> */}
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
