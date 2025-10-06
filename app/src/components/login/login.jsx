import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

export default function Login({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/login', { username, password }, {
                withCredentials: true
            });
            setToken(res.data.token);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', username)

        } catch (err) {
            alert('Invalid credentials');
        }
    };


    const navigate = useNavigate();

    const goToRegister = (e) => {
        e.preventDefault();
        navigate('/register');
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <input
                    type="Username"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
                <button type="button" onClick={goToRegister}>Register</button>
            </form>
        </div>
    );
}
