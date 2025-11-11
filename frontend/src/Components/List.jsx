import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function List() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("7days");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5500/malware?filter=${range}`);
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

  const exportToCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["IOC", "First Seen", "Malware", "Type", "Threat Description", "Confidence"];
    const csvRows = [
      headers.join(","),
      ...filtered.map((item) =>
        [item.ioc, item.first_seen, item.malware, item.type, item.threat_type_desc, item.confidence_level]
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 mb-6 border border-gray-200"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-700 mb-4 text-center md:text-left">
          Domain Malware (Last {range === "7days" ? "7 Days" : "30 Days"})
        </h2>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search domain or malware..."
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
            />
          </div>

          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-sm w-full sm:w-auto"
          >
            ⬇️ Download CSV
          </button>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="flex justify-center items-center mt-8">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600 text-lg">Loading data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-xl text-sm sm:text-base">
              <thead className="bg-indigo-600 text-white text-xs sm:text-sm uppercase">
                <tr>
                  <th className="px-3 sm:px-4 py-3 border">IOC</th>
                  <th className="px-3 sm:px-4 py-3 border">First Seen</th>
                  <th className="px-3 sm:px-4 py-3 border">Malware</th>
                  <th className="px-3 sm:px-4 py-3 border">Type</th>
                  <th className="px-3 sm:px-4 py-3 border">Threat Description</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No domain malware found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-all border-b border-gray-200">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 border break-words">{item.ioc}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 border break-words">{item.first_seen}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 border">{item.malware || "-"}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 border">{item.type || "-"}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 border">{item.threat_type_desc || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
