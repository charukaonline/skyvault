import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext";
import Layout from "./components/layout/Layout";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import NotFound404 from "./pages/NotFound404";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Layout>
          <Routes>

            <Route path="*" element={<NotFound404 />} />

            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/login" element={<Login />} />
          </Routes>
        </Layout>
      </Router>
    </NotificationProvider>
  );
}

export default App;
