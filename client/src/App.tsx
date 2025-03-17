import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/DashBoard";
import AuthForm from "./components/AuthForm";

const App: React.FC = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/about" element={<Dashboard />} />
        <Route path="/services" element={<Dashboard />} />
        <Route path="/contact" element={<Dashboard />} />
      </Routes>
    </div>
  );
};

export default App;
