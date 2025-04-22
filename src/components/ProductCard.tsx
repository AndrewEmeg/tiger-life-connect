import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
    MessageSquare,
    Edit,
    Trash2,
    AlertCircle,
    ShoppingCart,
} from "lucide-react";
import { Product, User } from "@/types";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProductCardProps {
    product: Product & { seller: User };
    onEdit?: () => void;
    onDelete?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onEdit,
    onDelete,
}) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isOwner = user?.id === product.seller_id;
    const [checkingSeller, setCheckingSeller] = useState(false);

    const handleActionClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleBuyClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/product/${product.id}`);
    };

    const handleMessageClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOwner) {
            toast.info("This is your product");
            return;
        }

        if (!product.seller_id) {
            toast.error("Cannot message this seller: Missing seller ID");
            return;
        }

        setCheckingSeller(true);

        try {
            console.log(
                "Attempting to message seller with ID:",
                product.seller_id
            );
            console.log("Product details:", product);

            // Check if the seller exists before navigating
            console.log("Checking if seller exists in database...");
            const { data, error } = await supabase
                .from("users")
                .select("id")
                .eq("id", product.seller_id);

            console.log("Supabase query result:", { data, error });

            if (error) {
                console.error("Error querying seller:", error);
                toast.error(`Database error: ${error.message}`);
                return;
            }

            if (!data || data.length === 0) {
                console.error("Seller not found in database");
                toast.error(
                    "Seller account not available. This seller may have been removed from the platform."
                );
                return;
            }

            // If we reach here, the seller exists
            console.log("Seller found, navigating to messages");
            navigate(`/messages?to=${product.seller_id}`);
        } catch (error) {
            console.error("Exception checking seller:", error);
            toast.error("Could not connect to seller");
        } finally {
            setCheckingSeller(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
            <Link to={`/product/${product.id}`} className="block">
                <div className="h-48 overflow-hidden">
                    <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg truncate">
                            {product.title}
                        </h3>
                        <span className="text-tigerBlack bg-green-400 p-2 rounded-full font-bold text-xs text-primary">
                            ${product.price.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                        {product.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-5 w-5">
                            <AvatarImage src={product.seller?.profile_image} />
                            <AvatarFallback className="text-xs bg-gray-200">
                                {product.seller?.full_name
                                    ?.charAt(0)
                                    .toUpperCase() || "S"}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">
                            {product.seller?.full_name || "Tiger Seller"}
                        </span>
                    </div>
                </div>
            </Link>
            <div className="px-4 pb-4" onClick={handleActionClick}>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(product.created_at), {
                            addSuffix: true,
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleMessageClick}
                                        disabled={isOwner || checkingSeller}
                                        className={
                                            checkingSeller
                                                ? "animate-pulse"
                                                : ""
                                        }
                                    >
                                        <MessageSquare size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isOwner
                                        ? "This is your product"
                                        : "Message seller"}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        {!isOwner && (
                            <Button
                                variant="default"
                                size="sm"
                                className="bg-tigerGold rounded-full text-tigerBlack hover:bg-tigerGold/90"
                                onClick={handleBuyClick}
                            >
                                <ShoppingCart size={16} className="mr-1" />
                                Buy
                            </Button>
                        )}

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

export default ProductCard;
