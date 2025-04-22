
import React from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, User } from "lucide-react";
import { Service, User as UserType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PurchaseButton from "@/components/PurchaseButton";

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: service, isLoading, error } = useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      if (!id) throw new Error("No service ID provided");
      
      const { data, error } = await supabase
        .from("services")
        .select(`*, provider:users(*)`)
        .eq("id", id)
        .eq("is_active", true)
        .single();
        
      if (error) throw error;
      return data as Service & { provider: UserType };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error || !service) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-red-600 mb-4">Failed to load service details.</p>
        <Button asChild><Link to="/services">Back to Services</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/services" className="flex items-center mb-6 text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Services
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Service Image */}
        <div className="rounded-lg overflow-hidden bg-gray-100 h-[300px] md:h-[400px]">
          <img 
            src={service.image_url || "/placeholder.svg"} 
            alt={service.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Service Details */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{service.title}</h1>
          
          {service.provider && (
            <div className="flex items-center mb-4">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={service.provider.profile_image} />
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{service.provider.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  Posted {formatDistanceToNow(new Date(service.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          )}
          
          <div className="border-t border-b py-4 my-4">
            <p className="text-2xl font-bold text-primary">${service.price.toFixed(2)}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">{service.description}</p>
          </div>
          
          <PurchaseButton
            itemId={service.id}
            itemType="service"
            title={service.title}
            description={service.description}
            price={service.price}
            sellerId={service.provider_id}
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
