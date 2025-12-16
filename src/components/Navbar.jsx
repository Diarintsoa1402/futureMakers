import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronDown,
  Rocket,
  BookOpen,
  Award,
  Building,
  Trophy,
  GraduationCap,
  Briefcase,
  Users,
  DollarSign,
  Settings,
  BarChart3,
  Video,
  MessageCircle,
  TriangleIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  if (!user) return null;

  const menus = {
    child: [
      { to: "/child/courses", label: "Cours", icon: BookOpen },
      { to: "/child/quizzes", label: "Quiz", icon: Award },
      { to: "/child/badges", label: "Badges", icon: Trophy },
      { to: "/child/entreprise", label: "Mon entreprise", icon: Building },
      { to: "/child/leaderboard", label: "Classement", icon: Trophy },
    ],
    woman: [
      { to: "/woman/formations", label: "Formations", icon: GraduationCap },
      { to: "/woman/my-formations", label: " Mes formations", icon: BookOpen},
      { to: "/woman/projects", label: "Mon projet", icon: Briefcase },
      { to: "/woman/mentor", label: "Mentorat", icon: Users },
      { to: "/woman/funding", label: "Financement", icon: DollarSign },
      { to: "/woman/MyProgression", label: "Mon Parcours de Menntorat", icon: BarChart3 },
      { to: "/woman/joinvisio", label: "Rejoindre une visio", icon: Video },
       { to: "/chat", label: "Message", icon: MessageCircle },
       
    ],
    mentor: [
      { to: "/mentor/mentorships", label: "Tableau de bord", icon: BarChart3 },
      { to: "/mentor/mentorshipSessions", label: "Sessions", icon: Video },
      { to: "/mentor/mymentees", label: "Mes mentorées", icon: Users },
      { to: "/mentor/mentees/projects", label: "Projets", icon: Briefcase },
      { to: "/mentor/planvisio", label: "Planifier une visio", icon: Video },
      { to: "/chat", label: "Message", icon: MessageCircle }
    ],
    investor: [
      { to: "/investor/projects", label: "Tableau de bord", icon: BarChart3 },
      { to: "/investor/funded", label: "Projets financés", icon: DollarSign },
      { to: "/chat", label: "Message", icon: MessageCircle }
    ],
    admin: [
      { to: "/admin/users", label: "Utilisateurs", icon: Users },
      { to: "/admin/reports", label: "Rapports", icon: BarChart3 },
      { to: "/admin/courses/new", label: "Nouveau cours", icon: BookOpen },
      { to: "/admin/quizzes/new", label: "Nouveau quiz", icon: Award },
      { to: "/admin/formations/create", label: "Nouvelle formation", icon: GraduationCap },
      { to: "/admin/formations", label: " Gérer les formations", icon: BookOpen},
    ],
  };

  const roleMenus = menus[user.role] || [];

  const roleColors = {
    child: "from-blue-500 to-cyan-500",
    woman: "from-pink-500 to-rose-500",
    mentor: "from-purple-500 to-indigo-500",
    investor: "from-green-500 to-emerald-500",
    admin: "from-orange-500 to-red-500"
  };

  const roleLabels = {
    child: "Enfant",
    woman: "Femme Entrepreneure",
    mentor: "Mentor",
    investor: "Investisseur",
    admin: "Administrateur"
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 group"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Rocket className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="font-bold text-gray-800 text-lg leading-tight">
                  FutureMakers
                </h1>
                <div className={`text-xs font-semibold bg-gradient-to-r ${roleColors[user.role]} bg-clip-text text-transparent`}>
                  {roleLabels[user.role]}
                </div>
              </div>
            </Link>

            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {roleMenus.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                
                return (
                  <Link
                    key={index}
                    to={item.to}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-800">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`} />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-800">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </div>
                      
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Mon profil
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 bg-white"
            >
              <div className="px-4 py-3 space-y-1">
                {roleMenus.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  
                  return (
                    <Link
                      key={index}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Overlay for dropdown */}
      {isProfileDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </>
  );
}