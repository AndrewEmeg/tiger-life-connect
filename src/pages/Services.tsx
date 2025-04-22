
import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServiceCard from "@/components/ServiceCard";
import ServiceForm from "@/components/ServiceForm";
import { useServices } from "@/hooks/useServices";
import { Service } from "@/types";

const Services: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "price_asc" | "price_desc">("recent");
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { services, isLoading, createService, updateService, deleteService } = useServices();

  const handleCreateService = (data: Omit<Service, "id" | "created_at" | "provider_id" | "is_active">) => {
    createService.mutate(data);
  };

  const handleUpdateService = (data: Omit<Service, "id" | "created_at" | "provider_id" | "is_active">) => {
    if (editingService) {
      updateService.mutate({ id: editingService.id, ...data });
      setEditingService(null);
    }
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      deleteService.mutate(id);
    }
  };

  const filteredServices = services
    .filter(service => 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Services</h1>
        <div className="flex gap-4">
          <div className="relative flex-1 md:min-w-[300px]">
            <Input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-tigerGold text-tigerBlack hover:bg-tigerGold/90"
          >
            <Plus size={18} className="mr-2" />
            Add Service
          </Button>
        </div>
      </header>

      <div className="mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Filter:</span>
            </div>
            <Button
              variant={sortBy === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("recent")}
            >
              Recent
            </Button>
            <Button
              variant={sortBy === "price_asc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("price_asc")}
            >
              Price: Low to High
            </Button>
            <Button
              variant={sortBy === "price_desc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("price_desc")}
            >
              Price: High to Low
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={() => {
                setEditingService(service);
                setIsFormOpen(true);
              }}
              onDelete={() => handleDeleteService(service.id)}
            />
          ))}
        </div>
      )}

      <ServiceForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingService(null);
        }}
        service={editingService || undefined}
        onSubmit={editingService ? handleUpdateService : handleCreateService}
      />
    </div>
  );
};

export default Services;
