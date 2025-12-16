import { useState, useEffect, useMemo } from "react";
import { 
  requestMentor, 
  getAvailableMentors 
} from "../../services/mentorship";
import { 
  Search, 
  Users, 
  MessageCircle, 
  Send, 
  Award, 
  Briefcase,
  Star,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Filter,
  X
} from "lucide-react";

export default function RequestMentor() {
  const [message, setMessage] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("");
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExpertise, setFilterExpertise] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Charger la liste des mentors au montage du composant
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await getAvailableMentors();
        setMentors(response.data || []);
      } catch (err) {
        console.error("Erreur lors du chargement des mentors:", err);
        setFeedback("Erreur lors du chargement des mentors");
      }
    };

    fetchMentors();
  }, []);

  // Filtrer les mentors
  useEffect(() => {
    let filtered = mentors;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(mentor =>
        mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.expertise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par expertise
    if (filterExpertise !== "all") {
      filtered = filtered.filter(mentor => 
        mentor.expertise?.toLowerCase() === filterExpertise.toLowerCase()
      );
    }

    setFilteredMentors(filtered);
  }, [mentors, searchTerm, filterExpertise]);

  // Liste des expertises uniques
  const expertises = useMemo(() => {
    const allExpertises = mentors
      .map(mentor => mentor.expertise)
      .filter(Boolean)
      .map(expertise => expertise.toLowerCase());
    return [...new Set(allExpertises)];
  }, [mentors]);

  const handleSubmit = async () => {
    if (!selectedMentor) {
      setFeedback("Veuillez sélectionner un mentor");
      return;
    }

    if (!message.trim()) {
      setFeedback("Veuillez écrire un message");
      return;
    }

    setLoading(true);
    try {
      await requestMentor({
        message: message.trim(),
        mentorId: Number(selectedMentor),
      });
      setFeedback("Demande de mentorat envoyée avec succès !");
      setMessage("");
      setSelectedMentor("");
    } catch (err) {
      setFeedback(err?.response?.data?.message || "Erreur lors de l'envoi de la demande");
    } finally {
      setLoading(false);
    }
  };

  const selectedMentorData = mentors.find(mentor => mentor.id === Number(selectedMentor));

  const resetFilters = () => {
    setSearchTerm("");
    setFilterExpertise("all");
  };

  const hasActiveFilters = searchTerm || filterExpertise !== "all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Demande de Mentorat
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Connectez-vous avec des mentors expérimentés pour accélérer votre croissance professionnelle
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Liste des mentors */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Mentors Disponibles
                </h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {filteredMentors.length}
                </span>
              </div>

              {/* Barre de recherche */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un mentor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Filtres */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700"
                  >
                    <Filter className="w-4 h-4" />
                    Filtres
                    {hasActiveFilters && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </button>
                  
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>

                {showFilters && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <select
                      value={filterExpertise}
                      onChange={(e) => setFilterExpertise(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-sm"
                    >
                      <option value="all">Toutes les expertises</option>
                      {expertises.map((expertise, index) => (
                        <option key={index} value={expertise}>
                          {expertise.charAt(0).toUpperCase() + expertise.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Liste des mentors */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredMentors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun mentor trouvé</p>
                    {hasActiveFilters && (
                      <button
                        onClick={resetFilters}
                        className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                      >
                        Voir tous les mentors
                      </button>
                    )}
                  </div>
                ) : (
                  filteredMentors.map((mentor) => (
                    <div
                      key={mentor.id}
                      onClick={() => setSelectedMentor(mentor.id.toString())}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedMentor === mentor.id.toString()
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {mentor.name?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {mentor.name}
                          </h3>
                          {mentor.expertise && (
                            <div className="flex items-center gap-1 mt-1">
                              <Briefcase className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-600 capitalize">
                                {mentor.expertise}
                              </span>
                            </div>
                          )}
                          {mentor.experience && (
                            <div className="flex items-center gap-1 mt-1">
                              <Award className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {mentor.experience} ans d'expérience
                              </span>
                            </div>
                          )}
                          {mentor.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span className="text-sm text-gray-600">
                                {mentor.rating}/5
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Formulaire de demande */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Votre Demande de Mentorat
                </h2>
              </div>

              {/* Mentor sélectionné */}
              {selectedMentorData && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-900">
                      Mentor sélectionné
                    </h3>
                    <button
                      onClick={() => setSelectedMentor("")}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {selectedMentorData.name?.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedMentorData.name}</p>
                      {selectedMentorData.expertise && (
                        <p className="text-sm text-gray-600 capitalize">
                          {selectedMentorData.expertise}
                        </p>
                      )}
                      {selectedMentorData.bio && (
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedMentorData.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Votre message de motivation *
                </label>
                <textarea
                  placeholder={`Pourquoi souhaitez-vous être mentoré par ${selectedMentorData?.name || "ce mentor"} ?\nQuels sont vos objectifs professionnels ?\nSur quels aspects spécifiques aimeriez-vous être accompagné ?`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  rows="8"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    {message.length}/1000 caractères
                  </p>
                  {!message.trim() && (
                    <p className="text-sm text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Message requis
                    </p>
                  )}
                </div>
              </div>

              {/* Conseils */}
              <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Conseils pour votre message
                </h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Présentez-vous brièvement</li>
                  <li>• Expliquez vos objectifs professionnels</li>
                  <li>• Décrivez les défis que vous rencontrez</li>
                  <li>• Mentionnez vos attentes spécifiques</li>
                </ul>
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`mb-6 p-4 rounded-xl border-2 ${
                  feedback.includes("succès") 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}>
                  <div className="flex items-center gap-3">
                    {feedback.includes("succès") ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">{feedback}</span>
                  </div>
                </div>
              )}

              {/* Bouton d'envoi */}
              <button 
                onClick={handleSubmit} 
                disabled={loading || !selectedMentor || !message.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Envoyer la demande de mentorat</span>
                  </>
                )}
              </button>

              {/* Informations supplémentaires */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="text-sm text-gray-600">
                    <div className="font-semibold text-gray-900">Réponse sous 48h</div>
                    <div>Temps de réponse moyen</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-semibold text-gray-900">Gratuit</div>
                    <div>Service de mentorat</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-semibold text-gray-900">Flexible</div>
                    <div>Adapté à vos besoins</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}