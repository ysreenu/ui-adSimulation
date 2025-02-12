import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);
  const [feedback, setFeedback] = useState("Click on an ad to simulate a user interaction!");
  const [stats, setStats] = useState({ clicks: [], impressions: [], total_rewards: [], ctr: [] });

  // Fetch the list of ads from the Flask backend
  useEffect(() => {
    axios.get("http://localhost:5000/api/ads")
      .then((response) => {
        setAds(response.data.ads);
      })
      .catch((error) => {
        console.error("Error fetching ads:", error);
      });
  }, []);

  // Fetch statistics for A/B testing
  const fetchStats = () => {
    axios.get("http://localhost:5000/api/stats")
      .then((response) => {
        setStats(response.data);
      })
      .catch((error) => {
        console.error("Error fetching stats:", error);
      });
  };

  // Select an ad using Thompson Sampling
  const selectAd = () => {
    axios.get("http://localhost:5000/api/select_ad")
      .then((response) => {
        setSelectedAd(response.data.ad_id);
      })
      .catch((error) => {
        console.error("Error selecting ad:", error);
      });
  };

  // Handle ad click
  const handleAdClick = (adIndex) => {
    axios.post(`http://localhost:5000/api/click_ad/${adIndex}`)
      .then((response) => {
        const { ad_id, click, reward } = response.data;
        setFeedback(`Ad ${ad_id} clicked! Click: ${click}, Reward: ${reward.toFixed(2)}`);
        fetchStats(); // Update statistics after each click
      })
      .catch((error) => {
        console.error("Error clicking ad:", error);
      });
  };

  return (
    <div style={{ textAlign: "center", backgroundColor: "#f0f0f0", padding: "20px" }}>
      <h1>Ads Promotion with Thompson Sampling</h1>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        {ads.map((ad) => (
          <div
            key={ad}
            style={{
              border: "2px solid #ccc",
              padding: "10px",
              backgroundColor: "#fff",
              cursor: "pointer",
            }}
            onClick={() => handleAdClick(ad)}
          >
            <img
              src={`/ad${ad + 1}.jpeg`} // Place ad images in the public folder
              alt={`Ad ${ad + 1}`}
              style={{ width: "150px", height: "150px" }}
            />
          </div>
        ))}
      </div>
      <p style={{ marginTop: "20px", fontSize: "18px" }}>{feedback}</p>

      <button onClick={selectAd} style={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px" }}>
        Select Ad (Thompson Sampling)
      </button>

      <h2 style={{ marginTop: "40px" }}>A/B Testing Statistics</h2>
      <table style={{ margin: "0 auto", borderCollapse: "collapse", width: "50%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #000", padding: "10px" }}>Ad ID</th>
            <th style={{ border: "1px solid #000", padding: "10px" }}>Clicks</th>
            <th style={{ border: "1px solid #000", padding: "10px" }}>Impressions</th>
            <th style={{ border: "1px solid #000", padding: "10px" }}>Total Rewards</th>
            <th style={{ border: "1px solid #000", padding: "10px" }}>CTR</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => (
            <tr key={ad}>
              <td style={{ border: "1px solid #000", padding: "10px" }}>{ad + 1}</td>
              <td style={{ border: "1px solid #000", padding: "10px" }}>{stats.clicks[ad] || 0}</td>
              <td style={{ border: "1px solid #000", padding: "10px" }}>{stats.impressions[ad] || 0}</td>
              <td style={{ border: "1px solid #000", padding: "10px" }}>{stats.total_rewards[ad]?.toFixed(2) || 0}</td>
              <td style={{ border: "1px solid #000", padding: "10px" }}>{(stats.ctr[ad] || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;