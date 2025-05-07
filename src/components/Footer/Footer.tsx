import React from "react";
import { Link } from "react-router-dom";

export const Footer = (): JSX.Element => {
  const currentYear = new Date().getFullYear();
  
  const legalLinks = [
    { text: "隐私政策", path: "/privacy" },
    { text: "使用条款", path: "/terms" },
    { text: "Cookie政策", path: "/cookies" },
    { text: "联系我们", path: "/contact" },
  ];

  return (
    <footer className="w-full bg-gray-100 py-8 px-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <img
              className="w-[84px] h-9 mb-4"
              alt="Company logo"
              src="/img/company-logo.png"
            />
            <p className="text-gray-600 text-sm">
              © {currentYear} 英语单词学习平台. 保留所有权利.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {legalLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                {link.text}
              </Link>
            ))}
          </div>
        </div>
        
        {/* <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-xs text-center">
            本网站内容仅供学习使用，不构成任何法律建议。使用本网站即表示您同意我们的使用条款和隐私政策。
          </p>
        </div> */}
      </div>
    </footer>
  );
}; 