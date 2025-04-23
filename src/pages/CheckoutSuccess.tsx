
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Order } from "@/types";

const CheckoutSuccess: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [orderDetails, setOrderDetails] = useState<Partial<Order> | null>(null);
  
  // Get session_id from URL query params
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    async function verifyAndRecordOrder() {
      if (!sessionId) {
        setIsVerifying(false);
        toast.error("No session ID found in the URL");
        return;
      }

      try {
        console.log("Verifying order with session ID:", sessionId);
        
        // Check if this order was already recorded and completed
        const { data: existingOrders, error: checkError } = await supabase
          .from("orders")
          .select("*")
          .eq("stripe_session_id", sessionId);

        if (checkError) {
          console.error("Error checking for existing order:", checkError);
          throw checkError;
        }

        console.log("Existing orders found:", existingOrders?.length || 0);

        // If order exists and is already completed, just display it
        const completedOrder = existingOrders?.find(order => order.status === "completed");
        if (completedOrder) {
          console.log("Found completed order:", completedOrder);
          setOrderDetails({
            ...completedOrder,
            status: completedOrder.status as "processing" | "completed" | "cancelled",
            item_type: completedOrder.item_type as "product" | "service"
          });
          setIsVerifying(false);
          return;
        }

        // If we're here, we need to update order status from "processing" to "completed"
        // First get the processing order with this session ID
        const processingOrder = existingOrders?.find(order => order.status === "processing");
        
        if (!processingOrder) {
          console.error("No processing order found with session ID:", sessionId);
          toast.error("Could not find your order details");
          setIsVerifying(false);
          return;
        }

        console.log("Updating order status to completed for:", processingOrder.id);

        // Update the order status to "completed"
        const { data: updatedOrder, error: updateError } = await supabase
          .from("orders")
          .update({ status: "completed" })
          .eq("id", processingOrder.id)
          .eq("stripe_session_id", sessionId)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating order status:", updateError);
          throw updateError;
        }

        if (updatedOrder) {
          console.log("Order successfully updated:", updatedOrder);
          // Cast status to expected type since we know what values are stored in database
          setOrderDetails({
            ...updatedOrder,
            status: updatedOrder.status as "processing" | "completed" | "cancelled",
            item_type: updatedOrder.item_type as "product" | "service"
          });
          toast.success("Your order has been successfully completed!");
        } else {
          toast.error("Could not update your order status.");
        }
      } catch (error) {
        console.error("Error verifying order:", error);
        toast.error("Failed to verify your order. Please contact support.");
      } finally {
        setIsVerifying(false);
      }
    }

    verifyAndRecordOrder();
  }, [sessionId, user]);

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isVerifying ? (
              <Loader2 className="h-16 w-16 text-gray-400 animate-spin" />
            ) : (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isVerifying ? "Verifying Payment..." : "Payment Successful!"}
          </CardTitle>
          <CardDescription>
            {isVerifying 
              ? "Please wait while we verify your payment."
              : "Thank you for your purchase. Your order has been received."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm">
              Order Reference: <span className="font-medium">{sessionId?.substring(0, 14) || "N/A"}</span>
            </p>
            {orderDetails && (
              <>
                <p className="text-sm mt-1">
                  Item Type: <span className="font-medium capitalize">{orderDetails.item_type}</span>
                </p>
                <p className="text-sm mt-1">
                  Amount: <span className="font-medium">${orderDetails.price?.toFixed(2)}</span>
                </p>
                <p className="text-sm mt-1">
                  Status: <span className="font-medium capitalize">{orderDetails.status}</span>
                </p>
              </>
            )}
            <p className="text-sm mt-1">
              The seller has been notified and will be in touch with you soon.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link to="/profile">View Your Orders</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CheckoutSuccess;
