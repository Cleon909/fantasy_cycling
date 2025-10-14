import { useEffect, useState } from 'react';
import axios from 'axios';
import { logOut } from '../../utils/logout';
import { useNavigate } from 'react-router-dom';
import './Team.css';

export default function Team({ race, teams, setTeam, token, getTeam }) {
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();

  const saveTeam = async (race, team) => { 
    const user = localStorage.getItem('user');
    try {
      const response = await axios.post('/api/save_team',
        { user, race, team },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.error === 'Token has expired!') {
        logOut();
        navigate('/login');
      } else if (!response.data.error) {
        setSaveMessage('Team Saved!');
      }

      console.log('API response: ', response.data);
    } catch (error) {
      console.error('Error saving team: ', error);
      setSaveMessage('Error saving team!');
    }
  };

  // 🔹 Hide save message after 5 seconds
  useEffect(() => {
    if (!saveMessage) return;

    const timer = setTimeout(() => {
      setSaveMessage('');
    }, 5000);

    return () => clearTimeout(timer); // cleanup
  }, [saveMessage]);

  const removeRider = (rider) => {
    setTeam(prev => ({
      ...prev,
      [race]: (prev[race] || []).filter(r => r !== rider)
    }));
  };

  return (
    <div className="team-container">
      <h2>{race}</h2>
      <p>Team List</p>
      <ul className="teamlist">
        {(teams[race] || []).map((riderName, index) => (
          <li key={index} className="riderListitem">
            <button onClick={() => removeRider(riderName)} className="riderName">
              {riderName}
            </button>
          </li>
        ))}
      </ul>

      <button
        className="saveTeamButton"
        onClick={() => saveTeam(race, teams[race])}
      >
        Save Team
      </button>

      {saveMessage && <h2 className="saveMessage">{saveMessage}</h2>}
    </div>
  );
}
