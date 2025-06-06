import { Link } from "react-router-dom";

export const SidebarFooterLinks = (): JSX.Element => {
  return (
    <div className="mt-auto pt-6 text-center text-xs text-gray-500 dark:text-gray-400 space-x-3 flex flex-wrap justify-center leading-relaxed">
      <Link to="/about-us" className="hover:text-gray-700 dark:hover:text-gray-300">关于我们</Link>
      <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">招聘</a>
      <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">公众号</a>
      <Link to="/terms-of-service" className="hover:text-gray-700 dark:hover:text-gray-300">条款</Link>
      <Link to="/privacy-policy" className="hover:text-gray-700 dark:hover:text-gray-300">隐私</Link>
    </div>
  );
}; 