import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login/login';
import Register from './components/register/register'
import axios from 'axios';

function App() {
  const [token, setToken] = useState(null);

  const fetchSite = async () => {
    try {
      const res = await axios.get('http://localhost:5050/protected', {
        headers: { Authorization: token }
      });
      alert(res.data.message);
    } catch (err) {
      alert('Please Login or Register');
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !token ? (
              <Login setToken={setToken} />
            ) : (
              <div>
                <h2>You're logged in!</h2>
                <button onClick={fetchSite}>Access Protected Route</button>
              </div>
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
