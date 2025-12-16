import { useState, useEffect } from "react";
import { getUsers, getOrCreateConversation } from "../../services/chat";
import { PlusCircle, Search, X, Users, MessageCircle, Clock, Crown, UserPlus, Loader2 } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

export default function ConversationList({
  convs,
  groups,
  online,
  selectedConvId,
  selectedGroupId,
  onSelectConv,
  onSelectGroup,
  onRefresh,
  searchTerm,
  activeTab
}) {
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Charger les utilisateurs quand on clique sur "Nouvelle"
  useEffect(() => {
    if (showUsers) {
      setLoadingUsers(true);
      getUsers()
        .then(({ data }) => setUsers(data))
        .catch((err) => console.error("Erreur chargement users:", err))
        .finally(() => setLoadingUsers(false));
    }
  }, [showUsers]);

  const startConversation = async (user) => {
    try {
      const { data } = await getOrCreateConversation({ otherUserId: user.id });
      setShowUsers(false);
      setSearch("");
      onSelectConv(data);
      onRefresh();
    } catch (err) {
      console.error("Erreur création conversation:", err);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return date.toLocaleDateString('fr-FR');
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  // Filtrer les conversations et groupes basé sur searchTerm
  const filteredConvs = convs.filter(conv =>
    conv.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Mode affichage utilisateurs pour démarrer une conversation */}
      {showUsers ? (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-lg">Nouvelle conversation</h3>
            <button 
              onClick={() => {
                setShowUsers(false);
                setSearch("");
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un contact..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {loadingUsers ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun contact trouvé</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => startConversation(u)}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(u.name)}
                    </div>
                    {online.includes(u.id) && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {u.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {u.email || "Membre de la plateforme"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* En-tête avec boutons d'action */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">Messages</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUsers(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all text-sm font-medium"
                >
                  <PlusCircle className="w-4 h-4" />
                  Nouvelle
                </button>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{convs.length} conversation{convs.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{groups.length} groupe{groups.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>{online.length} en ligne</span>
              </div>
            </div>
          </div>

          {/* Liste des conversations */}
          {activeTab === "conversations" && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {filteredConvs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p className="font-medium text-gray-900 mb-1">
                      {searchTerm ? "Aucune conversation trouvée" : "Aucune conversation"}
                    </p>
                    <p className="text-sm">
                      {searchTerm ? "Essayez une autre recherche" : "Commencez une nouvelle conversation"}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => setShowUsers(true)}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Démarrer une conversation
                      </button>
                    )}
                  </div>
                ) : (
                  filteredConvs.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onSelectConv(c)}
                      className={`p-3 cursor-pointer rounded-xl transition-all duration-200 mb-1 ${
                        selectedConvId === c.id 
                          ? "bg-blue-50 border border-blue-200" 
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {getInitials(c.otherUser?.name)}
                          </div>
                          {online.includes(c.otherUser?.id) && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold text-gray-900 truncate">
                              {c.otherUser?.name}
                            </div>
                            <div className="flex items-center gap-2">
                              {c.lastMessageAt && (
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatTime(c.lastMessageAt)}
                                </span>
                              )}
                              {c.unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-medium">
                                  {c.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {c.lastMessage || "Aucun message"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Liste des groupes */}
          {activeTab === "groups" && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {filteredGroups.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p className="font-medium text-gray-900 mb-1">
                      {searchTerm ? "Aucun groupe trouvé" : "Aucun groupe"}
                    </p>
                    <p className="text-sm">
                      {searchTerm ? "Essayez une autre recherche" : "Créez votre premier groupe"}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => setShowGroupModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Créer un groupe
                      </button>
                    )}
                  </div>
                ) : (
                  filteredGroups.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => onSelectGroup(g)}
                      className={`p-3 cursor-pointer rounded-xl transition-all duration-200 mb-1 ${
                        selectedGroupId === g.id
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                          <Users className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold text-gray-900 truncate flex items-center gap-2">
                              {g.name}
                              {g.isAdmin && (
                                <Crown className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {g.lastMessageAt && (
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatTime(g.lastMessageAt)}
                                </span>
                              )}
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {g.memberCount || 1}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {g.description || "Aucune description"}
                          </div>
                          
                          {g.lastMessage && (
                            <div className="text-xs text-gray-500 mt-1 truncate">
                              Dernier message: {g.lastMessage}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showGroupModal && (
        <CreateGroupModal
          onClose={() => setShowGroupModal(false)}
          onGroupCreated={(group) => {
            onRefresh();
            onSelectGroup(group);
          }}
        />
      )}
    </>
  );
}