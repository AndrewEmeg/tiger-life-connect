
import React from "react";
import ServiceCard from "@/components/ServiceCard";
import { Service } from "@/types";
import { Search, Plus } from "lucide-react";

const Services: React.FC = () => {
  // Mock services data (will be replaced with Supabase data)
  const services: Service[] = [
    {
      id: "1",
      title: "Math Tutoring",
      description: "Experienced tutor for Calculus, Linear Algebra, and Statistics. Flexible hours.",
      price: 25.00,
      image_url: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800",
      provider_id: "user1",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      is_active: true
    },
    {
      id: "2",
      title: "Professional Haircuts",
      description: "Men's and women's haircuts. Experienced stylist, affordable prices for students.",
      price: 15.00,
      image_url: "https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?q=80&w=800",
      provider_id: "user2",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      is_active: true
    },
    {
      id: "3",
      title: "Resume & Cover Letter Design",
      description: "Get a professional resume designed to help you land internships and jobs.",
      price: 30.00,
      image_url: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?q=80&w=800",
      provider_id: "user3",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      is_active: true
    },
    {
      id: "4",
      title: "Airport Rides",
      description: "Need a ride to/from the airport? Reliable transportation at student-friendly rates.",
      price: 40.00,
      image_url: "https://images.unsplash.com/photo-1464219789935-c2d9d9eb75c5?q=80&w=800",
      provider_id: "user1",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      is_active: true
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Services</h1>
        <div className="flex gap-4">
          <div className="relative flex-1 md:min-w-[300px]">
            <input
              type="text"
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2 border rounded-full"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button className="bg-tigerGold text-tigerBlack px-4 py-2 rounded-full flex items-center gap-2 font-medium">
            <Plus size={18} />
            <span>Add Service</span>
          </button>
        </div>
      </header>

      <div className="mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Filter:</span>
            </div>
            <button className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200">
              Recent
            </button>
            <button className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200">
              Price: Low to High
            </button>
            <button className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200">
              Price: High to Low
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
};

export default Services;
