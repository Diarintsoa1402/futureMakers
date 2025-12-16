import { useEffect, useState, useCallback, useRef } from "react";
import { socket, connectSocket, disconnectSocket } from "../../utils/socket";
import {
  getConversations,
  getMessages,
  getGroups,
  getGroupMessages,
  postMessage,
  
  markAsRead 
} from "../../services/chat";
import ConversationList from "../../components/chat/ConversationList";
import MessageList from "../../components/chat/MessageList";
import ChatInput from "../../components/chat/ChatInput";
import { toast } from "react-hot-toast";
import {
  MessageCircle,
  Users,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  Search,
  Loader2
} from "lucide-react";

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("conversations");

  // Refs optimisées
  const selectedConversationRef = useRef(selectedConversation);
  const selectedGroupRef = useRef(selectedGroup);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
    selectedGroupRef.current = selectedGroup;
  }, [selectedConversation, selectedGroup]);

  // Charger l'utilisateur connecté
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("fm_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        } else {
          setError("Utilisateur non authentifié");
        }
      } catch (err) {
        setError("Erreur de session");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Configuration Socket.IO
  useEffect(() => {
    if (!user) return;

    const setupSocket = () => {
      // Écouteurs de connexion
      socket.on("connect", () => {
        setConnectionStatus("connected");
        toast.success("Connecté au chat");
      });

      socket.on("disconnect", () => {
        setConnectionStatus("disconnected");
        toast.error("Déconnecté du chat");
      });

      socket.on("connect_error", () => {
        setConnectionStatus("error");
        toast.error("Erreur de connexion au chat");
      });

      // Écouteurs de messages
      socket.on("onlineUsers", setOnlineUsers);

      socket.on("receiveMessage", handleReceiveMessage);

      socket.on("receiveGroupMessage", handleReceiveGroupMessage);

      socket.on("error", (err) => {
        console.error("Socket error:", err);
        toast.error("Erreur de connexion au serveur");
      });
    };

    const initializeChat = async () => {
      try {
        setLoading(true);
        connectSocket(user.id);
        setupSocket();
        await loadInitialData();
      } catch (err) {
        setError("Erreur de chargement du chat");
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      // Nettoyage des écouteurs
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("onlineUsers");
      socket.off("receiveMessage");
      socket.off("receiveGroupMessage");
      socket.off("error");
      disconnectSocket();
    };
  }, [user]);

  // Gestion des messages reçus
  const handleReceiveMessage = useCallback((msg) => {
    // Mise à jour des conversations
    setConversations(prev => 
      prev.map(conv =>
        conv.id === msg.conversationId
          ? {
              ...conv,
              lastMessage: msg.content,
              lastMessageAt: msg.createdAt,
              unreadCount: conv.id !== selectedConversationRef.current?.id ? (conv.unreadCount || 0) + 1 : conv.unreadCount,
            }
          : conv
      ).sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt))
    );

    // Ajout du message si conversation active
    if (msg.conversationId === selectedConversationRef.current?.id) {
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      
      if (document.hasFocus() && msg.senderId !== user.id) {
        markAsRead(msg.conversationId).catch(console.error);
      }
    } else if (msg.senderId !== user.id) {
      toast.success(`💬 ${msg.sender?.name || "Quelqu'un"}: ${msg.content?.substring(0, 30)}${msg.content?.length > 30 ? '...' : ''}`);
    }
  }, [user]);

  const handleReceiveGroupMessage = useCallback((msg) => {
    if (msg.groupId === selectedGroupRef.current) {
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
    } else if (msg.senderId !== user.id) {
      const group = groups.find(g => g.id === msg.groupId);
      toast.success(`💬 ${group?.name || 'Groupe'}: Nouveau message`);
    }
  }, [user, groups]);

  // Chargement des données initiales
  const loadInitialData = useCallback(async () => {
    try {
      const [conversationsData, groupsData] = await Promise.all([
        getConversations().then(res => res.data || []),
        getGroups().then(res => res.data || [])
      ]);
      
      setConversations(conversationsData);
      setGroups(groupsData);
    } catch (err) {
      console.error("Erreur chargement données:", err);
      toast.error("Impossible de charger les données");
    }
  }, []);

  // Rafraîchissement
  const handleRefresh = useCallback(async () => {
    try {
      await loadInitialData();
      toast.success("Listes actualisées");
    } catch (err) {
      console.error("Erreur rafraîchissement:", err);
    }
  }, [loadInitialData]);

  // Ouvrir une conversation
  const openConversation = useCallback(async (conversation) => {
    try {
      setSelectedGroup(null);
      setSelectedConversation(conversation);
      setLoading(true);

      const { data } = await getMessages(conversation.id);
      setMessages(data || []);

      // Marquer comme lu si nécessaire
      if (conversation.unreadCount > 0) {
        await markAsRead(conversation.id);
        setConversations(prev =>
          prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c)
        );
      }
    } catch (err) {
      console.error("Erreur ouverture conversation:", err);
      toast.error("Impossible de charger les messages");
    } finally {
      setLoading(false);
    }
  }, []);

  // Rejoindre un groupe
  const joinGroup = useCallback(async (group) => {
    try {
      setSelectedConversation(null);
      setSelectedGroup(group.id);
      setLoading(true);

      socket.emit("joinGroup", group.id);
      const { data } = await getGroupMessages(group.id);
      setMessages(data || []);
    } catch (err) {
      console.error("Erreur rejoindre groupe:", err);
      toast.error("Impossible de charger les messages");
    } finally {
      setLoading(false);
    }
  }, []);

  // Envoi de messages
  const handleSendMessage = useCallback(async (text, file) => {
    if (!user || !selectedConversation || (!text && !file) || sending) return;

    try {
      setSending(true);
      
      const fileUrl = file ? await uploadFile(file) : null;
      
      const payload = {
        conversationId: selectedConversation.id,
        senderId: user.id,
        receiverId: selectedConversation.otherUser.id,
        content: text?.trim() || null,
        fileUrl,
      };

      socket.emit("sendMessage", payload);
      const { data: savedMessage } = await postMessage(payload);

      // Mise à jour optimiste
      setMessages(prev => [...prev, {
        ...savedMessage,
        sender: { id: user.id, name: user.name, avatarUrl: user.avatarUrl },
      }]);

      // Mise à jour de la conversation
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: text || "📎 Fichier", lastMessageAt: new Date() }
            : conv
        ).sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt))
      );

    } catch (err) {
      console.error("Erreur envoi message:", err);
      toast.error("Échec de l'envoi");
    } finally {
      setSending(false);
    }
  }, [user, selectedConversation, sending]);

  const handleSendGroupMessage = useCallback(async (text, file) => {
    if (!user || !selectedGroup || (!text && !file) || sending) return;

    try {
      setSending(true);

      const fileUrl = file ? await uploadFile(file) : null;

      const payload = {
        groupId: selectedGroup,
        senderId: user.id,
        content: text?.trim() || null,
        fileUrl,
      };

      socket.emit("sendGroupMessage", payload);
      const { data: savedMessage } = await postMessage(payload);

      setMessages(prev => [...prev, {
        ...savedMessage,
        sender: { id: user.id, name: user.name, avatarUrl: user.avatarUrl },
      }]);

    } catch (err) {
      console.error("Erreur envoi message groupe:", err);
      toast.error("Échec de l'envoi");
    } finally {
      setSending(false);
    }
  }, [user, selectedGroup, sending]);

  // Helper pour upload fichier
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await uploadFile(formData);
    return data.fileUrl;
  };

  // États d'affichage
  if (loading && !user) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const currentMessages = selectedConversation || selectedGroup ? messages : [];
  const chatTitle = selectedConversation?.otherUser?.name || 
                   groups.find(g => g.id === selectedGroup)?.name || "";

  const isOnline = selectedConversation ? 
                  onlineUsers.includes(selectedConversation.otherUser.id) : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto p-6">
        <Header 
          connectionStatus={connectionStatus}
          onlineUsers={onlineUsers}
          onRefresh={handleRefresh}
        />
        
        <ChatContainer>
          <Sidebar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            conversations={conversations}
            groups={groups}
            onlineUsers={onlineUsers}
            selectedConversation={selectedConversation}
            selectedGroup={selectedGroup}
            onSelectConversation={openConversation}
            onSelectGroup={joinGroup}
            onRefresh={handleRefresh}
          />
          
          <ChatArea
            loading={loading}
            selectedConversation={selectedConversation}
            selectedGroup={selectedGroup}
            messages={currentMessages}
            chatTitle={chatTitle}
            isOnline={isOnline}
            connectionStatus={connectionStatus}
            userId={user?.id}
            onSendMessage={handleSendMessage}
            onSendGroupMessage={handleSendGroupMessage}
            sending={sending}
          />
        </ChatContainer>
      </div>
    </div>
  );
}

