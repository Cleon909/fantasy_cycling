import { useState } from 'react';
import { logOut } from '../../utils/logout';
import './Header.css';

export default function Header() {
    const [user, setUser] = useState(localStorage.getItem('user') || null);

    return (
        <header className="Header">
            <div className="header-left">
                <h1 className="logo">Fantasy Cycling</h1>
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