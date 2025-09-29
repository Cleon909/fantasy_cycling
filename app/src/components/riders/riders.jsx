import React, { useEffect, useState } from 'react';
import { replace, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './riders.css';

export default function startList() {
    const [riderList, setRiderList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRiders = async () => {
            try {
                const race = 'world-championship'
                const year = 2025
                const response = await axios.get('/api/riders', {
                    params: { race, year },
                    withCredentials: false,
                });
                console.log('API response:', response.data);
                setRiderList(response.data.startList)
                setLoading(false)
            } catch (error) {
                console.error('error fetching rider list:', error)
                setError('Failed to fetch riders')
                setLoading(false)
            }
        }
        fetchRiders();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;


    return (
        <div className="container">
            <h2>Race Start List</h2>
            <ul className="startList">
                {riderList.map((riderTeam, index) => {
                    const riderName = riderTeam[0]; // The first item is the rider name
                    const teamName = riderTeam[1];  // The second item is the team name

                    return (
                        <li key={index} className="rider-list-item">
                            {/* Column 1: Rider Name */}
                            <span className="rider-name">{riderName}</span>

                            {/* Column 2: Team Name */}
                            <span className="team-name">{teamName}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    )
}
