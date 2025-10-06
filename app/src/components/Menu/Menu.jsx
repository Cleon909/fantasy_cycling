import { useState } from "react";
import './Menu.css';

const races = [
    { id: 1, name: 'world-championship' },
    { id: 2, name: 'tour-de-france' },
    { id: 3, name: 'vuelta-a-espana' },
    { id: 4, name: 'il-lombardia' }
];

export default function Menu({ selectRace, race }) {
    const [expandedRace, setExpandedRace] = useState(null);

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
                            onClick={() => toggleExpand(raceEl.id)}
                            className={race === raceEl.name ? 'active' : ''}
                        >
                            {raceEl.name}
                        </button>

                        {/* Dropdown submenu for Riders and Results */}
                        {expandedRace === raceEl.id && (
                            <ul className="submenu">
                                <li>
                                    <button onClick={() => selectRace(`${raceEl.name}`)}>
                                        Riders
                                    </button>
                                </li>
                                <li>
                                    {/* <button onClick={() => raceResults(`${raceEl.name}`)}> */}
                                    <button onClick={() => console.warn('Not coded yet!')}>
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
