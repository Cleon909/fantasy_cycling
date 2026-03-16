import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './riders.css';
import { logOut } from '../../utils/logout';
import { useNavigate } from 'react-router-dom';

export default function Riders({ race, token, setTeam, year }) {
    const [riderList, setRiderList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!race) {
            return; // Wait until a race is selected
        }
        const fetchRiders = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/riders', {
                    params: { race, year },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: false,
                });
                if (response.data.error == 'Token has expired!') {
                    logOut();
                    navigate('/login');
                }
                setRiderList(response.data.startList || []);
                setError(null);
            } catch (error) {
                console.error('Error fetching rider list:', error);
                setError('Failed to fetch riders.');
                setRiderList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRiders();

    }, [race, year, token, navigate]);

    if (!race) return <p>Please select a race.</p>;
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;


    const addRider = (rider) => {
        setTeam(prevTeam => {
            const currentRaceTeam = prevTeam[`${race}_${year}`] || [];

            if (currentRaceTeam.length >= 9) {
                alert('You already have 9 riders for this race');
                return prevTeam;
            }

            if (currentRaceTeam.includes(rider)) {
                alert('You can\'t select the same rider more than once');
                return prevTeam;
            }

            // Return a new team object, updating only the current race/year
            return {
                ...prevTeam,
                [`${race}_${year}`]: [...currentRaceTeam, rider],
            };
        });
    };


    return (
        <div className="rider-container">
            <h2>Race Start List</h2>
            <ul className="startList">
                {riderList.map(([riderName, teamName], index) => (
                    <li key={index} className="rider-list-item">
                        <button onClick={() => addRider(riderName)} className="rider-name">{riderName}</button>
                        <span className="team-name">{teamName}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
