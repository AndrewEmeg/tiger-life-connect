import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Edit, Trash2 } from "lucide-react";
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
    const isOwner = user?.id === product.seller_id;

    const handleActionClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
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
                        <span className="font-bold text-lg text-primary">
                            ${product.price.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {product.description}
                    </p>
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
                        <Button variant="ghost" size="icon" asChild>
                            <Link to={`/messages?to=${product.seller_id}`}>
                                <MessageSquare size={16} />
                            </Link>
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

export default ProductCard;
