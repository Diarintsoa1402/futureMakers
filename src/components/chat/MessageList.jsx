import { useEffect, useRef } from "react";
import { Check, CheckCheck, Clock, Image, File, Download, User, Crown } from "lucide-react";

export default function MessageList({ userId, messages, title, isOnline, connectionStatus }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  const getMessageStatus = (message) => {
    if (message.senderId !== userId) return null;
    
    if (message.readAt) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    } else if (message.deliveredAt) {
      return <CheckCheck className="w-3 h-3 text-gray-400" />;
    } else if (message.sentAt) {
      return <Check className="w-3 h-3 text-gray-400" />;
    } else {
      return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getFileType = (fileUrl) => {
    if (!fileUrl) return 'unknown';
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return 'image';
    } else if (['pdf'].includes(extension)) {
      return 'pdf';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'document';
    } else if (['zip', 'rar'].includes(extension)) {
      return 'archive';
    } else {
      return 'file';
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'pdf':
        return <File className="w-4 h-4" />;
      case 'document':
        return <File className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* En-tête de conversation */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                {getInitials(title)}
              </div>
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{title}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {isOnline ? (
                  <>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>En ligne</span>
                  </>
                ) : (
                  <span>Hors ligne</span>
                )}
              </div>
            </div>
          </div>
          
          {connectionStatus && connectionStatus !== "connected" && (
            <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
              connectionStatus === "connecting" 
                ? "bg-amber-100 text-amber-700" 
                : "bg-rose-100 text-rose-700"
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === "connecting" ? "bg-amber-500" : "bg-rose-500"
              } animate-pulse`}></div>
              <span className="capitalize">
                {connectionStatus === "connecting" ? "Connexion..." : "Déconnecté"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-blue-50/30 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <div className="text-3xl">💬</div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Aucun message</h3>
            <p className="text-center max-w-sm text-gray-600">
              Envoyez le premier message pour commencer la conversation
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Séparateur de date */}
                <div className="flex justify-center mb-4">
                  <div className="bg-white px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 shadow-sm">
                    {formatDate(date)}
                  </div>
                </div>

                {/* Messages de la date */}
                <div className="space-y-3">
                  {dateMessages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`flex gap-2 ${
                        message.senderId === userId ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Avatar pour les messages reçus */}
                      {message.senderId !== userId && (
                        message.sender?.avatarUrl ? (
                          <img
                            src={message.sender.avatarUrl}
                            alt={message.sender?.name || "Avatar"}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-1">
                            {getInitials(message.sender?.name)}
                          </div>
                        )
                      )}

                      <div className={`max-w-xs lg:max-w-md ${
                        message.senderId === userId ? "ml-12" : "mr-12"
                      }`}>
                        {/* Nom de l'expéditeur pour les messages de groupe */}
                        {message.senderId !== userId && message.sender?.name && (
                          <div className="text-xs text-gray-500 mb-1 px-1">
                            {message.sender.name}
                            {message.sender?.isAdmin && (
                              <Crown className="w-3 h-3 text-amber-500 inline ml-1" />
                            )}
                          </div>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            message.senderId === userId
                              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                              : "bg-white text-gray-900 border border-gray-200"
                          }`}
                        >
                          {/* Fichier joint */}
                          {message.fileUrl && (
                            <div className="mb-3 -mx-2 -mt-2">
                              {getFileType(message.fileUrl) === 'image' ? (
                                <div className="rounded-lg overflow-hidden border border-gray-200">
                                  <img
                                    src={message.fileUrl}
                                    alt="Fichier joint"
                                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(message.fileUrl, '_blank')}
                                  />
                                </div>
                              ) : (
                                <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                                  message.senderId === userId 
                                    ? 'bg-blue-500/20 border-blue-400' 
                                    : 'bg-gray-100 border-gray-300'
                                }`}>
                                  {getFileIcon(getFileType(message.fileUrl))}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                      Fichier joint
                                    </div>
                                    <div className="text-xs opacity-75">
                                      {getFileType(message.fileUrl).toUpperCase()}
                                    </div>
                                  </div>
                                  <a
                                    href={message.fileUrl}
                                    download
                                    className={`p-2 rounded-lg transition-colors ${
                                      message.senderId === userId
                                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                    }`}
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Contenu du message */}
                          {message.content && (
                            <div className="whitespace-pre-wrap break-words leading-relaxed">
                              {message.content}
                            </div>
                          )}

                          {/* Métadonnées du message */}
                          <div className={`flex items-center justify-between gap-4 mt-2 text-xs ${
                            message.senderId === userId ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span>{formatTime(message.createdAt)}</span>
                            <div className="flex items-center gap-1">
                              {getMessageStatus(message)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Espace pour aligner les messages envoyés */}
                      {message.senderId === userId && (
                        <div className="w-8 flex-shrink-0"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}