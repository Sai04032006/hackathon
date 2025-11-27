import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import config from "../config";
import gsap from "gsap";

export default function SellersLobby() {
  const [sellers, setSellers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);
  const headerRef = useRef(null);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      // Get admin data from session storage
      const adminData = JSON.parse(sessionStorage.getItem('admin'));
      
      // Create headers with JWT token
      const headers = {
        'Authorization': `Bearer ${adminData?.token || ''}`
      };
      
      const response = await axios.get(`${config.url}/admin/viewallsellers`, { headers });
      setSellers(response.data);
      setError("");
      setTimeout(() => {
        setLoading(false);
        animateContent();
      }, 800);
    } catch (err) {
      setError("Failed to fetch sellers data... " + (err.response?.status === 403 ? 
        "Authentication error. Please log in again." : err.message));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
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

  const approveSeller = async (sid) => {
    try {
      // Get admin data from session storage
      const adminData = JSON.parse(sessionStorage.getItem('admin'));
      
      // Create headers with JWT token
      const headers = {
        'Authorization': `Bearer ${adminData?.token || ''}`
      };

      const row = document.querySelector(`tr[data-id="${sid}"]`);
      if (row) {
        gsap.to(row, {
          backgroundColor: "rgba(34,197,94,0.4)",
          duration: 0.3,
          onComplete: async () => {
            const response = await axios.post(`${config.url}/admin/approveseller`, sid, { 
              headers: {
                ...headers,
                'Content-Type': 'application/json'
              } 
            });
            alert(response.data);
            fetchSellers();
          }
        });
      } else {
        const response = await axios.post(`${config.url}/admin/approveseller`, sid, { 
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          } 
        });
        alert(response.data);
        fetchSellers();
      }
    } catch (err) {
      setError("Approval failed... " + (err.response?.status === 403 ? 
        "Authentication error. Please log in again." : err.message));
    }
  };

  const rejectSeller = async (sid) => {
    try {
      // Get admin data from session storage
      const adminData = JSON.parse(sessionStorage.getItem('admin'));
      
      // Create headers with JWT token
      const headers = {
        'Authorization': `Bearer ${adminData?.token || ''}`
      };
      
      const row = document.querySelector(`tr[data-id="${sid}"]`);
      if (row) {
        gsap.to(row, {
          backgroundColor: "rgba(220,38,38,0.2)",
          duration: 0.3,
          onComplete: async () => {
            const response = await axios.put(`${config.url}/seller/reject/${sid}`, {}, { headers });
            alert(response.data);
            fetchSellers();
          }
        });
      } else {
        const response = await axios.put(`${config.url}/seller/reject/${sid}`, {}, { headers });
        alert(response.data);
        fetchSellers();
      }
    } catch (err) {
      setError("Rejection failed... " + (err.response?.status === 403 ? 
        "Authentication error. Please log in again." : err.message));
    }
  };

  const deleteSeller = async (id) => {
    try {
      const row = document.querySelector(`tr[data-id="${id}"]`);
      if (row) {
        gsap.to(row, {
          opacity: 0,
          height: 0,
          duration: 0.3,
          onComplete: async () => {
            const response = await axios.delete(`${config.url}/seller/delete?id=${id}`);
            alert(response.data);
            fetchSellers();
          }
        });
      } else {
        const response = await axios.delete(`${config.url}/seller/delete?id=${id}`);
        alert(response.data);
        fetchSellers();
      }
    } catch (err) {
      setError("Deletion failed... " + err.message);
    }
  };

  const renderSkeletonRows = () => {
    return Array(6).fill().map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        {Array(9).fill().map((_, i) => (
          <td key={i} className="px-4 py-3">
            <div className="h-4 bg-green-200 rounded w-full"></div>
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h3 ref={headerRef} className="text-3xl font-bold text-center mb-8 text-black-700">Donors Approval Dashboard</h3>

      {error && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6 rounded">
          <p className="text-green-800 font-medium">{error}</p>
        </div>
      )}

      <div className="bg-green-50 rounded-xl shadow-md overflow-hidden border border-green-200" ref={tableRef}>
        <div className="bg-green-600 px-6 py-4">
          <h4 className="text-xl font-semibold text-white">Donor Application Requests</h4>
          <p className="text-green-100 text-sm">Approve or reject Donor's account applications</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-green-100 text-green-800">
              <tr>
                {["ID", "Name", "Email", "UserName", "Mobile No", "National ID", "Location", "Status", "Actions"].map((title, i) => (
                  <th key={i} className="px-4 py-3 font-medium">{title}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-green-200">
              {loading ? renderSkeletonRows() : sellers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-6 text-center text-green-600">No Donors Found</td>
                </tr>
              ) : (
                sellers.map((seller, index) => (
                  <tr key={seller.id} data-id={seller.id} className="table-row hover:bg-green-100 transition-colors">
                    <td className="px-4 py-3">{seller.id}</td>
                    <td className="px-4 py-3">{seller.name}</td>
                    <td className="px-4 py-3">{seller.email}</td>
                    <td className="px-4 py-3">{seller.username}</td>
                    <td className="px-4 py-3">{seller.mobileno}</td>
                    <td className="px-4 py-3">{seller.nationalidno}</td>
                    <td className="px-4 py-3">{seller.location}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${seller.status === "Approved" ? "bg-green-200 text-green-800" : seller.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {seller.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button onClick={() => approveSeller(seller.id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
                        <button onClick={() => rejectSeller(seller.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">Reject</button>
                        <button onClick={() => deleteSeller(seller.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}