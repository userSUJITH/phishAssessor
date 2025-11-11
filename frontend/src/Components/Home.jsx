import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ShieldAlert, Loader2, Link2, LayoutGrid, Table as TableIcon } from "lucide-react";

export default function Home() {
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inp, setInp] = useState("");
  const [searched, setSearched] = useState(false);
  const [view, setView] = useState("card"); // card | table

  const fet = async () => {
    if (!inp) return alert("Please enter a domain or IOC!");
    setLoading(true);
    setSearched(true);

    try {
      const res = await axios.get(`https://phishassessor-backend.onrender.com/check/${inp}`);
      const data = res.data?.data || [];
      setResult(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching IOC:", err);
      setResult([]);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Confidence Circle Component
  const ConfidenceCircle = ({ value = 0 }) => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    // 🔵 Dynamic stroke color based on confidence value
    const getStrokeColor = () => {
      if (value >= 70) return "#16a34a"; // green-600
      if (value >= 40) return "#f97316"; // orange-500
      return "#dc2626"; // red-600
    };

    const strokeColor = getStrokeColor();

    return (
      <svg width="60" height="60" className="transform -rotate-90">
        <circle
          cx="30"
          cy="30"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="6"
          fill="transparent"
        />
        <circle
          cx="30"
          cy="30"
          r={radius}
          stroke={strokeColor}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
        <text
          x="30"
          y="35"
          textAnchor="middle"
          fill="#111827"
          fontSize="14"
          fontWeight="600"
          className="rotate-90"
        >
          {value || 0}%
        </text>
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-inter p-6 flex flex-col">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-md p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <ShieldAlert size={32} className="text-indigo-600" />
          <h1 className="text-2xl font-bold tracking-wide text-gray-800">
            IOC Threat Intelligence Checker
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            value={inp}
            onChange={(e) => setInp(e.target.value)}
            placeholder="🔍 Enter domain or IOC (e.g. k.6n47.ru)"
            className="w-full md:w-[500px] px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={fet}
            disabled={loading}
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm"
          >
            Check
          </button>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center mt-10">
          <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
          <span className="ml-3 text-gray-700 text-lg">Analyzing IOC...</span>
        </div>
      )}

      {/* Safe Message */}
      {!loading && searched && result.length === 0 && (
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-green-600 font-semibold mt-8 text-center text-xl"
        >
          ✅ This IOC appears clean — no malicious reports found.
        </motion.h3>
      )}

      {/* View Toggle */}
      {!loading && result.length > 0 && (
        <div className="flex justify-end mt-8">
          <div className="bg-white border border-gray-300 rounded-xl flex shadow-sm">
            <button
              className={`px-4 py-2 flex items-center gap-1 rounded-l-xl transition-all ${
                view === "card"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setView("card")}
            >
              <LayoutGrid size={18} /> Card
            </button>
            <button
              className={`px-4 py-2 flex items-center gap-1 rounded-r-xl transition-all ${
                view === "table"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setView("table")}
            >
              <TableIcon size={18} /> Table
            </button>
          </div>
        </div>
      )}

      {/* Card View */}
      {!loading && view === "card" && result.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {result.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 transition-all"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-indigo-700 truncate">
                  {item.ioc || "Unknown IOC"}
                </h2>
                <ConfidenceCircle value={item.confidence_level || 0} />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Type: {item.ioc_type_desc || "N/A"}
              </p>

              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Threat: </span>
                  <span className="text-gray-800">
                    {item.threat_type_desc || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Malware: </span>
                  <span className="text-gray-800">
                    {item.malware_printable || item.malware || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">First Seen: </span>
                  <span className="text-gray-800">{item.first_seen || "Unknown"}</span>
                </p>
                <p>
                  <span className="text-gray-500">Reference: </span>
                  {item.reference ? (
                    <a
                      href={item.reference}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Link2 size={14} />
                      Link
                    </a>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Table View */}
      {!loading && view === "table" && result.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 mt-8 overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-md"
        >
          <table className="table-fixed w-full text-left text-sm text-gray-700">
            <thead className="bg-indigo-600 text-white uppercase text-xs sticky top-0 z-10">
              <tr>
                <th className="w-1/6 px-4 py-3">IOC</th>
                <th className="w-1/6 px-4 py-3">Type</th>
                <th className="w-1/6 px-4 py-3">Threat</th>
                <th className="w-1/6 px-4 py-3">Malware</th>
                <th className="w-1/12 px-4 py-3">Confidence</th>
                <th className="w-1/6 px-4 py-3">First Seen</th>
                <th className="w-1/6 px-4 py-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {result.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2 break-words">{item.ioc || "-"}</td>
                  <td className="px-4 py-2 break-words">{item.ioc_type_desc || "-"}</td>
                  <td className="px-4 py-2 break-words">{item.threat_type_desc || "-"}</td>
                  <td className="px-4 py-2 break-words">
                    {item.malware_printable || item.malware || "-"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <ConfidenceCircle value={item.confidence_level || 0} />
                  </td>
                  <td className="px-4 py-2">{item.first_seen || "-"}</td>
                  <td className="px-4 py-2 break-words">
                    {item.reference ? (
                      <a
                        href={item.reference}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Link
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
