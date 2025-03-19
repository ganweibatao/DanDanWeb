import { StrictMode } from "react"; // 引入React的StrictMode组件，用于在开发模式下检查潜在问题
import { createRoot } from "react-dom/client"; // 引入createRoot方法，用于创建React应用的根节点，根节点是React应用的起始点
import { Box } from "./screens/Box/Box"; // 引入Box组件，这是应用的主要界面组件

createRoot(document.getElementById("app") as HTMLElement).render( // 创建React应用的根节点，并将其渲染到id为"app"的HTML元素中
  <StrictMode> // 使用StrictMode包裹应用，启用严格模式检查
    <Box /> // 渲染Box组件
  </StrictMode>, // 结束StrictMode包裹
);
