import React, { useState } from 'react';
import { SettingsSidebar } from '../../components/layout/SettingsRightSidebar';
import { Card, CardContent } from '../../components/ui/card'; // Removed unused CardHeader, CardTitle
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { XIcon } from 'lucide-react'; // Removed FlagIcon as we are using SVG
import { Sidebar } from '../../components/layout/Sidebar';

// Placeholder Flag component if FlagIcon isn't suitable
const UsFlagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 7410 3900" className="w-full h-full"> {/* Added className */}
    <rect width="7410" height="3900" fill="#b22234"/>
    <path d="M0,450H7410M0,1050H7410M0,1650H7410M0,2250H7410M0,2850H7410M0,3450H7410" stroke="#fff" strokeWidth="300"/>
    <rect width="2964" height="2100" fill="#3c3b6e"/>
    {/* Simplified star representation */}
    {[...Array(5)].map((_, r) =>
      [...Array(r % 2 === 0 ? 6 : 5)].map((_, c) => (
        <text
          key={`${r}-${c}`}
          x={148.2 + (r % 2 === 0 ? 0 : 247) + c * 494}
          y={210 + r * 360}
          fontSize="250"
          fill="#fff"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          ★
        </text>
      ))
    )}
  </svg>
);


export const DuolingoSchoolsPage = (): JSX.Element => {
  const [classCode, setClassCode] = useState('ABC123'); // Example initial value

  // Placeholder function for submitting class code
  const handleJoinClass = () => {
    console.log('Joining class with code:', classCode);
    // Add actual join logic here
  };

  // Placeholder function for removing a class
  const handleRemoveClass = (className: string) => {
    console.log('Removing class:', className);
    // Add actual remove logic here
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-100 text-gray-900 dark:text-gray-900 font-sans">
       <Sidebar /> {/* Use the shared Sidebar component */}

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto bg-white dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">蛋仔学校版</h1>

        {/* 我的班级 Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">我的班级</h2>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6"> {/* Container for flag */}
                   <UsFlagIcon /> {/* Using the placeholder US flag */}
                 </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">英语1</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">蛋仔_acf37534 (7510041637@qq.com)</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                onClick={() => handleRemoveClass('英语1')}
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
          {/* Add more classes here if needed */}
        </section>

        {/* 加入班级 Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">加入班级</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            请在这里输入老师发给你的 6 个字母的代码。加入班级后，老师就可以了解你的学习进度、管理你的帐户，并在蛋仔上给你布置作业。
          </p>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="输入班级代码"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())} // Convert to uppercase for consistency?
              maxLength={6} // Enforce 6 characters
              className="flex-grow bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100" // Added text color
            />
            <Button
              onClick={handleJoinClass}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 font-semibold py-2 px-4 rounded-md"
              // Disable button if code length is not 6?
              // disabled={classCode.length !== 6}
            >
              提交
            </Button>
          </div>
        </section>
      </main>

      {/* Settings Sidebar */}
      <SettingsSidebar />
    </div>
  );
}; 