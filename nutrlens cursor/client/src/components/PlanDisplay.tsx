import React from 'react';

interface PlanDisplayProps {
  plan: {
    summary: string;
    harmfulIngredients: string[];
    recommendations: string[];
    alternatives: string[];
    riskLevel: string;
  };
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan }) => {
  return (
    <div className="rounded-2xl bg-white shadow p-6">
      <h3 className="font-semibold mb-2">Personalized Avoidance Plan</h3>
      <p className="mb-4 text-gray-700">{plan.summary}</p>
      <div className="mb-2">
        <span className="font-bold">Harmful Ingredients:</span>
        <ul className="list-disc ml-6 text-red-600">
          {plan.harmfulIngredients.map((ing, i) => <li key={i}>{ing}</li>)}
        </ul>
      </div>
      <div className="mb-2">
        <span className="font-bold">Recommendations:</span>
        <ul className="list-disc ml-6">
          {plan.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
        </ul>
      </div>
      <div className="mb-2">
        <span className="font-bold">Alternatives:</span>
        <ul className="list-disc ml-6">
          {plan.alternatives.map((alt, i) => <li key={i}>{alt}</li>)}
        </ul>
      </div>
      <div>
        <span className="font-bold">Risk Level:</span> <span className="capitalize text-emerald-600 font-semibold">{plan.riskLevel}</span>
      </div>
    </div>
  );
};

export default PlanDisplay; 