import { StrictMode } from "react"; // 引入React的StrictMode组件，用于在开发模式下检查潜在问题
import { createRoot } from "react-dom/client"; // 引入createRoot方法，用于创建React应用的根节点，根节点是React应用的起始点
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // <-- 导入 React Query 相关
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // 修正导入大小写
import { persistQueryClient } from '@tanstack/react-query-persist-client'; // <-- 导入 persistQueryClient
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'; // <-- Import async
import { get, set, del } from 'idb-keyval'; // <-- 导入 IndexedDB 操作函数 (移除 UseStore，通常不需要)
import { Box } from "./screens/Box/Box"; // 引入Box组件，这是应用的主要界面组件
import { Login } from "./screens/LoginRegister/Login.tsx";
import { Register } from "./screens/LoginRegister/Register.tsx";
import { AccountManagement } from "./screens/AccountManagement/AccountManagement";
import { Students } from "./screens/Students/Students"; // 引入Students组件
import { MemorizeWords } from "./screens/MemorizeWords/MemorizeWords"; // 导入新的单词记忆组件
import { WordSnake } from "./screens/WordSnake/WordSnake"; // 导入贪吃蛇单词游戏组件
import { SettingsPage } from './screens/settings/SettingsPage.tsx'; // Adjust import path
import { ProfilePage } from './screens/ProfilePage'; // Import ProfilePage
import { LeaderboardsPage } from './screens/LeaderboardsPage'; // Import LeaderboardsPage
import { HelpPage } from './screens/HelpPage'; // Import HelpPage
import { SchoolsPage } from './screens/SchoolsPage'; // Import SchoolsPage
import { ProfileSettingsPage } from './screens/settings/ProfileSettingsPage';
import { DuolingoSchoolsPage } from './screens/settings/DanzaiSchoolsPage.tsx';
import { PrivacySettingsPage } from './screens/settings/PrivacySettingsPage.tsx';
import { LearningStatusPage } from './screens/LearningStatusPage';
import 'nprogress/nprogress.css';
import { SettingsProvider } from './context/SettingsContext';

// 创建一个 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 默认缓存时间为 7 天 (gcTime in v5, cacheTime in v4)
      staleTime: 1000 * 60 * 60, // 默认数据视为 1 小时内新鲜
    },
  },
});

// 创建 IndexedDB persister - 使用 createAsyncStoragePersister
const persister = createAsyncStoragePersister({ // <-- Use async
  storage: {
    getItem: async (key: string) => {
      const value = await get(key);
      return value; // async storage can return the value directly
    },
    setItem: async (key: string, value: unknown) => {
      await set(key, value);
    },
    removeItem: async (key: string) => {
      await del(key);
    },
  },
  key: 'reactQuery',
});

// 配置持久化
persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24 * 60, // 持久化数据的最大有效期（60天）
  // buster: 'v1', // 如果数据结构发生变化，可以更改此字符串使旧缓存失效
});

createRoot(document.getElementById("app") as HTMLElement).render( // 创建React应用的根节点，并将其渲染到id为"app"的HTML元素中
  // <StrictMode>
    <QueryClientProvider client={queryClient}> {/* <-- QueryClientProvider 已存在 */}
      <BrowserRouter>
        <SettingsProvider>
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
            <Route path="/quests/:studentId" element={<LearningStatusPage />} />
            <Route path="/quests" element={<LearningStatusPage />} />
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
        </SettingsProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} /> {/* 修正组件大小写 */}
    </QueryClientProvider>
  // </StrictMode>, // 结束StrictMode包裹
);
