import React, { useState, useEffect } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/ProductCard";
import ProductForm from "@/components/ProductForm";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const Marketplace: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "price_asc" | "price_desc">("recent");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [validatingProducts, setValidatingProducts] = useState(false);
  const isMobile = useIsMobile();

  const { products, isLoading, createProduct, updateProduct, deleteProduct } = useProducts();

  useEffect(() => {
    const validateSellers = async () => {
      if (!products.length) return;
      setValidatingProducts(true);
      try {
        const sellerIds = [...new Set(products.map(product => product.seller_id))];
        const { data, error } = await supabase
          .from("users")
          .select("id")
          .in("id", sellerIds);
        if (error) {
          console.error("Error validating sellers:", error);
          return;
        }
        const validSellerIds = new Set((data || []).map(seller => seller.id));
        const invalidProducts = products.filter(
          product => !validSellerIds.has(product.seller_id)
        );
        if (invalidProducts.length > 0) {
          console.warn("Found products with invalid seller IDs:", 
            invalidProducts.map(p => ({ id: p.id, seller_id: p.seller_id, title: p.title }))
          );
        }
      } catch (error) {
        console.error("Error in seller validation:", error);
      } finally {
        setValidatingProducts(false);
      }
    };
    validateSellers();
  }, [products]);

  const handleCreateProduct = (data: Omit<Product, "id" | "created_at" | "seller_id" | "is_active">) => {
    createProduct.mutate(data);
  };

  const handleUpdateProduct = (data: Omit<Product, "id" | "created_at" | "seller_id" | "is_active">) => {
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, ...data });
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(id);
    }
  };

  const filteredProducts = products
    .filter(product => 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <div className="flex gap-4">
          <div className="relative flex-1 md:min-w-[300px]">
            <Input
              type="text"
              placeholder="Search listings..."
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
            Add Item
          </Button>
        </div>
      </header>

      <div className="mb-8">
        <div className="bg-white p-0 sm:p-0 md:p-4 rounded-lg shadow-sm mb-6">
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 m-2">
                  <SlidersHorizontal size={18} />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuItem
                  onClick={() => setSortBy("recent")}
                  className={sortBy === "recent" ? "font-semibold text-tigerGold" : ""}
                >
                  Recent
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("price_asc")}
                  className={sortBy === "price_asc" ? "font-semibold text-tigerGold" : ""}
                >
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("price_desc")}
                  className={sortBy === "price_desc" ? "font-semibold text-tigerGold" : ""}
                >
                  Price: High to Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex flex-wrap gap-2 p-4">
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
          )}
        </div>
      </div>

      {isLoading || validatingProducts ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => {
                setEditingProduct(product);
                setIsFormOpen(true);
              }}
              onDelete={() => handleDeleteProduct(product.id)}
            />
          ))}
        </div>
      )}

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct || undefined}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
      />
    </div>
  );
};

export default Marketplace;
