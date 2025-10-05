import { useState, useEffect } from 'react';
import Riders from '../Riders/Riders';
import Menu from '../Menu/Menu'
import './Panel.css';
import axios from 'axios';

export default function Panel({ token }) {
    useEffect(() => {
        const checkToken = async () => {
            try {
                const response = await axios.get('/api/check_token', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials: false
                })
                const data = response.data;
                console.log('Token valid for user:', data.username);
            }
            catch (err) {
                if (err.response && err.response.status === 401) {
                    // Token invalid or expired — handle logout
                    console.warn('Token expired or invalid. Logging Out')
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return;
                }
                console.error('Error checking token:', err);
            }
        }
        checkToken()

    }, [token])


    const [race, setRace] = useState(null)
    return (
        <>
            <Menu
                selectRace={setRace}
                race={race}
            />
            <Riders race={race} token={token} />
        </>
    )
}