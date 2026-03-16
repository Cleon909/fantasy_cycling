import { useState } from "react";
import './Menu.css';

export default function Menu({ setRace, race, setDisplay, getTeam, setTeam, teams, races, year }) {
    const [expandedRace, setExpandedRace] = useState(null);

    const toggleExpand = (raceId) => {
        setExpandedRace(expandedRace === raceId ? null : raceId);
    };

    return (
        <aside className="Sidebar">
            <h2>Races</h2>
            <button
                type="button"
                onClick={() => {
                    setExpandedRace(null);
                    setRace(null);
                    setDisplay('overall');
                }}
                className={race === null ? 'active' : ''}
            >
                Monuments League
            </button>
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
