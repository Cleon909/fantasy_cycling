import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Riders.css';
import { logOut } from '../../utils/logout';
import { useNavigate } from 'react-router-dom';

export default function Riders({ race }) {
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
                const year = 2025;
                const response = await axios.get('/api/riders', {
                    params: { race, year },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    withCredentials: false,
                });
                if (response.data.error == 'Token has expired!'){
                    logOut();
                    navigate('/login');
                    }
                console.log('API response:', response.data);
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

    }, [race]);

    if (!race) return <p>Please select a race.</p>;
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container">
            <h2>Race Start List</h2>
            <ul className="startList">
                {riderList.map(([riderName, teamName], index) => (
                    <li key={index} className="rider-list-item">
                        <span className="rider-name">{riderName}</span>
                        <span className="team-name">{teamName}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
