/* FICHIER: src/components/Ranking/RankingFilters.jsx */
import { memo } from "react";
import { leaderboardService } from "../../services/leaderboard";

function RankingFilters({ filters, onFilterChange, period }) {
  const periods = leaderboardService.getPeriods();

  return (
    <div className="ranking-filters">
      <div className="filter-group">
        <label htmlFor="period-select" className="filter-label">
          Période:
        </label>
        <select
          id="period-select"
          value={filters.period}
          onChange={(e) => onFilterChange({ period: e.target.value })}
          className="filter-select"
        >
          {periods.map(period => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="limit-select" className="filter-label">
          Résultats par page:
        </label>
        <select
          id="limit-select"
          value={filters.limit}
          onChange={(e) => onFilterChange({ limit: parseInt(e.target.value) })}
          className="filter-select"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {period && (
        <div className="active-period">
          Affichage: <strong>{periods.find(p => p.value === period)?.label}</strong>
        </div>
      )}
    </div>
  );
}

export default memo(RankingFilters);