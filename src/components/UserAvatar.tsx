import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User, MessageSquare, BookOpen, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface UserAvatarProps {
  imageUrl?: string;
  fallbackText?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  imageUrl,
  fallbackText = 'U',
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 清除本地存储的用户信息
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // 清除 axios 默认 header
    delete axios.defaults.headers.common["Authorization"];
    
    // 跳转到首页
    navigate("/");
  };

  const handleAccountManagement = () => {
    navigate("/account");
  };

  return (
    <DropdownMenu defaultOpen={false}>
      <DropdownMenuTrigger asChild>
        <div className="relative group">
          <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
            {imageUrl ? (
              <AvatarImage src={imageUrl} alt="用户头像" />
            ) : (
              <AvatarFallback>{fallbackText}</AvatarFallback>
            )}
          </Avatar>
          <div className="absolute invisible group-hover:visible w-48 right-0 top-full pt-2 z-50 transition-all duration-300 ease-in-out transform origin-top-right group-hover:scale-100 scale-95 opacity-0 group-hover:opacity-100">
            <div className="bg-white rounded-lg border shadow-xl p-2 space-y-1.5 backdrop-blur-sm bg-opacity-95">
              <div 
                className="cursor-pointer flex items-center gap-2 px-3 py-2.5 bg-gray-50/80 rounded-md shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-100/80 hover:translate-x-1 hover:-translate-y-0.5 transform"
                onClick={handleAccountManagement}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:rotate-12 transition-transform duration-200">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-medium">账号管理</span>
              </div>
              <div className="cursor-pointer flex items-center gap-2 px-3 py-2.5 bg-gray-50/80 rounded-md shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-100/80 hover:translate-x-1 hover:-translate-y-0.5 transform">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:rotate-12 transition-transform duration-200">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="font-medium">课程管理</span>
              </div>
              <div className="cursor-pointer flex items-center gap-2 px-3 py-2.5 bg-gray-50/80 rounded-md shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-100/80 hover:translate-x-1 hover:-translate-y-0.5 transform">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:rotate-12 transition-transform duration-200">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="font-medium">意见与反馈</span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-1" />
              <div 
                className="cursor-pointer flex items-center gap-2 px-3 py-2.5 bg-red-50/80 rounded-md shadow-sm hover:shadow-md transition-all duration-200 hover:bg-red-100/80 hover:translate-x-1 hover:-translate-y-0.5 transform"
                onClick={handleLogout}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 group-hover:rotate-12 transition-transform duration-200">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                <span className="font-medium text-red-600">退出登录</span>
              </div>
            </div>
          </div>
        </div>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}; 