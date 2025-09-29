import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login/login';
import Register from './components/register/register'
import Riders from './components/riders/riders'

function App() {
  const [token, setToken] = useState(null);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !token ? (
              <Login setToken={setToken} />
            ) : (
              <Riders />
            )
          }
        />
        <Route path="/register" element={<Register />} />
        {/* Optional: redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
