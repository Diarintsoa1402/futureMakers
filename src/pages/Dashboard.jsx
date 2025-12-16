import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    switch (user.role) {
      case "child": navigate("/child/courses"); break;
      case "woman": navigate("/woman/formations"); break;
      case "mentor": navigate("/mentor/mentorships"); break;
      case "investor": navigate("/investor/projects"); break;
      case "admin": navigate("/admin/users"); break;
      default: navigate("/home"); break;
    }
  }, [user, navigate]);

  return <div>Chargement du tableau de bord...</div>;
}
