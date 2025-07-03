import React from 'react';

interface NutritionSummaryProps {
  nutrition: {
    calories?: number;
    fat?: number;
    sugar?: number;
    protein?: number;
    carbs?: number;
    sodium?: number;
  };
}

const NutritionSummary: React.FC<NutritionSummaryProps> = ({ nutrition }) => {
  return (
    <div className="rounded-2xl bg-white shadow p-6">
      <h3 className="font-semibold mb-4">Nutrition Summary</h3>
      <ul className="grid grid-cols-2 gap-4">
        <li>Calories: <span className="font-bold">{nutrition.calories ?? '--'}</span></li>
        <li>Fat: <span className="font-bold">{nutrition.fat ?? '--'}g</span></li>
        <li>Sugar: <span className="font-bold">{nutrition.sugar ?? '--'}g</span></li>
        <li>Protein: <span className="font-bold">{nutrition.protein ?? '--'}g</span></li>
        <li>Carbs: <span className="font-bold">{nutrition.carbs ?? '--'}g</span></li>
        <li>Sodium: <span className="font-bold">{nutrition.sodium ?? '--'}mg</span></li>
      </ul>
    </div>
  );
};

export default NutritionSummary; 