import { useState, useEffect } from "react";
import './Menu.css';
import axios from "axios";

// const races = [
//     { id: 1, name: 'world-championship' },
//     { id: 2, name: 'tour-de-france' },
//     { id: 3, name: 'vuelta-a-espana' },
//     { id: 4, name: 'il-lombardia' }
// ];

export default function Menu({ selectRace, race, setDisplay, getTeam, setTeam, teams, races }) {
    const [expandedRace, setExpandedRace] = useState(null);
    const user = localStorage.getItem('user')
    
  //     const getRaces = async () => {
  //   try {
  //     const response = await axios.get('/api/get_races', {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('token')}`,
  //       },
  //       withCredentials: false,
  //     });
  //     return response.data || [];
  //   } catch (error) {
  //     console.error('Error fetching races:', error);
  //     return [];
  //   }
  // };

  // useEffect(() => {
  //   const fetchRaces = async () => {
  //     const fetchedRaces = await getRaces();
  //     setRaces(fetchedRaces);
  //   };

  //   fetchRaces();
  // }, []);


    const toggleExpand = (raceId) => {
        setExpandedRace(expandedRace === raceId ? null : raceId);
    };

    return (
        <aside className="Sidebar">
            <h2>Races</h2>
            <ul>
                {races.map((raceEl) => (
                    <li key={raceEl.id}>
                        <button
                            onClick={() => {
                                toggleExpand(raceEl.id);
                                selectRace(`${raceEl.name}`);
                                setDisplay('')
                                // const savedTeam = getTeam(user, raceEl.name);
                                // if (!Array.isArray(teams[raceEl.name]) || teams[raceEl.name].length === 0)
                                // {
                                //     setTeam(prevteam => ({
                                //         ...prevteam,
                                //         [raceEl.name]: savedTeam
                                //     }));
                                // }
                            }}
                            className={race === raceEl.name ? 'active' : ''}
                        >
                            {raceEl.name}
                        </button>

                        {/* Dropdown submenu for Riders and Results */}
                        {expandedRace === raceEl.id && (
                            <ul className="submenu">
                                <li>
                                    <button onClick={() => { setDisplay('riders') }}>
                                        Riders
                                    </button>
                                </li>
                                <li>
                                    {/* <button onClick={() => raceResults(`${raceEl.name}`)}> */}
                                    <button onClick={() => setDisplay('results')}>
                                        Results
                                    </button>
                                </li>
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </aside>
    );
}
