// 这是一个可复用的输入框组件：
// 继承了原生HTML input元素的所有属性
// 使用React.forwardRef实现引用传递
// 通过cn函数合并自定义样式和默认样式
// 有统一的UI风格：圆角边框、内边距、聚焦时有轮廓环效果等
// 支持禁用状态及文件上传功能的样式
import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-[#222] dark:text-white dark:border-[#444] dark:placeholder:text-gray-400 dark:focus-visible:bg-[#333]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input }; 