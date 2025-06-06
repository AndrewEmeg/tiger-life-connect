import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Message, User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";

const Messages: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const receiverId = params.get("to");
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState("");
    const [receiver, setReceiver] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [receiverNotFound, setReceiverNotFound] = useState(false);
    const [sending, setSending] = useState(false);
    const [conversations, setConversations] = useState<{id: string, user: User}[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(receiverId);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        async function fetchReceiverDetails() {
            if (!selectedConversation) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setReceiverNotFound(false);
            
            try {
                console.log("Fetching receiver details for ID:", selectedConversation);
                
                const { data, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", selectedConversation);
                    
                console.log("Receiver query result:", { data, error });
                
                if (error) {
                    console.error("Error fetching receiver details:", error);
                    setReceiverNotFound(true);
                    toast.error(`Database error: ${error.message}`);
                    return;
                }
                
                if (!data || data.length === 0) {
                    console.error("Receiver not found in database. ID:", selectedConversation);
                    setReceiverNotFound(true);
                    toast.error("User not found in the database");
                    return;
                }
                
                console.log("Receiver found:", data[0]);
                setReceiver(data[0] as User);
            } catch (error) {
                console.error("Exception fetching receiver details:", error);
                setReceiverNotFound(true);
                toast.error("Could not load user details");
            } finally {
                setLoading(false);
            }
        }
        
        fetchReceiverDetails();
    }, [selectedConversation]);
    
    useEffect(() => {
        async function fetchConversations() {
            if (!user) return;
            
            try {
                const { data: sentMessagesData, error: sentError } = await supabase
                    .from("messages")
                    .select("receiver_id")
                    .eq("sender_id", user.id)
                    .order("sent_at", { ascending: false });
                    
                if (sentError) throw sentError;
                
                const { data: receivedMessagesData, error: receivedError } = await supabase
                    .from("messages")
                    .select("sender_id")
                    .eq("receiver_id", user.id)
                    .order("sent_at", { ascending: false });
                    
                if (receivedError) throw receivedError;
                
                const sentUserIds = sentMessagesData.map(msg => msg.receiver_id);
                const receivedUserIds = receivedMessagesData.map(msg => msg.sender_id);
                const uniqueUserIds = [...new Set([...sentUserIds, ...receivedUserIds])];
                
                if (uniqueUserIds.length > 0) {
                    const { data: usersData, error: usersError } = await supabase
                        .from("users")
                        .select("*")
                        .in("id", uniqueUserIds);
                        
                    if (usersError) throw usersError;
                    
                    const conversationsList = usersData.map(userData => ({
                        id: userData.id,
                        user: userData as User
                    }));
                    
                    setConversations(conversationsList);
                    
                    if (receiverId && receiver && !conversationsList.some(conv => conv.id === receiverId)) {
                        setConversations(prev => [...prev, { id: receiverId, user: receiver }]);
                    }
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
                toast.error("Could not load your conversations");
            }
        }
        
        fetchConversations();
    }, [user, receiver, receiverId]);
    
    useEffect(() => {
        async function fetchMessages() {
            if (!user || !selectedConversation) return;
            
            try {
                const { data, error } = await supabase
                    .from("messages")
                    .select("*")
                    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},receiver_id.eq.${user.id})`)
                    .order("sent_at", { ascending: true });
                    
                if (error) throw error;
                setMessages(data || []);
            } catch (error) {
                console.error("Error fetching messages:", error);
                toast.error("Could not load messages");
            }
        }
        
        fetchMessages();
    }, [user, selectedConversation]);
    
    useEffect(() => {
        if (!user || !selectedConversation) return;
        
        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages',
                    filter: `or(and(sender_id=eq.${user.id},receiver_id=eq.${selectedConversation}),and(sender_id=eq.${selectedConversation},receiver_id=eq.${user.id}))` 
                }, 
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages(prevMessages => [...prevMessages, newMessage]);
                }
            )
            .subscribe();
        
        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, selectedConversation]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!messageText.trim() || !user || !selectedConversation || receiverNotFound) return;
        
        const newMessage = {
            id: crypto.randomUUID(),
            content: messageText.trim(),
            sender_id: user.id,
            receiver_id: selectedConversation,
            sent_at: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setMessageText("");
        
        setSending(true);
        try {
            const { error } = await supabase
                .from("messages")
                .insert(newMessage);
                
            if (error) {
                setMessages(prevMessages => 
                    prevMessages.filter(msg => msg.id !== newMessage.id)
                );
                throw error;
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };
    
    const selectConversation = (userId: string) => {
        setSelectedConversation(userId);
    };
    
    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Messages</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 border rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="p-4 bg-gray-50 border-b">
                        <h2 className="font-semibold">Conversations</h2>
                    </div>
                    <div className="divide-y">
                        {conversations.length > 0 ? (
                            conversations.map((conversation) => (
                                <div 
                                    key={conversation.id}
                                    className={`p-3 flex items-center cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation === conversation.id ? 'bg-gray-100' : ''}`}
                                    onClick={() => selectConversation(conversation.id)}
                                >
                                    <Avatar className="h-10 w-10 mr-3">
                                        <AvatarImage src={conversation.user.profile_image} />
                                        <AvatarFallback>
                                            <UserIcon className="h-5 w-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{conversation.user.full_name}</p>
                                    </div>
                                </div>
                            ))
                        ) : receiverId ? null : (
                            <div className="p-4 text-center text-gray-500">
                                No conversations yet
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="md:col-span-3 border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col h-[70vh]">
                    {selectedConversation && receiver ? (
                        <>
                            <div className="p-4 bg-gray-50 border-b flex items-center">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="md:hidden mr-2"
                                    onClick={() => setSelectedConversation(null)}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <Avatar className="h-8 w-8 mr-3">
                                    <AvatarImage src={receiver.profile_image} />
                                    <AvatarFallback>
                                        <UserIcon className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="font-semibold">{receiver.full_name}</h2>
                            </div>
                            
                            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                                {messages.length > 0 ? (
                                    <div className="space-y-4">
                                        {messages.map((message) => {
                                            const isSentByMe = message.sender_id === user?.id;
                                            
                                            return (
                                                <div 
                                                    key={message.id}
                                                    className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div 
                                                        className={`max-w-[75%] rounded-lg p-3 ${isSentByMe 
                                                            ? 'bg-primary text-primary-foreground' 
                                                            : 'bg-gray-200 text-gray-900'
                                                        }`}
                                                    >
                                                        <p className="break-words">{message.content}</p>
                                                        <p className={`text-xs mt-1 ${isSentByMe 
                                                            ? 'text-primary-foreground/70' 
                                                            : 'text-gray-500'
                                                        }`}>
                                                            {format(new Date(message.sent_at), 'h:mm a')}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500">
                                        No messages yet. Start the conversation!
                                    </div>
                                )}
                            </div>
                            
                            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
                                <div className="flex gap-2">
                                    <Textarea
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        placeholder="Type your message..."
                                        className="min-h-[60px] resize-none"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                    <Button 
                                        type="submit" 
                                        size="icon" 
                                        disabled={sending || !messageText.trim() || receiverNotFound}
                                        className="h-[60px] w-[60px]"
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>
                            </form>
                        </>
                    ) : receiverNotFound ? (
                        <div className="h-full flex flex-col items-center justify-center p-4">
                            <p className="text-red-500 mb-2">User not found</p>
                            <p className="text-gray-500 text-center mb-4">
                                The user you're trying to message doesn't exist or has been removed.
                            </p>
                            <Button onClick={() => setSelectedConversation(null)}>
                                Return to Conversations
                            </Button>
                        </div>
                    ) : loading ? (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            Loading...
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 p-4">
                            Select a conversation to start chatting
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
