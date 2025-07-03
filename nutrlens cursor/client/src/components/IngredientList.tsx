import React from 'react';

interface IngredientListProps {
  ingredients: { name: string; harmful: boolean }[];
}

const IngredientList: React.FC<IngredientListProps> = ({ ingredients }) => {
  return (
    <div className="rounded-2xl bg-white shadow p-6">
      <h3 className="font-semibold mb-4">Extracted Ingredients</h3>
      <ul className="space-y-2">
        {ingredients.map((item, i) => (
          <li key={i} className={`flex items-center gap-2 ${item.harmful ? 'text-red-600 font-bold' : ''}`}>
            <span>{item.name}</span>
            {item.harmful && <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">Harmful</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IngredientList; 