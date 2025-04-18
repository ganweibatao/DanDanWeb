import React from 'react';

export const SidebarFooterLinks = (): JSX.Element => {
  return (
    <div className="mt-auto pt-6 text-center text-xs text-gray-500 dark:text-gray-400 space-x-3 flex flex-wrap justify-center leading-relaxed">
      <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">关于</a>
      <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">职业</a>
      <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">投资者</a>
      <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">条款</a>
      <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">隐私</a>
    </div>
  );
}; 