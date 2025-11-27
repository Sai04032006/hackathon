import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function FAQ() {
  const [openItem, setOpenItem] = useState(0);

  const toggleItem = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  const faqItems = [
    {
      question: "What is SAVE N SERVE?",
      answer: "SAVE N SERVE is a platform dedicated to reducing food waste by connecting food donors with those in need."
    },
    {
      question: "How does SAVE N SERVE work?",
      answer: "Donors can list surplus food on the platform, and recipients can claim it to ensure no food goes to waste."
    },
    {
      question: "Do I need an account to use SAVE N SERVE?",
      answer: "Yes, creating an account is required to donate or claim food items."
    },
    {
      question: "Is SAVE N SERVE available on mobile devices?",
      answer: "Yes, SAVE N SERVE is mobile-friendly and accessible on all devices."
    },
    {
      question: "How does SAVE N SERVE ensure food safety?",
      answer: "We provide guidelines for donors to ensure food safety and quality during donations."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-10 text-green-700">Frequently Asked Questions</h1>
      
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div 
            key={index} 
            className="bg-green-50 border border-green-200 rounded-md overflow-hidden"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full text-left py-4 px-6 flex justify-between items-center focus:outline-none hover:bg-green-100"
            >
              <span className="font-medium text-green-700">{item.question}</span>
              {openItem === index ? (
                <FaChevronUp className="text-green-600" />
              ) : (
                <FaChevronDown className="text-green-600" />
              )}
            </button>
            
            {openItem === index && (
              <div className="px-6 py-4 bg-white">
                <p className="text-gray-600">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}