import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import { motion, AnimatePresence } from 'framer-motion';

export default function ViewBuyers() {
    const [buyers, setBuyers] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const displayBuyers = async () => {
        setLoading(true);
        try {
            // Get admin data from session storage
            const adminData = JSON.parse(sessionStorage.getItem('admin'));
            
            // Create headers with JWT token
            const headers = {
                'Authorization': `Bearer ${adminData?.token || ''}`
            };
            
            const response = await axios.get(`${config.url}/admin/viewallbuyers`, { headers });
            setBuyers(response.data);
            setError("");

            // Simulate a short loading time for a better UX
            setTimeout(() => {
                setLoading(false);
            }, 800);
        } catch (err) {
            setError("Failed to fetch buyers data... " + (err.response?.status === 403 ? 
                "Authentication error. Please log in again." : err.message));
            setLoading(false);
        }
    };

    useEffect(() => {
        displayBuyers();
    }, []);

    const deleteBuyer = async (bid) => {
        try {
            // Get admin data from session storage
            const adminData = JSON.parse(sessionStorage.getItem('admin'));
            
            // Create headers with JWT token
            const headers = {
                'Authorization': `Bearer ${adminData?.token || ''}`
            };
            
            const response = await axios.delete(`${config.url}/admin/deletebuyer?bid=${bid}`, { headers });
            alert(response.data);

            // Update the buyer list
            setBuyers(current => current.filter(buyer => buyer.id !== bid));
        } catch (err) {
            setError("Deletion failed... " + err.message);
        }
    };

    const renderSkeletonRows = () => {
        return Array(6).fill().map((_, index) => (
            <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="px-4 py-3"><div className="h-4 bg-green-200 rounded w-8"></div></td>
                <td className="px-4 py-3"><div className="h-4 bg-green-200 rounded w-24"></div></td>
                <td className="px-4 py-3"><div className="h-4 bg-green-200 rounded w-32"></div></td>
                <td className="px-4 py-3"><div className="h-4 bg-green-200 rounded w-24"></div></td>
                <td className="px-4 py-3">
                    <div className="h-8 bg-green-300 rounded w-20"></div>
                </td>
            </tr>
        ));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.h3
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-3xl font-bold text-center mb-8 py-2 rounded shadow-sm text-green-700"
            >
                <span className="relative inline-block border-b-4 border-green-600 pb-1">
                    Recipient Management
                </span>
            </motion.h3>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-md"
                    >
                        <p className="text-red-700 font-medium">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-green-200 transition-all duration-300 hover:shadow-xl"
            >
                <div className="bg-green-600 px-6 py-4">
                    <h4 className="text-xl font-semibold text-white">All Registered Recipients</h4>
                    <p className="text-green-100 text-sm">Manage recipient accounts</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="bg-green-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-green-700 font-medium">ID</th>
                                <th className="px-4 py-3 text-left text-green-700 font-medium">Name</th>
                                <th className="px-4 py-3 text-left text-green-700 font-medium">Email</th>
                                <th className="px-4 py-3 text-left text-green-700 font-medium">Mobile No</th>
                                <th className="px-4 py-3 text-left text-green-700 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-green-200">
                            {loading ? (
                                renderSkeletonRows()
                            ) : buyers.length === 0 ? (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <td colSpan="5" className="px-4 py-6">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <svg className="w-16 h-16 text-yellow-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <p className="text-yellow-700 font-medium">No Recipients Found</p>
                                            <p className="text-green-500 text-sm mt-1">There are currently no registered recipients in the system</p>
                                        </div>
                                    </td>
                                </motion.tr>
                            ) : (
                                <AnimatePresence>
                                    {buyers.map((buyer, index) => (
                                        <motion.tr
                                            key={buyer.id}
                                            data-id={buyer.id}
                                            className="hover:bg-green-50 transition-colors"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{
                                                opacity: 0,
                                                height: 0,
                                                transition: { duration: 0.3 }
                                            }}
                                            transition={{
                                                duration: 0.4,
                                                delay: index * 0.05,
                                                ease: "easeOut"
                                            }}
                                            layout
                                        >
                                            <td className="px-4 py-3 text-green-800">{buyer.id}</td>
                                            <td className="px-4 py-3 text-green-800 font-medium">{buyer.name}</td>
                                            <td className="px-4 py-3 text-green-800">{buyer.email}</td>
                                            <td className="px-4 py-3 text-green-800">{buyer.mobileno}</td>
                                            <td className="px-4 py-3">
                                                <motion.button
                                                    whileHover={{
                                                        scale: 1.05,
                                                        backgroundColor: "#DC2626"
                                                    }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => deleteBuyer(buyer.id)}
                                                    className="px-3 py-1.5 bg-red-600 text-white rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && buyers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        className="bg-white px-6 py-4 border-t text-right"
                    >
                        <p className="text-sm text-green-600">Total: <span className="font-semibold">{buyers.length} Recipients</span></p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}