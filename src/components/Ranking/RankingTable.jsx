/* FICHIER: src/components/Ranking/RankingTable.jsx */
import { memo } from "react";
import RankingRow from "./RankingRow";
import Pagination from "../Common/Pagination";

function RankingTable({ ranking, currentPage, onPageChange, pagination }) {
  const getMedal = (position) => {
    switch (position) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return position;
    }
  };

  return (
    <div className="ranking-table-container">
      <div className="ranking-table">
        <div className="table-header">
          <div className="header-cell position">Position</div>
          <div className="header-cell user">Utilisateur</div>
          <div className="header-cell score">Score</div>
          <div className="header-cell completions">Cours complétés</div>
          <div className="header-cell total">Total</div>
          <div className="header-cell badges">Badges</div>
        </div>
        
        <div className="table-body">
          {ranking.map((user, index) => {
            const position = (currentPage - 1) * pagination.limit + index + 1;
            return (
              <RankingRow
                key={user.userId}
                user={user}
                position={position}
                medal={getMedal(position)}
                isCurrentUser={user.isCurrentUser}
              />
            );
          })}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
        hasNext={pagination.hasNext}
        hasPrev={pagination.hasPrev}
      />
    </div>
  );
}

export default memo(RankingTable);