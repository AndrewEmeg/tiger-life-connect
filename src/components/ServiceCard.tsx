
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Edit, Trash2, ShoppingCart } from "lucide-react";
import { Service, User } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface ServiceCardProps {
    service: Service & { provider: User };
    onEdit?: () => void;
    onDelete?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
    service,
    onEdit,
    onDelete,
}) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isOwner = user?.id === service.provider_id;

    const handleActionClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleBuyClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/service/${service.id}`);
    };

    const handleMessageClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isOwner) {
            toast.info("This is your service");
            return;
        }
        
        if (!service.provider_id) {
            toast.error("Cannot message this provider");
            return;
        }
        
        // Check if the provider exists before navigating
        try {
            const { data, error } = await supabase
                .from("users")
                .select("id")
                .eq("id", service.provider_id)
                .single();
                
            if (error || !data) {
                console.error("Provider not found:", error);
                toast.error("Provider account not available");
                return;
            }
            
            // If we reach here, the provider exists
            navigate(`/messages?to=${service.provider_id}`);
        } catch (error) {
            console.error("Error checking provider:", error);
            toast.error("Could not connect to provider");
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
            <Link to={`/service/${service.id}`} className="block">
                <div className="h-48 overflow-hidden">
                    <img
                        src={service.image_url || "/placeholder.svg"}
                        alt={service.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg truncate">
                            {service.title}
                        </h3>
                        <span className="font-bold text-lg text-primary">
                            ${service.price.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {service.description}
                    </p>
                </div>
            </Link>
            <div className="px-4 pb-4" onClick={handleActionClick}>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(service.created_at), {
                            addSuffix: true,
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        {!isOwner && (
                            <Button
                                variant="default"
                                size="sm"
                                className="bg-tigerGold text-tigerBlack hover:bg-tigerGold/90"
                                onClick={handleBuyClick}
                            >
                                <ShoppingCart size={16} className="mr-1" />
                                Buy
                            </Button>
                        )}
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={handleMessageClick}
                            disabled={isOwner}
                            title={isOwner ? "This is your service" : "Message provider"}
                        >
                            <MessageSquare size={16} />
                        </Button>

                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Edit size={16} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={onEdit}>
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={onDelete}
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