// Composants de présentation séparés pour plus de clarté
const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-600 text-lg">Chargement du chat...</p>
    </div>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-8">
      <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">Erreur</h3>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all"
      >
        Recharger la page
      </button>
    </div>
  </div>
);

const Header = ({ connectionStatus, onlineUsers, onRefresh }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-lg">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messagerie</h1>
          <ConnectionStatus 
            connectionStatus={connectionStatus} 
            onlineUsers={onlineUsers} 
          />
        </div>
      </div>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Actualiser
      </button>
    </div>
  </div>
);

const ConnectionStatus = ({ connectionStatus, onlineUsers }) => (
  <div className="flex items-center gap-3 mt-1">
    <div className={`flex items-center gap-1 text-sm ${
      connectionStatus === "connected" ? "text-emerald-600" : 
      connectionStatus === "connecting" ? "text-amber-600" : "text-rose-600"
    }`}>
      {connectionStatus === "connected" ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
      <span className="capitalize">
        {connectionStatus === "connected" ? "Connecté" :
         connectionStatus === "connecting" ? "Connexion..." : "Déconnecté"}
      </span>
    </div>
    <span className="text-sm text-gray-600">
      {onlineUsers.length} en ligne
    </span>
  </div>
);

const ChatContainer = ({ children }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
    <div className="flex h-[75vh]">
      {children}
    </div>
  </div>
);

const Sidebar = ({ 
  searchTerm, 
  onSearchChange, 
  activeTab, 
  onTabChange, 
  conversations, 
  groups, 
  onlineUsers, 
  selectedConversation, 
  selectedGroup, 
  onSelectConversation, 
  onSelectGroup, 
  onRefresh 
}) => (
  <div className="w-96 border-r border-gray-200 flex flex-col">
    <div className="p-4 border-b border-gray-200">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
    </div>

    <Tabs activeTab={activeTab} onTabChange={onTabChange} conversations={conversations} groups={groups} />
    
    <div className="flex-1 overflow-y-auto">
      <ConversationList
        convs={activeTab === "conversations" ? conversations : []}
        groups={activeTab === "groups" ? groups : []}
        online={onlineUsers}
        selectedConvId={selectedConversation?.id}
        selectedGroupId={selectedGroup}
        onSelectConv={onSelectConversation}
        onSelectGroup={onSelectGroup}
        onRefresh={onRefresh}
        searchTerm={searchTerm}
        activeTab={activeTab}
      />
    </div>
  </div>
);

const Tabs = ({ activeTab, onTabChange, conversations, groups }) => (
  <div className="flex border-b border-gray-200">
    <TabButton
      active={activeTab === "conversations"}
      onClick={() => onTabChange("conversations")}
      icon={MessageCircle}
      label="Conversations"
      count={conversations.length}
    />
    <TabButton
      active={activeTab === "groups"}
      onClick={() => onTabChange("groups")}
      icon={Users}
      label="Groupes"
      count={groups.length}
    />
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-4 text-center font-medium transition-colors ${
      active ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"
    }`}
  >
    <div className="flex items-center justify-center gap-2">
      <Icon className="w-4 h-4" />
      {label}
      {count > 0 && (
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
          {count}
        </span>
      )}
    </div>
  </button>
);

const ChatArea = ({ 
  loading, 
  selectedConversation, 
  selectedGroup, 
  messages, 
  chatTitle, 
  isOnline, 
  connectionStatus, 
  userId, 
  onSendMessage, 
  onSendGroupMessage, 
  sending 
}) => {
  if (loading && (selectedConversation || selectedGroup)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  if (selectedConversation || selectedGroup) {
    return (
      <div className="flex-1 flex flex-col">
        <MessageList
          userId={userId}
          messages={messages}
          title={chatTitle}
          isOnline={isOnline}
          connectionStatus={connectionStatus}
        />
        <ChatInput
          onSend={selectedConversation ? onSendMessage : onSendGroupMessage}
          disabled={sending || connectionStatus !== "connected"}
          placeholder={
            connectionStatus !== "connected" 
              ? "Connexion en cours..." 
              : sending 
              ? "Envoi en cours..." 
              : "Écrivez votre message..."
          }
        />
      </div>
    );
  }

  return <EmptyState />;
};

const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
    <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
    <h3 className="text-xl font-semibold text-gray-400 mb-2">
      Bienvenue dans la messagerie
    </h3>
    <p className="text-center text-gray-500 max-w-md">
      Sélectionnez une conversation ou un groupe pour commencer à discuter
    </p>
  </div>
);