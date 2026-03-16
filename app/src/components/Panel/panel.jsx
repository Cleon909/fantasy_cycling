import { useState, useEffect, useCallback } from "react";
import Riders from "../Riders/Riders";
import Menu from "../Menu/Menu";
import Header from "../Header/Header";
import Team from "../Team/Team";
import Result from "../Result/Result";
import "./panel.css";
import axios from "axios";

const getRaces = async (token) => {
  try {
    const response = await axios.get("/api/get_races", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: false,
    });
    let data = response.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (err) {
        console.error("Failed to parse race data:", data);
        data = [];
      }
    }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching races:", error);
    return [];
  }
};

const getPosition = async (race, rider, token, year) => {
  const response = await axios.get('/api/get_position_and_points',
    {
      params: { race, rider, year },
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: false,
    }
  )
  return response.data
}

export default function Panel({ token }) {
  const [race, setRace] = useState(null);
  const [year, setYear] = useState(Math.max(2026, new Date().getFullYear()));
  const [teams, setTeam] = useState({});
  const [displayRiderOrResult, setDisplayRiderOrResult] = useState("");
  const [races, setRaces] = useState([]);
  const [riderResults, setRiderResults] = useState({})

  // ✅ Stable getTeam function
  const getTeam = useCallback(
    async (user, race, year) => {
      try {
        const response = await axios.get("/api/get_team", {
          params: { user, race, year },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: false,
        });
        const team = response?.data?.team;
        return Array.isArray(team) ? team : [];
      } catch (error) {
        console.error("Error fetching team:", error);
        return [];
      }
    },
    [token]
  );

  useEffect(() => {
    const fetchRaces = async () => {
      if (!token) return;
      const fetchedRaces = await getRaces(token);
      setRaces(fetchedRaces);
    };
    fetchRaces();
  }, [token]);

  useEffect(() => {
    if (!race) return;

    const fetchAll = async () => {
      console.log("useEffect running with race =", race, "year =", year);

      // Clear prior race/year results so we don't display stale data.
      setRiderResults({});

      const user = localStorage.getItem("user");
      const storedTeam = await getTeam(user, race, year);
      if (!Array.isArray(storedTeam)) return;

      setTeam(prev => ({ ...prev, [`${race}_${year}`]: storedTeam }));

      // Now wait a tick for state to update before using teams[race]
      await new Promise(r => setTimeout(r, 0));

      const team = storedTeam;
      for (const rider of team) {
        const data = await getPosition(race, rider, token, year);
        const position = data.position;
        const points = data.points;
        console.log(`Fetched for ${rider}: position=${position}, points=${points}`);
        const key = `${race}_${year}_${rider}`;
        setRiderResults(prev => ({ ...prev, [key]: [position, points] }));
      }
    };

    fetchAll();
  }, [race, year, token, getTeam]);


  // ✅ Choose what to render (Riders vs Results)
  const RidersOrResult =
    displayRiderOrResult === "riders" ? (
      <Riders race={race} token={token} setTeam={setTeam} year={year} />
    ) : displayRiderOrResult === "results" ? (
      <Result race={race} token={token} year={year} team={teams[`${race}_${year}`]} riderResults={riderResults} />
    ) : (
      <div>Please select Riders or Results from the menu</div>
    );

  return (
    <div className="panel-root">
      <Header races={races} token={token} year={year} onYearChange={setYear} />
      <div className="container">
        <Menu
          setRace={setRace}
          race={race}
          setDisplay={setDisplayRiderOrResult}
          getTeam={getTeam}
          setTeam={setTeam}
          teams={teams}
          races={races}
          year={year}
        />
        <div className="main-panel">
          <Team
            race={race}
            teams={teams}
            token={token}
            setTeam={setTeam}
            riderResults={riderResults}
            year={year}
          />
          {RidersOrResult}
        </div>
      </div>
    </div>
  );
}
