import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getUser } from "./utils/api";

import Navbar             from "./Components/layout/Navbar";
import Footer             from "./Components/layout/Footer";
import Home               from "./pages/Home";
import Courses            from "./pages/Courses";
import CourseDetail       from "./pages/CourseDetail";
import Login              from "./pages/Login";
import Register           from "./pages/Register";
import Dashboard          from "./pages/Dashboard";
import Profile            from "./pages/Profile";
import Quiz               from "./pages/Quiz";
import Payment            from "./pages/Payment";
import Success            from "./pages/Success";
import SuccessStories     from "./pages/SuccessStories";
import AboutUs            from "./pages/AboutUs";
import ContactUs          from "./pages/ContactUs";
import FreeResources      from "./pages/FreeResources";
import Internships        from "./pages/Internships";
import AdminDashboard     from "./pages/AdminDashboard";
import CertificateVerify  from "./pages/CertificateVerify";
import NotFound           from "./pages/NotFound";
import ConnectionError    from "./pages/ConnectionError";

const PrivateRoute = ({ children }) =>
  getUser() ? children : <Navigate to="/login" replace />;

const AdminRoute = ({ children }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

const AUTH_ROUTES = ["/login", "/register"];
const ERROR_ROUTES = ["/connection-error"];

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuth   = AUTH_ROUTES.includes(location.pathname);
  const isAdmin  = location.pathname.startsWith("/admin");
  const isVerify = location.pathname.startsWith("/verify");
  const isError  = ERROR_ROUTES.includes(location.pathname) || location.pathname === "/404";
  const hideChrome = isAuth || isAdmin || isVerify || isError;

  // Global: when any API call fails to reach the backend, surface the
  // connection-error page. We pass the current path so it can return there.
  useEffect(() => {
    const onNetError = () => {
      if (location.pathname !== "/connection-error") {
        navigate("/connection-error", {
          replace: true,
          state: { from: location.pathname + location.search },
        });
      }
    };
    window.addEventListener("api:network-error", onNetError);
    return () => window.removeEventListener("api:network-error", onNetError);
  }, [location, navigate]);

  return (
    <>
      {!hideChrome && <Navbar />}
      <Routes>
        <Route path="/"                element={<Home />} />
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

        {/* Public Certificate Verify — no login needed */}
        <Route path="/verify"          element={<CertificateVerify />} />
        <Route path="/verify/:certId"  element={<CertificateVerify />} />
        <Route path="/verify-certificate" element={<CertificateVerify />} />

        {/* Protected */}
        <Route path="/dashboard"       element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile"         element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/quiz/:courseId"  element={<PrivateRoute><Quiz /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* Error pages */}
        <Route path="/connection-error" element={<ConnectionError />} />
        <Route path="*"                 element={<NotFound />} />
      </Routes>
      {!hideChrome && <Footer />}
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