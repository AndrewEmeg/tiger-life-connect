
import React from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { Search, Plus } from "lucide-react";

const Marketplace: React.FC = () => {
  // Mock products data (will be replaced with Supabase data)
  const products: Product[] = [
    {
      id: "1",
      title: "Textbook: Introduction to Computer Science",
      description: "Barely used textbook for CS101. Perfect condition, no highlights or notes.",
      price: 45.99,
      image_url: "https://images.unsplash.com/photo-1588580000645-5f35e382fb81?q=80&w=800",
      seller_id: "user1",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      is_active: true
    },
    {
      id: "2",
      title: "Desk Lamp",
      description: "LED desk lamp with adjustable brightness and color temperature. Perfect for dorm rooms.",
      price: 22.50,
      image_url: "https://images.unsplash.com/photo-1534381337082-62b5ba96d8f1?q=80&w=800",
      seller_id: "user2",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      is_active: true
    },
    {
      id: "3",
      title: "Scientific Calculator",
      description: "TI-84 Plus with all accessories. Works perfectly, just graduated and don't need it anymore.",
      price: 65.00,
      image_url: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?q=80&w=800",
      seller_id: "user3",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      is_active: true
    },
    {
      id: "4",
      title: "Dorm Mini Fridge",
      description: "3.2 cubic ft mini fridge. Used for one year, works like new. Moving off-campus.",
      price: 85.00,
      image_url: "https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800",
      seller_id: "user1",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      is_active: true
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <div className="flex gap-4">
          <div className="relative flex-1 md:min-w-[300px]">
            <input
              type="text"
              placeholder="Search listings..."
              className="w-full pl-10 pr-4 py-2 border rounded-full"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button className="bg-tigerGold text-tigerBlack px-4 py-2 rounded-full flex items-center gap-2 font-medium">
            <Plus size={18} />
            <span>Add Item</span>
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
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
