const axios = require("axios");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "https://threatfox-api.abuse.ch/api/v1/";
const API_KEY = process.env.API_KEY;

// --------------------
// Check IOC Route
// --------------------
app.get("/check/:inp", async (req, res) => {
  const { inp } = req.params;
  try {
    const response = await axios.post(
      API_URL,
      {
        query: "search_ioc",
        search_term: inp,
      },
      {
        headers: {
          "Auth-Key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data || { data: [] });
  } catch (err) {
    console.error("❌ Error checking IOC:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// --------------------
// Malware List Route
// --------------------
app.get("/malware", async (req, res) => {
  try {
    const { filter } = req.query; 

    const iocListRes = await axios.post(
      API_URL,
      { query: "get_iocs", limit: 5000 },
      { headers: { "Auth-Key": API_KEY, "Content-Type": "application/json" } }
    );

    let data = iocListRes.data.data || [];

    const now = new Date();
    const daysAgo = new Date();
    daysAgo.setDate(now.getDate() - (filter === "30days" ? 30 : 7));

 
    data = data.filter(
      (item) =>
        new Date(item.first_seen) >= daysAgo &&
        item.ioc_type === "domain"
    );


    const formatted = data.map((item) => ({
      ioc: item.ioc || "-",
      type: item.ioc_type || "-",
      malware: item.malware_printable || item.malware || "-",
      threat_type_desc: item.threat_type_desc || "-",
      first_seen: item.first_seen || "-",
    }));


    formatted.sort((a, b) => {
      const aStartsLetter = /^[a-zA-Z]/.test(a.ioc);
      const bStartsLetter = /^[a-zA-Z]/.test(b.ioc);

      if (aStartsLetter && !bStartsLetter) return -1; 
      if (!aStartsLetter && bStartsLetter) return 1; 

      return new Date(b.first_seen) - new Date(a.first_seen);
    });

    res.json({ data: formatted });
  } catch (error) {
    console.error("❌ Error fetching ThreatFox data:", error.message);
    res.status(500).json({ error: "Failed to fetch malware data" });
  }
});

// --------------------
// Start Server
// --------------------
const PORT = 5500;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
