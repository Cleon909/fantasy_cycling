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

export default function Result({ race, token }) {
  const [league, setLeague] = useState([]);
  const [users, setUsers] = useState({});

    useEffect(() => {
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
  }, [token]);

  useEffect(() => {
    const fetchLeague = async () => {
      try {
        const response = await axios.get("/api/get_league", {
          params: { race },
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
      }
    };

    if (race && token) {
      fetchLeague();
    }
  }, [race, token]);

  return (
    <div className="result-container">
      <h2>Race League</h2>
      <ul className="league-list">
        {league.length > 0 ? (
          league.map((entry, index) => (
            <li key={index} className="result-list-item">
              <span className="rank">{index + 1}.</span>{" "}
              <span className="username">{users[entry.user]}</span>{" "}
              <span className="points">{entry.points} pts</span>
            </li>
          ))
        ) : (
          <li>No league data available</li>
        )}
      </ul>
    </div>
  );
}
