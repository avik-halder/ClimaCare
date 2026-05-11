import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import User from './pages/User';

// Helper component for redirection
const ProtectedRoute = ({ redirectTo, children }) => {
  const token = localStorage.getItem('token'); // Retrieve token
  return token ? <Navigate to={redirectTo} replace /> : children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* If a token exists, redirect / to /user */}
        <Route
          path="/"
          element={
            <ProtectedRoute redirectTo="/user">
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/user" element={<User />} />
      </Routes>
    </Router>
  );
};

export default App;
