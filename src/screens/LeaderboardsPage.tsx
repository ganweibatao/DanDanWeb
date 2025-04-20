import React from 'react';
import { useNavigate } from 'react-router-dom';
// import { useTheme } from '../context/ThemeContext'; // Removed unused import
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge'; // Import Badge
import {
  FlameIcon,       
  GemIcon,         
  HeartIcon,       
  GiftIcon,        
  ChevronRightIcon,
  TrophyIcon,       // For league title
  ArrowUpCircleIcon, // For promotion zone
  ArrowDownCircleIcon, // For demotion zone
} from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar'; // Import Sidebar

// Leaderboard entry interface
interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  isCurrentUser: boolean;
  avatarPlaceholder: string; // Simple letter placeholder for now
}

// Mock leaderboard data
const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: "LinguaMaster", xp: 2450, isCurrentUser: false, avatarPlaceholder: "L" },
  { rank: 2, name: "PolyglotPro", xp: 2380, isCurrentUser: false, avatarPlaceholder: "P" },
  { rank: 3, name: "WordWizard", xp: 2210, isCurrentUser: false, avatarPlaceholder: "W" },
  { rank: 4, name: "Duo_acf37534", xp: 2150, isCurrentUser: true, avatarPlaceholder: "D" }, // Current user
  { rank: 5, name: "GrammarGuru", xp: 2095, isCurrentUser: false, avatarPlaceholder: "G" },
  { rank: 6, name: "FluentFriend", xp: 1980, isCurrentUser: false, avatarPlaceholder: "F" },
  // ... add more entries up to 10 or 20
  { rank: 7, name: "SyntaxSage", xp: 1850, isCurrentUser: false, avatarPlaceholder: "S" },
  { rank: 8, name: "VocabVictor", xp: 1770, isCurrentUser: false, avatarPlaceholder: "V" },
  { rank: 9, name: "ChatterChamp", xp: 1690, isCurrentUser: false, avatarPlaceholder: "C" },
  { rank: 10, name: "PronunciationPal", xp: 1550, isCurrentUser: false, avatarPlaceholder: "P" },
  // Demotion Zone example
   { rank: 18, name: "LazyLearner", xp: 820, isCurrentUser: false, avatarPlaceholder: "L" },
   { rank: 19, name: "SlowStarter", xp: 750, isCurrentUser: false, avatarPlaceholder: "S" },
   { rank: 20, name: "QuietQuitter", xp: 680, isCurrentUser: false, avatarPlaceholder: "Q" },
];

// Placeholder user data for right sidebar (can reuse from ProfilePage or fetch separately)
const userData = {
  streak: 1,
  gems: 505,
  lives: 4
};

