import { useEffect, useState } from 'react';
import axios from 'axios';
import { logOut } from '../../utils/logout';
import { useNavigate } from 'react-router-dom';
import './Team.css';

export default function Team({ race, teams, setTeam, token, riderResults }) {
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();

  const saveTeam = async (race, team) => {
    const user = localStorage.getItem('user');
    try {
      const response = await axios.post(
        '/api/save_team',
        { user, race, team },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.error === 'Token has expired!') {
        logOut();
        navigate('/login');
      } else if (!response.data.error) {
        setSaveMessage('✅ Team Saved!');
      }
      console.log('API response: ', response.data);
    } catch (error) {
      console.error('Error saving team: ', error);
      setSaveMessage('❌ Error saving team!');
    }
  };

  // Hide save message after 5 seconds
  useEffect(() => {
    if (!saveMessage) return;
    const timer = setTimeout(() => setSaveMessage(''), 5000);
    return () => clearTimeout(timer);
  }, [saveMessage]);

  const removeRider = (rider) => {
    setTeam((prev) => ({
      ...prev,
      [race]: (prev[race] || []).filter((r) => r !== rider),
    }));
  };

  const didTheyDNF = (riderName) => {
    const result = riderResults[riderName]?.[0];
    if (result == 9999) { return 'DNF' }
    return result
  }

  return (
    <div className="team-container">
      <h2 className="team-title">{race}</h2>
      <p className="team-subtitle">Your Selected Riders</p>

      <div className="table-wrapper">
        <table className="team-table">
          <thead>
            <tr>
              <th>Rider</th>
              <th>Position</th>
              <th>Points</th>
              <th>Remove Rider</th>
            </tr>
          </thead>
          <tbody>
            {(teams[race] || []).map((riderName, index) => (
              <tr key={index}>
                <td className="rider-name">{riderName}</td>
                <td>{didTheyDNF(riderName)}</td>
                <td>{riderResults[riderName]?.[1]}</td>
                <td>
                  <button
                    className="remove-btn"
                    onClick={() => removeRider(riderName)}
                  >
                    ✖
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="save-btn"
        onClick={() => saveTeam(race, teams[race])}
      >
        Save Team
      </button>

      {saveMessage && <div className="save-message">{saveMessage}</div>}
    </div>
  );
}
