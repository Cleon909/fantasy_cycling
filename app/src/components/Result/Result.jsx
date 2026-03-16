// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './Result.css';

// export default function Result({ race, token, team, riderResults }) {
//     const [league, setLeague] = useState({})
//     useEffect(() => {
//     const fetchLeague = async () => {
//       try {
//         const response = await axios.get("/api/get_league", {
//           params: { race },
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!response.data.error && response.data.league) {
//           // Sort the league object by value (points)
//           const sortedLeague = Object.entries(response.data.league)
//             .sort(([, aPoints], [, bPoints]) => bPoints - aPoints) // descending order
//             .map(([user, points]) => ({ user, points }));

//           setLeague(sortedLeague);
//         }

//         console.log("League API response: ", response.data);
//       } catch (error) {
//         console.error("Error fetching league: ", error);
//       }
//     };

//     if (race && token) {
//       fetchLeague();
//     }
//   }, [race, token]);


//     return (
//         <div className="result-container">
//             <h2>Race League</h2>
//             <ul className="League-list">
//                 {Object.entries(league).map(([userID, points, index]) => (
//   <li key={index} className="result-list-item">
//     <span>{userID} : {points}</span>
//   </li>
// ))}
//             </ul>
//         </div>
//     )

// }

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Result.css';

export default function Result({ race, token, year, mode = "race" }) {
    const [league, setLeague] = useState([]);
    const [users, setUsers] = useState({});

    useEffect(() => {
        if (mode !== "race") return;
        const fetchUsers = async () => {
            try {
                const response = await axios.get("/api/get_users", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.data.error && response.data.users) {
                    setUsers(response.data.users);
                }

                console.log("Users API response: ", response.data);
            } catch (error) {
                console.error("Error fetching users: ", error);
            }
        };

        if (token) {
            fetchUsers();
        }
    }, [token, mode]);

    useEffect(() => {
        const fetchLeague = async () => {
            try {
                if (mode === "overall") {
                    const response = await axios.get("/api/get_overall_league", {
                        params: { year },
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!response.data.error && Array.isArray(response.data.league)) {
                        setLeague(response.data.league);
                    } else {
                        setLeague([]);
                    }

                    console.log("Overall league API response: ", response.data);
                    return;
                }

                const response = await axios.get("/api/get_league", {
                    params: { race, year },
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.data.error && response.data.league) {
                    // Convert and sort league object by value (points)
                    const sortedLeague = Object.entries(response.data.league)
                        .sort(([, aPoints], [, bPoints]) => bPoints - aPoints)
                        .map(([user, points]) => ({ user, points }));

                    setLeague(sortedLeague);
                }

                console.log("League API response: ", response.data);
            } catch (error) {
                console.error("Error fetching league: ", error);
                setLeague([]);
            }
        };

        if (token && year && (mode === "overall" || race)) {
            fetchLeague();
        }
    }, [race, token, year, mode]);

    return (
        <div className="result-container">
            <h2>{mode === "overall" ? "Monuments League" : "Race League"}</h2>
            <ul className="league-list">
                {league.length > 0 ? (
                    league.map((entry, index) => {
                        if (mode === "overall") {
                            return (
                                <li key={index} className="result-list-item">
                                    <span className="rank">{entry.rank ?? index + 1}.</span>{" "}
                                    <span className="username">{entry.username}</span>{" "}
                                    <span className="points">{entry.points} pts</span>
                                </li>
                            );
                        }

                        return (
                            <li key={index} className="result-list-item">
                                <span className="rank">{index + 1}.</span>{" "}
                                <span className="username">{users[entry.user]}</span>{" "}
                                <span className="points">{entry.points} pts</span>
                            </li>
                        );
                    })
                ) : (
                    <li>No league data available</li>
                )}
            </ul>
        </div>
    );
}
