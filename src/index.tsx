import { createRoot } from "react-dom/client"; // 引入createRoot方法，用于创建React应用的根节点，根节点是React应用的起始点
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // <-- 导入 React Query 相关
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // <-- 导入 React Query Devtools
import { Box } from "./screens/Box/Box"; // 引入Box组件，这是应用的主要界面组件
import { Register } from "./screens/LoginRegister/Register.tsx";
import { Login } from "./screens/LoginRegister/Login.tsx"; // Import the new Login component
import { Students } from "./screens/Students/Students"; // 引入Students组件
import { MemorizeWords } from "./screens/MemorizeWords/MemorizeWords"; // 导入新的单词记忆组件
import { WordSnake } from "./screens/WordSnake/WordSnake"; // 导入贪吃蛇单词游戏组件
import { LearningReportPage } from './screens/LearningReportPage.tsx';
import { LeaderboardsPage } from './screens/LeaderboardsPage'; // Import LeaderboardsPage
import { HelpPage } from './screens/HelpPage'; // Import HelpPage
import { TeacherPage } from './screens/Teachers/TeacherPage.tsx';
import { SettingsPage } from './screens/Settings/SettingsPage.tsx';
import { ProfileSettingsPage } from './screens/Settings/ProfileSettingsPage.tsx';
import { PrivacySettingsPage } from './screens/Settings/PrivacySettingsPage.tsx';
import { BindWeChatPage } from './screens/Settings/BindWeChatPage';
import { VocabularyPage } from './screens/VocabularyPage.tsx';
import { TeacherProfilePage } from './screens/Teachers/TeacherProfilePage.tsx';
import 'nprogress/nprogress.css';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import DesignToolPage from "./screens/DesignToolPage";
import StorePage from './screens/StorePage.tsx';
import FeedbackPage from './screens/FeedbackPage.tsx';
import { useEffect } from "react";
import PrivacyPolicyPage from "./screens/PrivacyPolicyPage";
import TermsOfServicePage from "./screens/TermsOfServicePage";
import AboutUsPage from "./screens/AboutUsPage";
import { ResetPassword } from "./screens/LoginRegister/ResetPassword.tsx";
import DuolingoPreStudyTestPage from "./screens/DuolingoPreStudyTestPage"; // <-- 修正导入路径
import VocabularyTestPage from "./screens/VocabularyTest/VocabularyTestPage";
import StudyPlanPreviewPage from "./screens/StudyPlanPreviewPage"; // <-- 添加导入
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';

// 创建一个 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 默认缓存时间为 7 天 (gcTime in v5, cacheTime in v4)
      staleTime: 1000 * 60 * 60, // 默认数据视为 1 小时内新鲜
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => await get(key),
    setItem: async (key, value) => await set(key, value),
    removeItem: async (key) => await del(key),
  },
  key: 'reactQuery',
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24 * 60,
  // 关键：只持久化非发音相关的 query
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      // 只要 queryKey 不是 ['pronunciationBlob', ...] 就持久化
      const key = query.queryKey;
      if (Array.isArray(key) && key[0] === 'pronunciationBlob') {
        return false; // 不持久化发音 Blob
      }
      return true; // 其它都持久化
    }
  }
});

function ThemeController() {
  const location = useLocation();
  const { settings } = useSettings();

  useEffect(() => {
    if (
      location.pathname === "/" ||
      location.pathname === "/login-and-register"
    ) {
      document.documentElement.classList.remove("dark");
    } else {
      if (settings.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (settings.theme === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        if (systemTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }
  }, [location.pathname, settings.theme]);

  return null;
}

createRoot(document.getElementById("app") as HTMLElement).render( // 创建React应用的根节点，并将其渲染到id为"app"的HTML元素中
  // <StrictMode>
    <QueryClientProvider client={queryClient}> {/* <-- QueryClientProvider 已存在 */}
      <BrowserRouter>
        <SettingsProvider>
          <ThemeController />
          <Routes>
            <Route path="/" element={<Box />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} /> {/* Add new route for Login */}
            <Route path="/students/:studentId" element={<Students />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:studentId/memorize" element={<MemorizeWords />} />
            <Route path="/word-snake" element={<WordSnake />} />
            <Route path="/profile/:studentId" element={<LearningReportPage />} />
            <Route path="/profile" element={<LearningReportPage />} />
            <Route path="/leaderboards/:studentId" element={<LeaderboardsPage />} />
            <Route path="/leaderboards" element={<LeaderboardsPage />} />
            <Route path="/quests/:studentId" element={<VocabularyPage />} />
            <Route path="/quests" element={<VocabularyPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/teacher" element={<TeacherPage />} />
            <Route path="/settings/preferences/:studentId" element={<SettingsPage />} />
            <Route path="/settings/preferences" element={<SettingsPage />} />
            <Route path="/teacher/settings" element={<TeacherProfilePage />} /> {/* <-- 添加教师设置路由 */}
            <Route path="/settings/profile/:studentId" element={<ProfileSettingsPage />} />
            <Route path="/settings/profile" element={<ProfileSettingsPage />} />
            <Route path="/settings/privacy/:studentId" element={<PrivacySettingsPage />} />
            <Route path="/settings/privacy" element={<PrivacySettingsPage />} />
            <Route path="/settings/bind-wechat" element={<BindWeChatPage />} />
            <Route path="/design-tool" element={<DesignToolPage />} /> {/* <-- 添加 DesignToolPage 路由 */}
            <Route path="/danzai-store" element={<StorePage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/logout" element={<Navigate to="/login" replace />} /> {/* Update logout redirect */}
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/duolingo-pre-study-test" element={<DuolingoPreStudyTestPage />} /> {/* <-- 添加新页面的路由 */}
            <Route path="/vocabulary-test" element={<VocabularyTestPage />} /> {/* <-- 添加词汇测试页面路由 */}
            <Route path="/study-plan-preview" element={<StudyPlanPreviewPage />} /> {/* <-- 添加预览页面路由 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SettingsProvider>
      </BrowserRouter>
    <ReactQueryDevtools initialIsOpen={false} /> {/* 修正组件大小写 */}
    </QueryClientProvider>
  // </StrictMode>, // 结束StrictMode包裹
);

if (process.env.NODE_ENV === 'development') {
  (window as any).__REACT_QUERY_CLIENT__ = queryClient;
}
