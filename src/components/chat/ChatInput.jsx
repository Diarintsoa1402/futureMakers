import { useState, useRef } from "react";
import { Paperclip, Send, Image, File, X, Mic, Smile } from "lucide-react";

export default function ChatInput({ onSend, disabled, placeholder }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSend = () => {
    if ((!text.trim() && !file) || disabled) return;
    onSend(text, file);
    setText("");
    setFile(null);
    // Réinitialiser la hauteur du textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      // Vérifier la taille du fichier (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("Le fichier est trop volumineux (max 10MB)");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    
    // Ajuster automatiquement la hauteur
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const getFileIcon = (file) => {
    if (!file) return null;
    
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  const getFilePreview = (file) => {
    if (!file) return null;
    
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const filePreview = getFilePreview(file);

  return (
    <div 
      className={`p-4 border-t bg-white transition-colors ${
        isDragging ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Aperçu du fichier */}
      {file && (
        <div className="flex items-center gap-3 mb-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3 flex-1">
            {filePreview ? (
              <img 
                src={filePreview} 
                alt="Aperçu" 
                className="w-12 h-12 object-cover rounded-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                {getFileIcon(file)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-blue-900 truncate">
                {file.name}
              </div>
              <div className="text-xs text-blue-600">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </div>
            </div>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3">
        {/* Bouton fichier */}
        <label className={`cursor-pointer p-2 rounded-xl transition-colors flex-shrink-0 ${
          disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
        }`}>
          <Paperclip className="w-5 h-5" />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            disabled={disabled}
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          />
        </label>

        {/* Zone de texte avec textarea adaptable */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Écrivez votre message..."}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={disabled}
            rows="1"
            style={{
              minHeight: '48px',
              maxHeight: '120px'
            }}
          />
          
          {/* Indicateur de drag & drop */}
          {isDragging && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-xl bg-blue-50/80 flex items-center justify-center z-10">
              <div className="text-blue-600 text-sm font-medium flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Déposez le fichier ici
              </div>
            </div>
          )}
        </div>

        {/* Bouton d'envoi */}
        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !file)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Barre d'information et conseils */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="bg-gray-200 px-1 rounded text-xs">⏎</span>
            Envoyer
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-gray-200 px-1 rounded text-xs">⇧⏎</span>
            Saut de ligne
          </span>
          <span className="flex items-center gap-1">
            <Paperclip className="w-3 h-3" />
            Fichiers (10MB max)
          </span>
        </div>
        
        <div className={`text-xs ${
          text.length > 900 ? 'text-amber-600' : 'text-gray-500'
        }`}>
          {text.length}/1000
        </div>
      </div>
    </div>
  );
}