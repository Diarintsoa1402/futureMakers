import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";


//
import Profile from "./pages/Profile";
import Home from "./pages/Home";
// Auth
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AvatarSetup from "./pages/AvatarSetup";
import AuthCallback from "./pages/AuthCallback";
import VerifyChild from "./pages/VerifyChild";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChatPage from "./pages/chat/ChatPage";
// Layout
import Navbar from "./components/Navbar";

// Pages enfants
import Courses from "./pages/children/Courses";
import Quizzes from "./pages/children/Quizzes";
import CourseDetail from "./pages/children/CourseDetail";
import EntrepriseDashboard from "./pages/children/EntrepriseDashboard";
import Leaderboard from "./pages/children/Leaderboard";
import QuizPage from "./pages/children/QuizPage"; // ✅ ajouté
import Badges from "./pages/children/Badges"; // ✅ ajouté

// Pages femmes

import FormationEdit from "./pages/admin/FormationEdit";
import FormationList from "./pages/admin/FormationList";
import FormationCreate from "./pages/admin/FormationCreate";
import FormationCatalog from "./pages/women/FormationCatalog";
import MyFormations from "./pages/women/MyFormations";
import FormationDetail from "./pages/women/FormationDetail"; 
import FundingRequest from "./pages/women/FundingRequest"; // ✅ ajouté
import MentorRequest from "./pages/women/MentorRequest"; // ✅ ajouté
import MyProjects from "./pages/women/MyProjects";
import Progress from "./pages/women/Progress"
import MyProgression from "./pages/women/MyProgression.Jsx";
import JoinVisio from "./pages/women/JoinVisio";

// Pages mentors
import MentorshipsDashboard from "./pages/mentors/MentorDashborad";
import MentorshipSession from "./pages/mentors/MentorshipSessions";
import MyMentees from "./pages/mentors/Mymentees"; // ✅ ajouté
import MenteesProjects from "./pages/mentors/MenteesProjects"; // ✅ ajouté
import Planvision from "./pages/mentors/PlanVisio"
// Pages investisseurs
import InvestorDashboard from "./pages/investors/InvestorDashboard";
import FundedProjects from "./pages/investors/FundedProjects";

// Pages admin
import ManageUsers from "./pages/admin/ManageUsers";
import Reports from "./pages/admin/Repports"; // ✅ corrigé
import CreateCourse from "./pages/admin/CreateCourse";
import CreateQuiz from "./pages/admin/CreatQuiz"; // ✅ corrigé


// Composants Protected + Layout
function Protected({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
}

function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/home" element={<Home  />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/avatar-setup" element={<AvatarSetup />} />
          <Route path="/verify-child/:token" element={<VerifyChild />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/chat"
            element={
              <Protected roles ={["woman", "mentor", "investor"]}>
                <ChatPage />
              </Protected>
            }
          />
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
           {/* profile */}
          <Route
            path="/profile"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />
          {/* Enfant */}
          <Route
            path="/child/courses"
            element={
              <Protected roles={["child"]}>
                <Courses />
              </Protected>
            }
          />
          <Route
  path="/child/quizzes"
  element={
    <Protected roles={["child"]}>
      <Quizzes />
    </Protected>
  }
/>
<Route
  path="/child/quizzes/:id"
  element={
    <Protected roles={["child"]}>
      <QuizPage />
    </Protected>
  }
/>
        
        <Route
          path="/child/badges"
          element={
            <Protected roles={["child"]}>
              <Badges />
            </Protected>
          }
        />
          <Route
            path="/child/courses/:id"
            element={
              <Protected roles={["child"]}>
                <CourseDetail />
              </Protected>
            }
          />

          {/* Femme */}
             <Route
            path="/woman/joinvisio"
            element={
              <Protected roles={["woman"]}>
                <JoinVisio />
              </Protected>
            }
          
          />
          <Route
            path="/woman/projects"
            element={
              <Protected roles={["woman"]}>
                <MyProjects />
              </Protected>
            }
          />
           <Route
            path="/woman/progress"
            element={
              <Protected roles={["woman"]}>
                <Progress />
              </Protected>
            }
          />
          <Route
            path="/woman/funding"
            element={
              <Protected roles={["woman"]}>
                <FundingRequest />
              </Protected>
            }
          />
           <Route
            path="/woman/mentor"
            element={
              <Protected roles={["woman"]}>
                <MentorRequest />
              </Protected>
            }
          />
         
         
          <Route
            path="/woman/mentorships"
            element={
              <Protected roles={["woman"]}>
                <MentorshipsDashboard />
              </Protected>
            }
          />
       
           <Route
            path="/woman/MyProgression"
            element={
              <Protected roles={["woman"]}>
                <MyProgression />
              </Protected>
            }
          />
           <Route
            path="/woman/formations"
            element={
              <Protected roles={["woman"]}>
                <FormationCatalog />
              </Protected>
            }
          />
          <Route
            path="/woman/my-formations"
            element={
              <Protected roles={["woman"]}>
                <MyFormations />
              </Protected>
            }
          />
          <Route
            path="/woman/formations/:enrollmentId"
            element={
              <Protected roles={["woman"]}>
                <FormationDetail />
              </Protected>
            }
          />
          {/* Mentor */}
          <Route
            path="/mentor/planvisio"
            element={
              <Protected roles={["mentor"]}>
                <Planvision />
              </Protected>
            }
          />
          <Route
            path="/mentor/mentorships"
            element={
              <Protected roles={["mentor"]}>
                <MentorshipsDashboard />
              </Protected>
            }
          />
 <Route
            path="/mentor/mentorshipSessions"
            element={
              <Protected roles={["mentor"]}>
                <MentorshipSession />
              </Protected>
            }
          />
<Route
            path="/mentor/mymentees"
            element={
              <Protected roles={["mentor"]}>
                <MyMentees />
              </Protected>
            }
          />
          <Route
            path="/mentor/mentees/projects"
            element={
              <Protected roles={["mentor"]}>
                <MenteesProjects />
              </Protected>
            }
          />
          {/* Investisseur */}
          <Route
            path="/investor/projects"
            element={
              <Protected roles={["investor"]}>
                <InvestorDashboard />
              </Protected>
            }
          />
          <Route
            path="/investor/funded"
            element={
              <Protected roles={["investor"]}>
                <FundedProjects />
              </Protected>
            }
          />

          {/* Admin */}
           <Route
            path="/admin/formations"
            element={
              <Protected roles={["admin"]}>
                <FormationList />
              </Protected>
            }
          />
          <Route
            path="/admin/formations/create"
            element={
              <Protected roles={["admin"]}>
                <FormationCreate />
              </Protected>
            }
          />
          <Route
            path="/admin/formations/:id/edit"
            element={
              <Protected roles={["admin"]}>
                <FormationEdit />
              </Protected>
            }
          />
          <Route
            path="/admin/users"
            element={
              <Protected roles={["admin"]}>
                <ManageUsers />
              </Protected>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <Protected roles={["admin"]}>
                <Reports />
              </Protected>
            }
          />
          <Route
            path="/admin/courses/new"
            element={
              <Protected roles={["admin"]}>
                <CreateCourse />
              </Protected>
            }
          />
          <Route
            path="/admin/quizzes/new"
            element={
              <Protected roles={["admin"]}>
                <CreateQuiz />
              </Protected>
            }
          />
          <Route
  path="/child/entreprise"
  element={
    <Protected roles={["child"]}>
      <EntrepriseDashboard />
    </Protected>
  }
/>

<Route
  path="/child/leaderboard"
  element={
    <Protected roles={["child"]}>
      <Leaderboard />
    </Protected>
  }
/>





          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
