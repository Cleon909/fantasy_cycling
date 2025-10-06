import { useState, useEffect } from 'react';
import Riders from '../Riders/Riders';
import Menu from '../Menu/Menu'
import Header from '../Header/Header';
// import Team from '../Team/Team'
import './Panel.css';
import axios from 'axios';



export default function Panel({ token }) {
    const [race, setRace] = useState(null)
    const [team, setTeam] = useState([])
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

    return (
        <>  <Header />
            <Menu
                selectRace={setRace}
                race={race}
            />
            <Riders
                race={race}
                token={token}
                setTeam={setTeam}
                team={team} />
            {/* <Team
                race={race}
                team={team}
                setTeam={setTeam}
                token={token} /> */}
        </>
    )
}