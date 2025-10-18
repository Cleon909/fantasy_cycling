import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Result.css';

export default function Result({ race, token, team, riderResults }) {
    const [teamPoints, setTeamPoints] = useState(0)
    return (
        <div className="result-container">
            <h2>Race Result</h2>
            <h3>Team Points: {teamPoints}</h3>
            <ul className="resultList">
                {Object.entries(riderResults).map(([riderName, points], index) => (
  <li key={index} className="result-list-item">
    <span>{riderName} : {points}</span>
  </li>
))}
            </ul>
        </div>
    )

}