import React from 'react';

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="mb-8 text-gray-600">Manage your profile, preferences, and account details.</p>
        <form className="bg-white rounded-2xl shadow p-8 flex flex-col gap-6">
          <div>
            <label className="block font-semibold mb-1">Full Name</label>
            <input type="text" className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Full Name" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input type="email" className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Email" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Phone Number</label>
            <input type="tel" className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Phone Number" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Health Conditions</label>
            <select className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="">Select conditions</option>
              <option value="diabetes">Diabetes</option>
              <option value="hypertension">Hypertension</option>
              <option value="celiac">Celiac Disease</option>
              <option value="lactose">Lactose Intolerance</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Allergies</label>
            <select className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="">Select allergies</option>
              <option value="peanuts">Peanuts</option>
              <option value="tree_nuts">Tree Nuts</option>
              <option value="dairy">Dairy</option>
              <option value="eggs">Eggs</option>
              <option value="soy">Soy</option>
              <option value="shellfish">Shellfish</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Dietary Preferences</label>
            <select className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="">Select preferences</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="gluten_free">Gluten Free</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-emerald-500 text-white font-semibold px-8 py-2 rounded-xl shadow hover:bg-emerald-600 transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage; 