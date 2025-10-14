import { useState, useEffect, useCallback } from "react";
import Riders from "../Riders/Riders";
import Menu from "../Menu/Menu";
import Header from "../Header/Header";
import Team from "../Team/Team";
import "./Panel.css";
import axios from "axios";

const getRaces = async () => {
  try {
    const response = await axios.get("/api/get_races", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: false,
    });

    let data = response.data;

    // ✅ Handle if backend returned a JSON string
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (err) {
        console.error("Failed to parse race data:", data);
        data = [];
      }
    }

    // ✅ Guarantee array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching races:", error);
    return [];
  }
};

export default function Panel({ token }) {
  const [race, setRace] = useState(null);
  const [teams, setTeam] = useState({});
  const [displayRiderOrResult, setDisplayRiderOrResult] = useState("");
  const [races, setRaces] = useState([]);

  // ✅ Stable getTeam function
  const getTeam = useCallback(
    async (user, race) => {
      try {
        const response = await axios.get("/api/get_team", {
          params: { user, race },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: false,
        });
        const team = response?.data?.team;
        console.log("Fetched team:", team);
        return Array.isArray(team) ? team : [];
      } catch (error) {
        console.error("Error fetching team:", error);
        return [];
      }
    },
    [token]
  );

  // ✅ Fetch races only once on mount
  useEffect(() => {
    const fetchRaces = async () => {
      const fetchedRaces = await getRaces();
      console.log("✅ Loaded races:", fetchedRaces);
      setRaces(fetchedRaces);
    };
    fetchRaces();
  }, []); // only runs once

  // ✅ Fetch team when race changes
  useEffect(() => {
    const fetchTeam = async () => {
      if (!race) return; // skip until a race is selected
      const user = localStorage.getItem("user");
      const storedTeam = await getTeam(user, race);

      if (Array.isArray(storedTeam)) {
        setTeam((prevTeams) => {
          const current = prevTeams[race] || [];
          const same =
            current.length === storedTeam.length &&
            current.every((r, i) => r === storedTeam[i]);

          return same ? prevTeams : { ...prevTeams, [race]: storedTeam };
        });
      }
    };

    fetchTeam();
  }, [race, getTeam]);

  // ✅ Choose what to render (Riders vs Results)
  const RidersOrResult =
    displayRiderOrResult === "riders" ? (
      <Riders race={race} token={token} setTeam={setTeam} />
    ) : displayRiderOrResult === "results" ? (
      <div>Results Coming Soon</div>
    ) : (
      <div>Please select Riders or Results from the menu</div>
    );

  return (
    <div className="panel-root">
      <Header races={races} token={token} />
      <div className="container">
        <Menu
          selectRace={setRace}
          race={race}
          setDisplay={setDisplayRiderOrResult}
          getTeam={getTeam}
          setTeam={setTeam}
          teams={teams}
          races={races}
        />
        <div className="main-panel">
          <Team
            race={race}
            teams={teams}
            token={token}
            setTeam={setTeam}
            getTeam={getTeam}
          />
          {RidersOrResult}
        </div>
      </div>
    </div>
  );
}