export const LeaderboardsPage = (): JSX.Element => {
  const navigate = useNavigate();
  // const { theme } = useTheme(); // Removed unused hook call

  // Placeholder for flag component (same as ProfilePage)
  const FlagPlaceholder = ({ countryCode }: { countryCode: string }) => (
     <div className="w-8 h-5 rounded-sm bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
       {countryCode}
     </div>
   );
   
   // Placeholder for Avatar Component
   const AvatarPlaceholder = ({ initial, bgColorClass }: { initial: string; bgColorClass: string }) => (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg ${bgColorClass}`}>
         {initial}
      </div>
   );
   
   // Assign colors to avatars (simple rotation or based on name hash)
   const avatarColors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'
   ];
   const getAvatarColor = (name: string) => avatarColors[name.length % avatarColors.length];

   // Determine zone based on rank (example logic)
   const getZone = (rank: number): 'promotion' | 'safety' | 'demotion' => {
      if (rank <= 3) return 'promotion';
      if (rank >= 18) return 'demotion';
      return 'safety';
   };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Sidebar /> {/* Use the shared Sidebar component */}

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto bg-white dark:bg-gray-800">
         <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">排行榜</h1>
         
         {/* League Info */}
         <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <TrophyIcon className="w-8 h-8 text-yellow-500"/>
            <div>
               <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Diamond League</h2>
               <p className="text-sm text-gray-500 dark:text-gray-400">Top 3 promote, bottom 3 demote.</p>
            </div>
            <div className="flex space-x-2 ml-auto">
               <Badge variant="outline" className="border-green-500 text-green-600 dark:border-green-400 dark:text-green-300 bg-green-50 dark:bg-green-900/30"><ArrowUpCircleIcon className="w-4 h-4 mr-1"/> Promotion</Badge>
               <Badge variant="outline" className="border-red-500 text-red-600 dark:border-red-400 dark:text-red-300 bg-red-50 dark:bg-red-900/30"><ArrowDownCircleIcon className="w-4 h-4 mr-1"/> Demotion</Badge>
            </div>
         </div>
         
         {/* Leaderboard List */}
         <div className="space-y-2">
            {leaderboardData.map((entry) => {
               const zone = getZone(entry.rank);
               const isPromotion = zone === 'promotion';
               const isDemotion = zone === 'demotion';
               
               return (
                  <div 
                     key={entry.rank} 
                     className={`flex items-center p-3 rounded-lg transition-colors ${ 
                        entry.isCurrentUser 
                           ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700' 
                           : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600' 
                     } ${ 
                        isPromotion ? 'border-l-4 border-green-500' : isDemotion ? 'border-l-4 border-red-500' : ''
                     }`}
                  >
                     <span className="w-8 text-center font-semibold text-gray-500 dark:text-gray-400 mr-3">{entry.rank}</span>
                     <AvatarPlaceholder initial={entry.avatarPlaceholder} bgColorClass={getAvatarColor(entry.name)} />
                     <span className="flex-1 mx-4 font-medium text-gray-800 dark:text-gray-100 truncate">{entry.name}</span>
                     <span className="font-semibold text-gray-600 dark:text-gray-300">{entry.xp} XP</span>
                     {isPromotion && <ArrowUpCircleIcon className="w-5 h-5 text-green-500 ml-3"/>}
                     {isDemotion && <ArrowDownCircleIcon className="w-5 h-5 text-red-500 ml-3"/>}
                     {/* {zone === 'safety' && <ShieldCheckIcon className="w-5 h-5 text-gray-400 ml-3"/>} Uncomment for safety icon */}
                  </div>
               );
            })}
         </div>
      </main>

      {/* Right Sidebar (Reusing ProfilePage structure) */}
       <aside className="w-72 bg-gray-100 dark:bg-gray-900 p-6 flex flex-col space-y-6 border-l border-gray-200 dark:border-gray-700">
         {/* Top Stats */} 
         <div className="flex justify-around items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
           <FlagPlaceholder countryCode="US" /> 
           <div className="flex items-center space-x-1 text-orange-500">
             <FlameIcon className="w-5 h-5" />
             <span className="font-bold text-sm">{userData.streak}</span>
           </div>
           <div className="flex items-center space-x-1 text-blue-500">
             <GemIcon className="w-5 h-5" />
             <span className="font-bold text-sm">{userData.gems}</span>
           </div>
           <div className="flex items-center space-x-1 text-red-500">
             <HeartIcon className="w-5 h-5" />
             <span className="font-bold text-sm">{userData.lives}</span>
           </div>
         </div>
         
         {/* Add Friends Card */} 
         <Card className="bg-white dark:bg-gray-800 shadow rounded-lg">
           <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-200">添加好友</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
               <button className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                     <GiftIcon className="w-6 h-6 text-green-500"/>
                     <span className="text-sm font-medium text-gray-700 dark:text-gray-200">邀请朋友</span>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500"/>
               </button>
            </CardContent>
         </Card>

         {/* Footer Links */}
         <div className="mt-auto pt-6 text-center text-xs text-gray-500 dark:text-gray-400 space-x-3 flex flex-wrap justify-center leading-relaxed">
           <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">关于</a>
           <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">博客</a>
           <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">商店</a>
           {/* ... other links */}
        </div>
      </aside>
    </div>
  );
}; 