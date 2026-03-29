import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getUser, clearAuth, api } from "../utils/api";
import Navbar         from "./Components/Navbar";
import Footer         from "./Components/Footer";
import Home           from "./pages/Home";
import Courses        from "./pages/Courses";
import CourseDetail   from "./pages/CourseDetail";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Dashboard      from "./pages/Dashboard";
import Profile        from "./pages/Profile";
import Quiz           from "./pages/Quiz";
import Payment        from "./pages/Payment";
import Success        from "./pages/Success";
import SuccessStories from "./pages/SuccessStories";

const PrivateRoute = ({ children }) =>
  getUser() ? children : <Navigate to="/login" replace />;

const AUTH_ROUTES = ["/login", "/register"];

function Layout() {
  const location = useLocation();
  const isAuth   = AUTH_ROUTES.includes(location.pathname);
  return (
    <>
      {!isAuth && <Navbar />}
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/courses"         element={<Courses />} />
        <Route path="/course/:id"      element={<CourseDetail />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/payment"         element={<Payment />} />
        <Route path="/success"         element={<Success />} />
        <Route path="/success-stories" element={<SuccessStories />} />
        <Route path="/dashboard"       element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile"         element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/quiz/:courseId"  element={<PrivateRoute><Quiz /></PrivateRoute>} />
      </Routes>
      {!isAuth && <Footer />}
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