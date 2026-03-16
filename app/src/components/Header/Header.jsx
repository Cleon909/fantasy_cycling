import { useState } from 'react';
import { logOut } from '../../utils/logout';
import './Header.css';
import AdminResultsButton from '../AdminResultsButton/AdminResultsButton';

export default function Header({ races, token, year, onYearChange }) {
    const [user, setUser] = useState(localStorage.getItem('user') || null);
    const currentYear = new Date().getFullYear();
    const startYear = 2026;
    const years = Array.from(
        { length: Math.max(0, currentYear - startYear + 1) },
        (_, i) => startYear + i,
    );

    return (
        <header className="Header">
            <div className="header-left">
                <h1 className="logo">Fantasy Cycling</h1>
                <label className="year-label" htmlFor="header-year-select">Year</label>
                <select
                    id="header-year-select"
                    className="year-select"
                    value={year}
                    onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
                >
                    {years.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>

                <AdminResultsButton races={races} token={token} year={year} />
                <button className="get_results"></button>
            </div>

            <div className="header-right">
                <p id="user">{user ? user.name || user : 'Guest'}</p>
                <button
                    onClick={() => {
                        logOut();
                        window.location.href = '/login';
                    }}
                    className="logOut"
                >
                    Log Out
                </button>
            </div>
        </header>
    );
}