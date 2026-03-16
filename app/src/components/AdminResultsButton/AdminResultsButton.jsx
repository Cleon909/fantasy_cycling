import { useState } from "react";
import axios from "axios";
import "./AdminResultsButton.css";

export default function AdminResultsButton({ races, token, year }) {
  const user = localStorage.getItem("user");
  if (user !== "Admin") return null;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRace, setSelectedRace] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFetchResults = async () => {
    if (!selectedRace) return;
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.get(
        "/api/calculate_score", {
        params: { race_name: selectedRace, year },
        headers: { Authorization: `Bearer ${token}` },
      },
      )
      setMessage(`✅ ${response.data.message}`);

      // Close modal automatically after 3 seconds
      setTimeout(() => setIsOpen(false), 3000);
    } catch (error) {
      console.error("Error fetching results:", error);
      setMessage("❌ Error fetching results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-results">
      <button
        className="btn-confirm"
        onClick={() => setIsOpen(true)}
      >
        Get Results
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Fetch Race Results</h2>
            <select
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
            >
              <option value="">Select a race</option>
              {races.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>

            <div className="button-group">
              <button
                className="btn-cancel"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={handleFetchResults}
                disabled={loading}
              >
                {loading ? "Fetching..." : "Confirm"}
              </button>
            </div>

            {message && <p className="message">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

