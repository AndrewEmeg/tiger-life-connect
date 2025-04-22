import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Link } from "react-router-dom";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import { User } from "@/types";

const Profile: React.FC = () => {
  const { user, products, services, orders, isLoading } = useUserProfile();

  if (isLoading) {
    return <div className="max-w-5xl mx-auto p-6">Loading...</div>;
  }

  if (!user) {
    return <div className="max-w-5xl mx-auto p-6">Not authenticated</div>;
  }

  // Enhanced type-safe extraction of user details
  const displayName = 
    (user as User).full_name || 
    user.user_metadata?.full_name || 
    (user.email?.split('@')[0] || "Tiger Student");
  
  const avatarUrl = 
    (user as User).profile_image || 
    user.user_metadata?.profile_image || 
    user.user_metadata?.avatar_url || 
    null;
  
  const joinedDate = (user as User).joined_at || user.created_at;
  
  const isAdmin = 
    (user as User).is_admin || 
    user.user_metadata?.is_admin === true || 
    user.app_metadata?.is_admin === true;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* User Profile Header */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <ProfileImageUpload 
            imageUrl={avatarUrl} 
            size="lg"
          />
          <div>
            <CardTitle className="text-2xl">{displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Joined {joinedDate ? formatDistanceToNow(new Date(joinedDate), { addSuffix: true }) : "recently"}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {isAdmin && (
              <Badge className="mt-2 bg-tigerGold text-tigerBlack">Admin</Badge>
            )}
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
                  product={{ 
                    ...product, 
                    // Create a minimal seller object with required properties
                    seller: {
                      id: user.id,
                      email: user.email,
                      full_name: displayName,
                      joined_at: joinedDate || new Date().toISOString(),
                      is_admin: isAdmin
                    }
                  }}
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
                  service={{ 
                    ...service,
                    // Create a minimal provider object with required properties
                    provider: {
                      id: user.id,
                      email: user.email,
                      full_name: displayName,
                      joined_at: joinedDate || new Date().toISOString(),
                      is_admin: isAdmin
                    }
                  }}
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
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {order.item?.image_url && (
                        <div className="w-full md:w-48 h-36 overflow-hidden">
                          <img
                            src={order.item.image_url || "/placeholder.svg"}
                            alt={order.item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4 flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                          <h3 className="text-lg font-medium">{order.item?.title}</h3>
                          <div className="flex items-center space-x-2 mt-1 md:mt-0">
                            <span className="font-medium">${order.price.toFixed(2)}</span>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {order.item?.description}
                        </p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Order #{order.id.substring(0, 8)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium">
                              {order.buyer_id === user.id ? 'You purchased' : 'You sold'} this {order.item_type}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
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
