import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getUser } from "./utils/api";

import Navbar          from "./Components/Navbar";
import Footer          from "./Components/Footer";
import Home            from "./pages/Home";
import Courses         from "./pages/Courses";
import CourseDetail    from "./pages/CourseDetail";
import Login           from "./pages/Login";
import Register        from "./pages/Register";
import Dashboard       from "./pages/Dashboard";
import Profile         from "./pages/Profile";
import Quiz            from "./pages/Quiz";
import Payment         from "./pages/Payment";
import Success         from "./pages/Success";
import SuccessStories  from "./pages/SuccessStories";
import AboutUs         from "./pages/AboutUs";
import ContactUs       from "./pages/ContactUs";
import FreeResources   from "./pages/FreeResources";
import Internships     from "./pages/Internships";
import AdminDashboard  from "./pages/AdminDashboard";
import CertificateVerification from "./pages/CertificateVerification";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

const AUTH_ROUTES   = ["/login", "/register"];
const ADMIN_ROUTES  = ["/admin"];

function Layout() {
  const location = useLocation();
  const isAuth   = AUTH_ROUTES.includes(location.pathname);
  const isAdmin  = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAuth && !isAdmin && <Navbar />}
      <Routes>
        <Route path="/verify-certificate" element={<CertificateVerification />} />
        <Route path="/courses"         element={<Courses />} />
        <Route path="/course/:id"      element={<CourseDetail />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/payment"         element={<Payment />} />
        <Route path="/success"         element={<Success />} />
        <Route path="/success-stories" element={<SuccessStories />} />
        <Route path="/about"           element={<AboutUs />} />
        <Route path="/contact"         element={<ContactUs />} />
        <Route path="/free-resources"  element={<FreeResources />} />
        <Route path="/internships"     element={<Internships />} />

        {/* Protected */}
        <Route path="/dashboard"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile"        element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/quiz/:courseId" element={<PrivateRoute><Quiz /></PrivateRoute>} />

        {/* Admin Only */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
      {!isAuth && !isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}