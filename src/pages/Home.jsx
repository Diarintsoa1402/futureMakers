import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Star, 
  Users, 
  Award, 
  Shield, 
  TrendingUp,
  Play,
  ArrowRight,
  Heart,
  Sparkles,
  Zap,
  Target,
  CheckCircle
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Communauté Bienveillante",
      description: "Rejoignez une communauté d'apprenants, mentors et investisseurs passionnés",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Apprentissage Personnalisé",
      description: "Des parcours adaptés à chaque profil : enfants, femmes, mentors",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Environnement Sécurisé",
      description: "Espace contrôlé pour les enfants avec validation parentale",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Progression Continue",
      description: "Suivez votre évolution et célébrez vos réussites",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Apprenants Actifs", icon: <Users className="w-5 h-5" /> },
    { number: "500+", label: "Mentors Experts", icon: <Award className="w-5 h-5" /> },
    { number: "50+", label: "Parcours Disponibles", icon: <Target className="w-5 h-5" /> },
    { number: "98%", label: "Satisfaction", icon: <Heart className="w-5 h-5" /> }
  ];

  const benefits = [
    "Accès illimité à tous les parcours",
    "Mentorat personnalisé",
    "Certificats de réussite",
    "Communauté active 24/7"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
      {/* Navigation améliorée */}
      <nav className="relative z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">Future Markers</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <button 
              onClick={() => navigate('/login')}
              className="text-white/90 hover:text-white transition-all px-6 py-2.5 rounded-xl hover:bg-white/10 backdrop-blur-sm font-medium"
            >
              Connexion
            </button>
            <button   
              onClick={() => navigate('/login')}
              className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2"
            >
              Commencer
              <Sparkles className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section amélioré */}
      <section className="relative px-6 py-24">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-10"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-5 py-2.5 mb-8 border border-white/30 shadow-xl"
            >
              <Star className="w-5 h-5 text-yellow-300" />
              <span className="text-white text-sm font-medium">Rejoignez l'aventure d'apprentissage</span>
              <Sparkles className="w-4 h-4 text-yellow-200" />
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-8 leading-tight tracking-tight">
              Apprendre en
              <span className="block mt-2 bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
                s'amusant
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/95 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
              Future Markers révolutionne l'apprentissage avec des expériences interactives, 
              une communauté bienveillante et des parcours adaptés à tous les âges.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
          >
            <Link 
              to="/login" 
              className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl flex items-center gap-3 group hover:scale-105"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>

            <Link 
              to="/demo" 
              className="border-2 border-white/80 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-3 group backdrop-blur-md shadow-xl hover:scale-105"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Voir la démo
            </Link>
          </motion.div>

          {/* Stats améliorés */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl"
              >
                <div className="flex justify-center mb-3 text-yellow-300">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/80 text-sm font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Éléments décoratifs améliorés */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, 60, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute top-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.4, 1],
              x: [0, -40, 0],
              y: [0, 60, 0]
            }}
            transition={{ duration: 30, repeat: Infinity }}
            className="absolute bottom-20 right-10 w-[32rem] h-[32rem] bg-purple-300/10 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 35, repeat: Infinity }}
            className="absolute top-1/2 left-1/4 w-64 h-64 bg-yellow-300/5 rounded-full blur-3xl"
          />
        </div>
      </section>

      {/* Features Section amélioré */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-100 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-600 font-semibold text-sm">Fonctionnalités</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Pourquoi choisir <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Future Markers</span> ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Une plateforme complète qui s'adapte à vos besoins d'apprentissage, 
              quel que soit votre âge ou votre niveau.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -8 }}
                className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section avantages */}
      <section className="relative bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-2 mb-6">
                <Star className="w-4 h-4 text-purple-600" />
                <span className="text-purple-600 font-semibold text-sm">Avantages</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                Tout ce dont vous avez besoin pour réussir
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Accédez à une plateforme complète conçue pour maximiser votre apprentissage et votre épanouissement.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-32 h-32 text-white/50" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section amélioré */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 py-24 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-5 py-2.5 mb-8 border border-white/30"
            >
              <Rocket className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-semibold text-sm">Rejoignez-nous dès maintenant</span>
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">
              Prêt à commencer votre aventure ?
            </h2>
            <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto leading-relaxed">
              Rejoignez des milliers d'apprenants qui transforment déjà leur façon d'apprendre.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-10">
              <Link 
                to="/login" 
                className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl flex items-center gap-3 group hover:scale-105"
              >
                Créer mon compte gratuit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link 
                to="/login" 
                className="border-2 border-white/80 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-3 group backdrop-blur-md shadow-xl hover:scale-105"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Découvrir la plateforme
              </Link>
            </div>

            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-3 text-yellow-200 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20"
            >
              <Heart className="w-5 h-5 fill-current" />
              <span className="text-white font-medium">Sécurisé • Adaptatif • Bienveillant</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-300 rounded-full blur-3xl"
          />
        </div>
      </section>

      {/* Footer amélioré */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl">Future Markers</span>
            </div>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Transformons l'apprentissage ensemble, dès aujourd'hui.
            </p>
          </div>
          
          <div className="text-center border-t border-gray-800 pt-8">
            <div className="text-gray-500 text-sm">
              © 2025 Future Markers. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}