
import React from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="h-48 overflow-hidden">
        <img 
          src={product.image_url || "/placeholder.svg"} 
          alt={product.title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate">{product.title}</h3>
          <span className="font-bold text-lg text-primary">${product.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{product.description}</p>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(product.created_at), { addSuffix: true })}
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-600 hover:text-primary">
              <MessageSquare size={16} />
            </button>
            <Link 
              to={`/marketplace/${product.id}`}
              className="bg-primary/90 text-black text-xs px-3 py-1 rounded-full hover:bg-primary"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
