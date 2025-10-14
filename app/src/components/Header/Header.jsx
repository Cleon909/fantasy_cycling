import { useState } from 'react';
import { logOut } from '../../utils/logout';
import './Header.css';
import AdminResultsButton from '../AdminResultsButton/AdminResultsButton';

export default function Header({races, token}) {
    const [user, setUser] = useState(localStorage.getItem('user') || null);

    return (
        <header className="Header">
            <div className="header-left">
                <h1 className="logo">Fantasy Cycling</h1>
                <AdminResultsButton races={races} token={token}/>
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