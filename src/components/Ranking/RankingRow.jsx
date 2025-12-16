/* FICHIER: src/components/Ranking/RankingRow.jsx */
import { memo } from "react";

function RankingRow({ user, medal, isCurrentUser }) {
  const getBadgeIcon = (badge) => {
    const icons = {
      top_scorer: "⭐",
      dedicated_learner: "📚",
      fast_learner: "⚡"
    };
    return icons[badge] || "🏅";
  };

  return (
    <div className={`ranking-row ${isCurrentUser ? 'current-user' : ''}`}>
      <div className="cell position-cell">
        <span className="position-medal">{medal}</span>
      </div>
      
      <div className="cell user-cell">
        <div className="user-info">
          {user.avatar && (
            <img src={user.avatar} alt={user.name} className="user-avatar" />
          )}
          <div className="user-details">
            <span className="user-name">{user.name}</span>
            {isCurrentUser && <span className="you-badge">Vous</span>}
          </div>
        </div>
      </div>
      
      <div className="cell score-cell">
        <span className="score-value">{user.score}</span>
      </div>
      
      <div className="cell completions-cell">
        <span className="completions-value">{user.completions}</span>
      </div>
      
      <div className="cell total-cell">
        <span className="total-value">{user.total}</span>
      </div>
      
      <div className="cell badges-cell">
        <div className="badges-list">
          {user.badges?.map(badge => (
            <span key={badge} className="badge" title={badge}>
              {getBadgeIcon(badge)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(RankingRow);