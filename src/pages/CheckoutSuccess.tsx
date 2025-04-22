
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const CheckoutSuccess: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Get session_id from URL query params
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get("session_id");

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase. Your order has been received.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm">
              Order Reference: <span className="font-medium">{sessionId?.substring(0, 14) || "N/A"}</span>
            </p>
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
