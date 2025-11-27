import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import config from "../config";
import gsap from "gsap";

export default function ViewSellers() {
  const [sellers, setSellers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);
  const headerRef = useRef(null);

  const displaySellers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.url}/admin/viewallsellers`);
      setSellers(response.data);
      setError("");
      setTimeout(() => {
        setLoading(false);
        animateContent();
      }, 800);
    } catch (err) {
      setError("Failed to fetch sellers data... " + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    displaySellers();
    gsap.from(headerRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });
  }, []);

  const animateContent = () => {
    if (tableRef.current) {
      gsap.from(".table-row", {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out"
      });
    }
  };

  const deleteSeller = async (id) => {
    try {
      const response = await axios.delete(`${config.url}/seller/delete?id=${id}`);
      const row = document.querySelector(`tr[data-id="${id}"]`);
      if (row) {
        gsap.to(row, {
          opacity: 0,
          height: 0,
          duration: 0.3,
          onComplete: () => {
            alert(response.data);
            displaySellers();
          }
        });
      } else {
        alert(response.data);
        displaySellers();
      }
    } catch (err) {
      setError("Deletion failed... " + err.message);
    }
  };

  const renderSkeletonRows = () => {
    return Array(6).fill().map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        {Array(8).fill().map((__, i) => (
          <td key={i} className="px-4 py-3">
            <div className="h-4 bg-green-100 rounded w-full"></div>
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h3
        className="text-3xl font-bold text-center mb-8 py-2 rounded shadow-sm"
        ref={headerRef}
      >
        <span className="text-green-600 relative inline-block border-b-4 border-green-500 pb-1">
          Seller Management
        </span>
      </h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-md animate-slideDown">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div 
        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl"
        ref={tableRef}
      >
        <div className="bg-green-600 px-6 py-4">
          <h4 className="text-xl font-semibold text-white">All Registered Donors</h4>
          <p className="text-green-100 text-sm">Manage Donors accounts</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-green-100">
              <tr>
                {["ID", "Name", "Email", "UserName", "Mobile No", "National ID", "Location", "Action"].map((title) => (
                  <th key={title} className="px-4 py-3 text-left text-green-800 font-medium">{title}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                renderSkeletonRows()
              ) : sellers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <svg className="w-16 h-16 text-yellow-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-yellow-700 font-medium">No Donor Found</p>
                      <p className="text-gray-500 text-sm mt-1">There are currently no registered Donors in the system</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sellers.map((seller, index) => (
                  <tr 
                    key={seller.id}
                    data-id={seller.id}
                    className="hover:bg-green-50 transition-colors table-row"
                    style={{ transitionDelay: `${index * 30}ms` }}
                  >
                    <td className="px-4 py-3 text-gray-800">{seller.id}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{seller.name}</td>
                    <td className="px-4 py-3 text-gray-800">{seller.email}</td>
                    <td className="px-4 py-3 text-gray-800">{seller.username}</td>
                    <td className="px-4 py-3 text-gray-800">{seller.mobileno}</td>
                    <td className="px-4 py-3 text-gray-800">{seller.nationalidno}</td>
                    <td className="px-4 py-3 text-gray-800">{seller.location}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteSeller(seller.id)}
                        className="relative overflow-hidden px-3 py-1.5 bg-red-600 text-white rounded transition-all duration-300 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && sellers.length > 0 && (
          <div className="bg-green-50 px-6 py-4 border-t text-right">
            <p className="text-sm text-green-800">Total: <span className="font-semibold">{sellers.length} Donors</span></p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
