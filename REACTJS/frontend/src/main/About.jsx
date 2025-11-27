import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="bg-gray-50 py-16 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Animated Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-green-700 mb-6"
        >
          ABOUT US
        </motion.h1>
        
      
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 mb-16 max-w-3xl mx-auto"
          >
            Welcome to <span className="font-semibold text-green-700">SAVE N SERVE</span>, your dedicated partner in tackling food waste. 
            Our mission is to create awareness, provide solutions, and promote sustainable practices to minimize food waste and 
            ensure a healthier planet for future generations.
          </motion.p>
          
          {/* Card Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Component */}
          {[
            { title: "Our Mission", text: "To reduce food waste by connecting donors and recipients, ensuring surplus food reaches those in need while promoting sustainability." },
            { title: "Why Choose Us?", text: "We provide a seamless platform for food donation, fostering collaboration between individuals, organizations, and communities to combat food waste." },
            { title: "Our Vision", text: "To create a world where no food goes to waste, and every individual has access to nutritious meals through sustainable practices." }
          ].map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center transition-transform duration-300"
            >
              {/* Card Title */}
              <h2 className="text-xl font-semibold text-green-600 mb-4">{item.title}</h2>
              {/* Card Description */}
              <p className="text-gray-600 text-center">{item.text}</p>

              {/* Green Line Effect */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-b-lg"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
