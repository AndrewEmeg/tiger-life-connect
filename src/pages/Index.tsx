
import React from "react";
import SectionCard from "@/components/SectionCard";
import { ShoppingBag, Briefcase, Calendar } from "lucide-react";

const Index = () => {
  // Mock user data (will be replaced with actual auth data later)
  const user = {
    name: "Tiger Student",
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome to <span className="text-primary">Tiger Life</span>, {user.name}!
        </h1>
        <p className="text-lg text-gray-600">
          The all-in-one platform for Grambling State University students.
        </p>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <SectionCard
          title="Marketplace"
          description="Buy and sell textbooks, electronics, furniture, and more with fellow students."
          icon={<ShoppingBag size={24} />}
          to="/marketplace"
          gradient="from-yellow-400 to-amber-500"
        />
        <SectionCard
          title="Services"
          description="Offer your skills or find help with tutoring, rides, design, and other services."
          icon={<Briefcase size={24} />}
          to="/services"
          gradient="from-primary/60 to-primary"
        />
        <SectionCard
          title="Events"
          description="Discover campus events, club activities, and social gatherings around Grambling."
          icon={<Calendar size={24} />}
          to="/events"
          gradient="from-gray-800 to-tigerBlack"
        />
      </div>

      {/* Campus Life Section */}
      <div className="bg-gray-100 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-4">Campus Life at Grambling State</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-gray-700 mb-4">
              Tiger Life helps you connect with the vibrant Grambling State University community through:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Peer-to-peer marketplace for affordable essentials</li>
              <li>Student-provided services to help you succeed</li>
              <li>Campus events to keep you engaged and informed</li>
              <li>Direct messaging to connect with other Tigers</li>
            </ul>
          </div>
          <div className="bg-tigerGold rounded-lg p-6 text-tigerBlack">
            <h3 className="font-bold mb-2">New on Campus?</h3>
            <p className="mb-4">
              Join Tiger Life to find everything you need - from textbooks and supplies to events and services!
            </p>
            <div className="flex justify-end">
              <button className="bg-tigerBlack text-white px-4 py-2 rounded-full text-sm font-medium">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Get Started Today</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Tiger Life is built by students, for students. Create listings, browse services, or discover events to make the most of your time at Grambling State.
        </p>
        <div className="inline-flex gap-4">
          <button className="bg-tigerGold text-tigerBlack px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all">
            Create a Listing
          </button>
          <button className="border-2 border-tigerBlack text-tigerBlack px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all">
            Browse Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
