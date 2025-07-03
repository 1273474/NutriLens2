import React from 'react';
import planImg from '../assets/nl2.png';
import { useLatestPlan } from '../hooks/useLatestPlan';
import PlanDisplay from '../components/PlanDisplay';
import Loader from '../components/Loader';

const DashboardPage: React.FC = () => {
  const { data: plan, isLoading } = useLatestPlan();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Avoidance Plan</h1>
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="md:w-1/2 w-full rounded-2xl overflow-hidden shadow bg-white flex items-center justify-center">
            <img src={planImg} alt="Avoidance Plan" className="w-full h-64 object-contain" />
          </div>
          <div className="md:w-1/2 w-full flex flex-col justify-center">
            <h2 className="text-xl font-semibold mb-2">Your Current Avoidance Plan</h2>
            <p className="text-gray-600 mb-4">This plan helps you manage your dietary restrictions and avoid foods that may cause adverse reactions. It's tailored to your specific needs and preferences.</p>
            <button className="bg-emerald-500 text-white font-semibold px-6 py-2 rounded-xl shadow hover:bg-emerald-600 transition w-max">View ...</button>
          </div>
        </div>
        {isLoading && <Loader />}
        {plan && <PlanDisplay plan={plan} />}
        <h2 className="text-xl font-bold mb-4 mt-12">Upload History</h2>
        <div className="overflow-x-auto rounded-2xl shadow bg-white">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Time</th>
                <th className="py-3 px-4 font-semibold">File Name</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '2024-07-26', time: '10:30 AM', file: 'grocery_list_1.pdf' },
                { date: '2024-07-25', time: '03:45 PM', file: 'recipe_ingredients.txt' },
                { date: '2024-07-24', time: '09:15 AM', file: 'restaurant_menu.pdf' },
                { date: '2024-07-23', time: '11:00 AM', file: 'food_diary.csv' },
                { date: '2024-07-22', time: '02:20 PM', file: 'allergy_report.pdf' },
              ].map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3 px-4">{row.date}</td>
                  <td className="py-3 px-4">{row.time}</td>
                  <td className="py-3 px-4">{row.file}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-xl text-xs font-semibold">Processed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 