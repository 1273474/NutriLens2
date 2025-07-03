import React, { useRef, useState } from 'react';
import heroImg from '../assets/nl1.png';
import IngredientList from '../components/IngredientList';
import NutritionSummary from '../components/NutritionSummary';
import Loader from '../components/Loader';
import { useAnalyze } from '../hooks/useAnalyze';
import { useGeneratePlan } from '../hooks/useGeneratePlan';
import { useNavigate } from 'react-router-dom';

const UploadPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const analyzeMutation = useAnalyze();
  const generatePlanMutation = useGeneratePlan();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setAnalysis(null);
    analyzeMutation.mutate(file, {
      onSuccess: (data) => setAnalysis(data),
    });
  };

  const handleGeneratePlan = () => {
    generatePlanMutation.mutate(undefined, {
      onSuccess: () => navigate('/dashboard'),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="rounded-2xl overflow-hidden shadow-lg bg-white flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 w-full h-64 md:h-auto bg-cover bg-center" style={{ backgroundImage: `url(${heroImg})` }} />
          <div className="md:w-1/2 w-full p-8 flex flex-col items-start justify-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Unlock the Power of Nutrition with <span className="text-emerald-500">NutriLens</span></h1>
            <p className="mb-6 text-gray-600">Effortlessly analyze ingredient lists with AI. Simply upload or capture a photo to understand the nutritional content of your food.</p>
            <button
              className="inline-block bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl shadow hover:bg-emerald-600 transition mb-2"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Ingredient Image
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {file && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-700">{file.name}</span>
                <button className="text-xs text-red-500" onClick={() => setFile(null)}>Remove</button>
              </div>
            )}
            <button
              className="mt-4 bg-emerald-500 text-white font-semibold px-6 py-2 rounded-xl shadow hover:bg-emerald-600 transition"
              onClick={handleUpload}
              disabled={!file || analyzeMutation.isLoading}
            >
              {analyzeMutation.isLoading ? 'Analyzing...' : 'Analyze Ingredients'}
            </button>
          </div>
        </div>
        {analyzeMutation.isLoading && <Loader />}
        {analysis && (
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <IngredientList
              ingredients={analysis.ingredients.map((name: string) => ({
                name,
                harmful: analysis.harmfulFlags[name],
              }))}
            />
            <NutritionSummary nutrition={analysis.nutrition} />
          </div>
        )}
        {analysis && (
          <div className="mt-8 flex justify-end">
            <button
              className="bg-emerald-500 text-white font-semibold px-8 py-2 rounded-xl shadow hover:bg-emerald-600 transition"
              onClick={handleGeneratePlan}
              disabled={generatePlanMutation.isLoading}
            >
              {generatePlanMutation.isLoading ? 'Generating Plan...' : 'Generate Avoidance Plan'}
            </button>
          </div>
        )}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-2">How NutriLens Works</h2>
          <p className="mb-8 text-gray-600">NutriLens simplifies nutrition analysis with a user-friendly interface and powerful AI.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white shadow p-6 flex flex-col items-center">
              <span className="text-3xl mb-2">📷</span>
              <h3 className="font-semibold mb-1">Capture with Camera</h3>
              <p className="text-gray-500 text-sm text-center">Use your device's camera to take a clear photo of the ingredient list.</p>
            </div>
            <div className="rounded-2xl bg-white shadow p-6 flex flex-col items-center">
              <span className="text-3xl mb-2">🖼️</span>
              <h3 className="font-semibold mb-1">Upload Image</h3>
              <p className="text-gray-500 text-sm text-center">Upload an existing image from your gallery or files.</p>
            </div>
            <div className="rounded-2xl bg-white shadow p-6 flex flex-col items-center">
              <span className="text-3xl mb-2">🔍</span>
              <h3 className="font-semibold mb-1">Analyze & Learn</h3>
              <p className="text-gray-500 text-sm text-center">Our AI analyzes the image and provides detailed nutritional information.</p>
            </div>
          </div>
        </section>
      </div>
      <footer className="mt-16 py-8 border-t text-center text-gray-400 text-sm flex flex-col md:flex-row justify-center gap-6">
        <a href="#" className="hover:text-emerald-500">Privacy Policy</a>
        <a href="#" className="hover:text-emerald-500">Terms of Service</a>
        <a href="#" className="hover:text-emerald-500">Contact Us</a>
        <span className="block md:inline">© 2024 NutriLens. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default UploadPage; 