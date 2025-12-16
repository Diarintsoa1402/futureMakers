// frontend/src/components/ProgressBar.jsx
import React from "react";

export default function ProgressBar({ percent, level }) {
  const getColor = () => {
    if (percent < 33) return "bg-red-500";
    if (percent < 66) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getLevelText = () => {
    if (percent < 33) return "Bas";
    if (percent < 66) return "Moyen";
    return "Meilleur";
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-sm">
        <span className="font-medium">Progression</span>
        <span className="text-gray-600">{percent.toFixed(0)}% - {level || getLevelText()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all ${getColor()}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}
