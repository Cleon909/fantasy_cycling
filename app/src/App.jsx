import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login/login';
import Register from './components/Register/Register'
import Panel from './components/Panel/Panel'

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    // On mount, check localStorage for token
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !token ? (
              <Login setToken={setToken} />
            ) : (
              <Panel token={token} />
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
