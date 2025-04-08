import React from 'react';

const footerLinks = [
  { text: "关于我们", path: "/about" },
  { text: "招聘贤才", path: "/careers" },
  { text: "投资者", path: "/investors" },
  { text: "条款", path: "/terms" },
  { text: "隐私", path: "/privacy" },
];

export const AppFooter = () => {
  return (
    <footer className="w-full py-4 mt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {footerLinks.map((link) => (
            <a 
              key={link.text} 
              href={link.path} 
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:underline"
              onClick={(e) => { e.preventDefault(); console.log(`Navigate to ${link.path}`); /* Replace with actual navigation */ }}
            >
              {link.text}
            </a>
          ))}
        </nav>
        {/* Optional: Add copyright or other info here */}
        {/* <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">© 2024 DanZai. All rights reserved.</p> */}
      </div>
    </footer>
  );
}; 