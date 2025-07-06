import React, { useState } from 'react';
import Login from './components/login/login';
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
    <div>
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <div>
          <h2>You're logged in!</h2>
          <button onClick={fetchSite}>Access Protected Route</button>
        </div>
      )}
    </div>
  );
}

export default App;
