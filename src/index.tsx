import { StrictMode } from "react"; // 引入React的StrictMode组件，用于在开发模式下检查潜在问题
import { createRoot } from "react-dom/client"; // 引入createRoot方法，用于创建React应用的根节点，根节点是React应用的起始点
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box } from "./screens/Box/Box"; // 引入Box组件，这是应用的主要界面组件
import { Login } from "./screens/Login/Login";
import { Register } from "./screens/Register/Register";
import { AccountManagement } from "./screens/AccountManagement/AccountManagement";
import { Students } from "./screens/Students/Students"; // 引入Students组件
import { MemorizeWords } from "./screens/MemorizeWords/MemorizeWords"; // 导入新的单词记忆组件
import { WordSnake } from "./screens/WordSnake/WordSnake"; // 导入贪吃蛇单词游戏组件
import { SettingsPage } from './screens/settings/SettingsPage.tsx'; // Adjust import path
import { ProfilePage } from './screens/ProfilePage'; // Import ProfilePage
import { LeaderboardsPage } from './screens/LeaderboardsPage'; // Import LeaderboardsPage
import { HelpPage } from './screens/HelpPage'; // Import HelpPage
import { SchoolsPage } from './screens/SchoolsPage'; // Import SchoolsPage
import { ThemeProvider } from './context/ThemeContext.tsx'; // Import ThemeProvider
import { ProfileSettingsPage } from './screens/settings/ProfileSettingsPage'; // Import the new component
import { DuolingoSchoolsPage } from './screens/settings/DuolingoSchoolsPage.tsx'; // Import DuolingoSchoolsPage
import { PrivacySettingsPage } from './screens/settings/PrivacySettingsPage.tsx'; // Import PrivacySettingsPage

createRoot(document.getElementById("app") as HTMLElement).render( // 创建React应用的根节点，并将其渲染到id为"app"的HTML元素中
  // <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="theme">
        <Routes>
          <Route path="/" element={<Box />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<AccountManagement />} />
          <Route path="/students/:studentId" element={<Students />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:studentId/memorize" element={<MemorizeWords />} />
          <Route path="/word-snake" element={<WordSnake />} />
          <Route path="/profile/:studentId" element={<ProfilePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaderboards/:studentId" element={<LeaderboardsPage />} />
          <Route path="/leaderboards" element={<LeaderboardsPage />} />
          <Route path="/pronunciation/:studentId" element={<ProfilePage />} />
          <Route path="/pronunciation" element={<ProfilePage />} />
          <Route path="/quests/:studentId" element={<ProfilePage />} />
          <Route path="/quests" element={<ProfilePage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/schools/:studentId" element={<SchoolsPage />} />
          <Route path="/schools" element={<SchoolsPage />} />
          <Route path="/settings/preferences/:studentId" element={<SettingsPage />} />
          <Route path="/settings/preferences" element={<SettingsPage />} />
          <Route path="/settings/profile/:studentId" element={<ProfileSettingsPage />} />
          <Route path="/settings/profile" element={<ProfileSettingsPage />} />
          <Route path="/settings/schools/:studentId" element={<DuolingoSchoolsPage />} />
          <Route path="/settings/schools" element={<DuolingoSchoolsPage />} />
          <Route path="/settings/privacy/:studentId" element={<PrivacySettingsPage />} />
          <Route path="/settings/privacy" element={<PrivacySettingsPage />} />
          <Route path="/logout" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  // </StrictMode>, // 结束StrictMode包裹
);
