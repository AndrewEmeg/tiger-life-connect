
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PurchaseButtonProps {
  itemId: string;
  itemType: "product" | "service";
  title: string;
  description: string;
  price: number;
  sellerId: string;
}

const PurchaseButton = ({ 
  itemId, 
  itemType, 
  title, 
  description, 
  price, 
  sellerId 
}: PurchaseButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please sign in to make a purchase");
      navigate("/auth");
      return;
    }

    if (user.id === sellerId) {
      toast.error("You cannot purchase your own items");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Creating checkout for:", { itemId, itemType, price, title, description, sellerId });
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          itemId,
          itemType,
          price,
          title,
          description: description || "",
          sellerId
        }
      });

      if (error) {
        console.error("Checkout error:", error);
        throw new Error(error.message || "Failed to create checkout session");
      }

      if (!data?.url) {
        throw new Error("No checkout URL returned from server");
      }

      console.log("Checkout successful, redirecting to:", data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Unable to process payment. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePurchase} 
      disabled={isLoading || (user?.id === sellerId)}
      className="w-full mt-4"
      size="lg"
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {isLoading ? "Processing..." : `Purchase - $${price.toFixed(2)}`}
    </Button>
  );
};

export default PurchaseButton;
