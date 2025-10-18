import { useState, useEffect } from "react";
import './Menu.css';
import axios from "axios";

export default function Menu({ setRace, race, setDisplay, getTeam, setTeam, teams, races }) {
    const [expandedRace, setExpandedRace] = useState(null);
    const user = localStorage.getItem('user')

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
                            type="button"
                            onClick={() => {
                                toggleExpand(raceEl.id);
                                setRace(`${raceEl.name}`);
                                setDisplay('')
                            }}
                            className={race === raceEl.name ? 'active' : ''}
                        >
                            {raceEl.name}
                        </button>

                        {/* Dropdown submenu for Riders and Results */}
                        {expandedRace === raceEl.id && (
                            <ul className="submenu">
                                <li>
                                    <button 
                                        type="button"
                                        onClick={() => { setDisplay('riders') }}>
                                        Riders
                                    </button>
                                </li>
                                <li>
                                    {/* <button onClick={() => raceResults(`${raceEl.name}`)}> */}
                                    <button    
                                        type="button"
                                        onClick={() => setDisplay('results')}>
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
