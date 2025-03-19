# 项目结构说明

## 项目概述
这是一个使用React和TypeScript构建的前端项目，使用Vite作为开发服务器和构建工具。

## 启动项目
```bash
cd home && npm run dev
```
项目将在本地启动，默认访问地址：http://localhost:5175/

## 目录结构

### src目录结构及作用

1. **src/index.tsx**
   - 项目的入口文件
   - 负责渲染React应用到DOM中
   - 引入并渲染主要组件Box

2. **src/components/**
   - 包含可复用的UI组件
   - **src/components/ui/**
     - **button.tsx**: 定义按钮组件
     - **card.tsx**: 定义卡片组件
     - **navigation-menu.tsx**: 定义导航菜单组件
     - **separator.tsx**: 定义分隔符组件

3. **src/lib/**
   - 包含工具函数和辅助库
   - **utils.ts**: 通用工具函数

4. **src/screens/**
   - 包含应用的主要页面组件
   - **src/screens/Box/**
     - **Box.tsx**: 主要页面组件，从入口文件可以看出这是应用的主要界面

## 技术栈
- React
- TypeScript
- Vite
- Tailwind CSS (根据项目文件tailwind.config.js和tailwind.css推断)

## 项目特点
这是一个典型的React项目结构，采用了组件化的开发方式：
- components目录存放可复用的UI组件
- lib目录存放工具函数和辅助库
- screens目录存放主要页面组件
- index.tsx作为应用入口，负责渲染主要组件 