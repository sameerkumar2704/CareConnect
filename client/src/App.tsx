import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/DashBoard";
import AuthForm from "./components/AuthForm";
import About from "./components/About";
import Contact from "./components/Contact";

const App: React.FC = () => {
  return (
    <div style={{
      fontFamily: "OpenSans, sans-serif"
    }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Dashboard />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
};

export default App;
