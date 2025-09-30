  import React, { useState } from "react";
  import axios from "axios";

  export default function Home() {
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inp, setInp] = useState("");
    const [searched, setSearched] = useState(false);

    const fet = async () => {
      if (!inp) return alert("Please enter a domain or IOC!");
      setLoading(true);
      setSearched(true);

      try {
        const res = await axios.get(`http://localhost:5500/check/${inp}`);
        setResult(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setResult([]);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="h-screen flex flex-col bg-gray-100 text-gray-800 font-sans p-6">
        {/* Header */}
        <div className="bg-white shadow-md p-6 flex flex-col md:flex-row items-center justify-between gap-4 rounded-lg">
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={inp}
              onChange={(e) => setInp(e.target.value)}
              placeholder="Enter domain or IOC (e.g. k.6n47.ru)"
              className="border-2 border-gray-300 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-[600px] flex items-center justify-between "
            />
            <button
              onClick={fet}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition font-semibold"
            >
              Check
            </button>
          </div>
        </div>
          {console.log(result)}
        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center mt-6">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        )}

        {/* Safe Message */}
        {!loading && searched && result.length === 0 && (
          <h3 className="text-green-600 font-semibold mt-6 text-center text-lg">
            ✅ This IOC is not reported as malicious
          </h3>
        )}

        {/* Table */}
        {result.length > 0 && (
          <div className="flex-1 mt-6">
            <table className="table-fixed w-full bg-white shadow-lg rounded-lg text-left">
              <thead className="bg-indigo-600 text-white uppercase text-sm sticky top-0 z-10">
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
                  <tr key={idx} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-2 break-words">{item.ioc || "-"}</td>
                    <td className="px-4 py-2 break-words">{item.ioc_type_desc || "-"}</td>
                    <td className="px-4 py-2 break-words">{item.threat_type_desc || "-"}</td>
                    <td className="px-4 py-2 break-words">{item.malware_printable || item.malware || "-"}</td>
                    <td className="px-4 py-2">{item.confidence_level || "-"}%</td>
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
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
