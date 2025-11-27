import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#0a0f1f] text-white">
      <div className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Us Column */}
          <div>
            <h4 className="text-lg font-medium mb-4 pb-2 border-b border-green-700 inline-block">About Us</h4>
            <ul className="space-y-2">
              <li>Dedicated to reducing food waste</li>
              <li>Connecting donors with recipients</li>
              <li>Promoting sustainable practices</li>
              <li>Ensuring no food goes to waste</li>
            </ul>
          </div>

          {/* Contact Us Column */}
          <div>
            <h4 className="text-lg font-medium mb-4 pb-2 border-b border-green-700 inline-block">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center">
                <FaEnvelope className="mr-2 text-green-400" />
                gurukalyanakki21@gmail.com
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-2 text-green-400" />
                +91 8317673047
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-lg font-medium mb-4 pb-2 border-b border-green-700 inline-block">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-green-300 transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-green-300 transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-green-300 transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-green-300 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Follow Us Column */}
          <div>
            <h4 className="text-lg font-medium mb-4 pb-2 border-b border-green-700 inline-block">Follow Us</h4>
            <div className="flex space-x-4 mt-4">
              <a href="https://www.facebook.com/kothakotta.nithin" target='_blank' className="bg-green-700 hover:bg-green-600 transition-colors p-2 rounded-full">
                <FaFacebook className="text-lg" />
              </a>
              <a href="#" className="bg-green-700 hover:bg-green-600 transition-colors p-2 rounded-full">
                <FaTwitter className="text-lg" />
              </a>
              <a href="https://www.instagram.com/imnot_laxman_/" target='_blank' className="bg-green-700 hover:bg-green-600 transition-colors p-2 rounded-full">
                <FaInstagram className="text-lg" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright Section */}
      <div className="bg-[#0a0f1f] py-4 text-center text-sm">
        © 2025 SAVE N SERVE. All rights reserved.
      </div>
    </footer>
  );
}