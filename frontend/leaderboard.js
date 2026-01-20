import React, { useState } from 'react';
import { Trophy, Briefcase, GraduationCap, Users, Leaf, TrendingUp, Award, Zap } from 'lucide-react';

const CarbonLeaderboard = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  // Fake user data with detailed carbon reduction activities
  const leaderboardData = {
    workers: [
      {
        id: 1,
        name: "Rajesh Thapa",
        company: "Himalayan Tech",
        avatar: "RT",
        carbonSaved: 245.8,
        rank: 1,
        activities: { walk: 45, publicTransport: 32, cycling: 18, meatless: 28 },
        streak: 42,
        level: 15
      },
      {
        id: 2,
        name: "Sita Gurung",
        company: "Nepal Telecom",
        avatar: "SG",
        carbonSaved: 223.4,
        rank: 2,
        activities: { walk: 38, publicTransport: 40, cycling: 15, meatless: 30 },
        streak: 35,
        level: 14
      },
      {
        id: 3,
        name: "Anil Shrestha",
        company: "Ncell Pvt Ltd",
        avatar: "AS",
        carbonSaved: 198.2,
        rank: 3,
        activities: { walk: 42, publicTransport: 28, cycling: 12, meatless: 25 },
        streak: 28,
        level: 13
      },
      {
        id: 4,
        name: "Binita Rai",
        company: "Cloud Factory",
        avatar: "BR",
        carbonSaved: 187.5,
        rank: 4,
        activities: { walk: 35, publicTransport: 35, cycling: 10, meatless: 27 },
        streak: 31,
        level: 12
      },
      {
        id: 5,
        name: "Prakash Lama",
        company: "Leapfrog Tech",
        avatar: "PL",
        carbonSaved: 175.9,
        rank: 5,
        activities: { walk: 40, publicTransport: 25, cycling: 8, meatless: 22 },
        streak: 24,
        level: 12
      }
    ],
    students: [
      {
        id: 6,
        name: "Mishel Rai",
        school: "Kathmandu University",
        avatar: "MR",
        carbonSaved: 267.3,
        rank: 1,
        activities: { walk: 52, publicTransport: 45, cycling: 25, meatless: 35 },
        streak: 48,
        level: 16
      },
      {
        id: 7,
        name: "Prabesh Karki",
        school: "Tribhuvan University",
        avatar: "PK",
        carbonSaved: 234.6,
        rank: 2,
        activities: { walk: 48, publicTransport: 38, cycling: 20, meatless: 32 },
        streak: 40,
        level: 15
      },
      {
        id: 8,
        name: "Sujata Tamang",
        school: "Pulchowk Campus",
        avatar: "ST",
        carbonSaved: 212.8,
        rank: 3,
        activities: { walk: 45, publicTransport: 35, cycling: 18, meatless: 28 },
        streak: 36,
        level: 14
      },
      {
        id: 9,
        name: "Rohan Basnet",
        school: "St. Xavier's College",
        avatar: "RB",
        carbonSaved: 195.4,
        rank: 4,
        activities: { walk: 40, publicTransport: 32, cycling: 15, meatless: 26 },
        streak: 29,
        level: 13
      },
      {
        id: 10,
        name: "Anisha Adhikari",
        school: "ACHS College",
        avatar: "AA",
        carbonSaved: 183.7,
        rank: 5,
        activities: { walk: 38, publicTransport: 30, cycling: 12, meatless: 24 },
        streak: 27,
        level: 12
      }
    ],
    free: [
      {
        id: 11,
        name: "Deepak Maharjan",
        location: "Patan, Lalitpur",
        avatar: "DM",
        carbonSaved: 289.5,
        rank: 1,
        activities: { walk: 60, publicTransport: 42, cycling: 30, meatless: 40 },
        streak: 55,
        level: 17
      },
      {
        id: 12,
        name: "Rina Shakya",
        location: "Bhaktapur",
        avatar: "RS",
        carbonSaved: 256.2,
        rank: 2,
        activities: { walk: 55, publicTransport: 38, cycling: 28, meatless: 36 },
        streak: 45,
        level: 16
      },
      {
        id: 13,
        name: "Suresh Dangol",
        location: "Thamel, Kathmandu",
        avatar: "SD",
        carbonSaved: 241.8,
        rank: 3,
        activities: { walk: 50, publicTransport: 40, cycling: 22, meatless: 34 },
        streak: 42,
        level: 15
      },
      {
        id: 14,
        name: "Kopila Magar",
        location: "Pokhara",
        avatar: "KM",
        carbonSaved: 218.3,
        rank: 4,
        activities: { walk: 46, publicTransport: 35, cycling: 20, meatless: 30 },
        streak: 38,
        level: 14
      },
      {
        id: 15,
        name: "Bishal Thakuri",
        location: "Boudha, Kathmandu",
        avatar: "BT",
        carbonSaved: 203.6,
        rank: 5,
        activities: { walk: 42, publicTransport: 33, cycling: 16, meatless: 28 },
        streak: 33,
        level: 13
      }
    ]
  };

  // Combine all users for "all" category
  const allUsers = [...leaderboardData.workers, ...leaderboardData.students, ...leaderboardData.free]
    .sort((a, b) => b.carbonSaved - a.carbonSaved)
    .map((user, index) => ({ ...user, rank: index + 1 }));

  const getCurrentData = () => {
    switch(activeCategory) {
      case 'workers':
        return leaderboardData.workers;
      case 'students':
        return leaderboardData.students;
      case 'free':
        return leaderboardData.free;
      default:
        return allUsers.slice(0, 10);
    }
  };

  const categories = [
    { id: 'all', label: 'All Users', icon: Users },
    { id: 'workers', label: 'Workers', icon: Briefcase },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'free', label: 'Free People', icon: Users }
  ];

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-600 to-amber-800';
    return 'from-emerald-400 to-emerald-600';
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-emerald-400" />
            <h1 className="text-4xl md:text-5xl font-black text-white">Carbon Karma</h1>
          </div>
          <p className="text-xl text-slate-300">Top Carbon Savers of the Week</p>
          <div className="mt-4 inline-block bg-emerald-500/10 border border-emerald-500/30 rounded-full px-6 py-2">
            <span className="text-emerald-400 font-semibold">🌍 Community Impact: 3,247 kg CO₂ Saved</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Leaderboard Grid */}
        <div className="grid gap-4">
          {getCurrentData().map((user, index) => (
            <div
              key={user.id}
              className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-500/10 ${
                index < 3 ? 'hover:scale-[1.02]' : ''
              }`}
            >
              <div className="flex items-center gap-6">
                {/* Rank */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getRankColor(user.rank)} flex items-center justify-center font-black text-2xl text-white shadow-lg flex-shrink-0`}>
                  {getRankMedal(user.rank)}
                </div>

                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                  {user.avatar}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-white truncate">{user.name}</h3>
                    <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded-full">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm font-semibold">Lvl {user.level}</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">
                    {user.company || user.school || user.location}
                  </p>

                  {/* Activity Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    <div className="bg-slate-700/50 rounded-lg px-3 py-2">
                      <div className="text-slate-400 text-xs">Walking</div>
                      <div className="text-white font-semibold">{user.activities.walk} days</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg px-3 py-2">
                      <div className="text-slate-400 text-xs">Public Transport</div>
                      <div className="text-white font-semibold">{user.activities.publicTransport} rides</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg px-3 py-2">
                      <div className="text-slate-400 text-xs">Cycling</div>
                      <div className="text-white font-semibold">{user.activities.cycling} trips</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg px-3 py-2">
                      <div className="text-slate-400 text-xs">Meatless</div>
                      <div className="text-white font-semibold">{user.activities.meatless} meals</div>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="text-orange-400 text-lg">🔥</span>
                      <span className="text-orange-400 text-sm font-semibold">{user.streak} day streak</span>
                    </div>
                  </div>
                </div>

                {/* Carbon Saved */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <Leaf className="w-5 h-5 text-emerald-400" />
                    <span className="text-3xl font-black text-emerald-400">{user.carbonSaved}</span>
                  </div>
                  <div className="text-slate-400 text-sm">kg CO₂ saved</div>
                  <div className="mt-2 text-slate-500 text-xs">
                    ≈ {(user.carbonSaved / 21).toFixed(1)} trees planted
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Weekly Growth</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">+23%</p>
            <p className="text-slate-400 text-sm mt-1">More carbon saved vs last week</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Active Users</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">1,247</p>
            <p className="text-slate-400 text-sm mt-1">Making a difference daily</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Challenges Won</h3>
            </div>
            <p className="text-3xl font-bold text-amber-400">342</p>
            <p className="text-slate-400 text-sm mt-1">Community achievements</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonLeaderboard;