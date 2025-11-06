import React, { useEffect, useState } from "react";
import axios from "axios";

export default function List() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("7days");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5500/malware?filter=${range}`
      );

      // Only keep domain names (ignore IPs or numbers)
      const domainsOnly = (res.data.data || []).filter((item) =>
        /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(item.ioc)
      );

      setData(domainsOnly);
      setFiltered(domainsOnly);
    } catch (err) {
      console.error("Error fetching malware:", err);
      setData([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  // Search filter
  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(
      data.filter(
        (item) =>
          item.ioc?.toLowerCase().includes(lower) ||
          item.malware?.toLowerCase().includes(lower) ||
          item.threat_type_desc?.toLowerCase().includes(lower)
      )
    );
  }, [search, data]);

  // CSV download
  const exportToCSV = () => {
    if (filtered.length === 0) return;

    const headers = ["IOC", "First Seen", "Malware", "Type", "Threat Description"];
    const csvRows = [
      headers.join(","),
      ...filtered.map((item) =>
        [item.ioc, item.first_seen, item.malware, item.type, item.threat_type_desc]
          .map((field) => `"${field || "-"}"`)
          .join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "domain_malware_list.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">
          Domain malware appeared in last {range === "7days" ? "7 days" : "30 days"}
        </h2>

        <div className="flex flex-col md:flex-row gap-3 items-center justify-between mb-4">
          <div className="flex gap-2">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search domain or malware..."
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-semibold"
          >
            ⬇️ Download CSV
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center mt-6">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-lg rounded-lg">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 border">IOC</th>
                  <th className="px-4 py-3 border">First Seen</th>
                  <th className="px-4 py-3 border">Malware</th>
                  <th className="px-4 py-3 border">Type</th>
                  <th className="px-4 py-3 border">Threat Description</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500">
                      No domain malware found
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 border">{item.ioc}</td>
                      <td className="px-4 py-2 border">{item.first_seen}</td>
                      <td className="px-4 py-2 border">{item.malware}</td>
                      <td className="px-4 py-2 border">{item.type}</td>
                      <td className="px-4 py-2 border">{item.threat_type_desc}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
