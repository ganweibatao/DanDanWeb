import { StrictMode } from "react"; // 引入React的StrictMode组件，用于在开发模式下检查潜在问题
import { createRoot } from "react-dom/client"; // 引入createRoot方法，用于创建React应用的根节点，根节点是React应用的起始点
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box } from "./screens/Box/Box"; // 引入Box组件，这是应用的主要界面组件
import { Information } from "./screens/Information/Information";
import { Login } from "./screens/Login/Login";
import { Register } from "./screens/Register/Register";
import { AccountManagement } from "./screens/AccountManagement/AccountManagement";
import { Students } from "./screens/Students/Students"; // 引入Students组件
import { MemorizeWords } from "./screens/MemorizeWords/MemorizeWords"; // 导入新的单词记忆组件

createRoot(document.getElementById("app") as HTMLElement).render( // 创建React应用的根节点，并将其渲染到id为"app"的HTML元素中
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Box />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/information" element={<Information />} />
        <Route path="/account" element={<AccountManagement />} />
        <Route path="/students" element={<Students />} />
        <Route path="/memorize" element={<MemorizeWords />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>, // 结束StrictMode包裹
);
