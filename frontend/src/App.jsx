import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getUser } from "./utils/api";

import Navbar      from "./Components/Navbar";
import Footer      from "./Components/Footer";

import Home        from "./pages/Home";
import Courses     from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Login       from "./pages/Login";
import Register    from "./pages/Register";
import Dashboard   from "./pages/Dashboard";
import Quiz        from "./pages/Quiz";
import Payment     from "./pages/Payment";
import Success     from "./pages/Success";

// Redirect to /login if not authenticated
const PrivateRoute = ({ children }) =>
  getUser() ? children : <Navigate to="/login" replace />;

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/courses"   element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/payment"   element={<Payment />} />
        <Route path="/success"   element={<Success />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/quiz/:courseId" element={<PrivateRoute><Quiz /></PrivateRoute>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
