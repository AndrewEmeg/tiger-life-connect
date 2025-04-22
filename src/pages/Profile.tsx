
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import { useUserProfile } from "@/hooks/useUserProfile";

const Profile: React.FC = () => {
  const { user, products, services, orders, isLoading } = useUserProfile();

  if (isLoading) {
    return <div className="max-w-5xl mx-auto p-6">Loading...</div>;
  }

  if (!user) {
    return <div className="max-w-5xl mx-auto p-6">Not authenticated</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* User Profile Header */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.user_metadata?.avatar_url || user.profile_image} />
            <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.user_metadata?.full_name || "Tiger Student"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>
      </Card>

      {/* User Content Tabs */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">Products ({products?.length || 0})</TabsTrigger>
          <TabsTrigger value="services">Services ({services?.length || 0})</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={{ ...product, seller: user }}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No products listed yet.</p>
          )}
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          {services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={{ ...service, provider: user }}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No services offered yet.</p>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {order.item?.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {order.item_type.charAt(0).toUpperCase() + order.item_type.slice(1)} - ${order.price}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No orders placed yet.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
