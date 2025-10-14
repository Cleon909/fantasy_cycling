import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ Import this
import './Register.css';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('')
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('')

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password1 != password2) {
            alert("Passwords do not match")
            return
        }
        else {
            try {
                await axios.post('/api/register', { username, email, password1 }, {
                    withCredentials: true
                });
                navigate('/login');

            } catch (err) {
                console.error("Registration error:", err); // Full object
                console.log("Error response:", err?.response); // Optional chaining
                if (err.response && err.response.status === 409)
                    alert("email or username already taken");
                else alert("Something went wrong")
            }
        }
    };

    return (
        <div className="register-container">
            <form onSubmit={handleSubmit} className="register-form">
                <h2>Enter Details to Register</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password1}
                    onChange={e => setPassword1(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={password2}
                    onChange={e => setPassword2(e.target.value)}
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}
