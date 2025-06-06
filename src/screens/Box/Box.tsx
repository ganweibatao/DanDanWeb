import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../../components/ui/navigation-menu";
import { Link } from "react-router-dom";

// Navigation menu items data
const navItems = [
  { text: "首页", path: "/" },
  { text: "关于我们", path: "/" },
  { text: "联系我们", path: "/" },
  { text: "更多选项", hasDropdown: true, path: "/" },
];

// Feature cards data
const featureCards = [
  {
    icon: "/img/icon-relume.svg",
    title: "我们的系统如何帮助学生高效学习英语单词",
    description: "通过个性化学习，提升学生的英语能力。",
  },
  {
    icon: "/img/icon-relume-1.svg",
    title: "实时监控学生学习效果，确保每个孩子的进步",
    description: "老师可以轻松查看学生的学习历史和效果。",
  },
  {
    icon: "/img/icon-relume-2.svg",
    title: "通过游戏化学习，激发学生的学习兴趣",
    description: "让学习变得有趣，孩子们爱上英语单词。",
  },
];

// Feature list items
const featureListItems = [
  "个性化学习，适合每个学生的需求",
  "历史学习记录，帮助追踪进步",
  "艾宾浩斯记忆法，提升记忆效果",
];


// Footer legal links
const legalLinks = [
  { text: "粤ICP备2024314890号", isLink: true, href: "https://beian.miit.gov.cn" },
  { text: "隐私政策", isLink: true, href: "/privacy-policy" },
  { text: "服务条款", isLink: true, href: "/terms-of-service" },
  { text: "Cookies设置", isLink: true },
];

// 添加动画变体
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 10,
      duration: 0.6 
    } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

// 浮动动画
const floatingAnimation = {
  y: [0, -15, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// 创建一个动画元素组件
const AnimatedSection = ({ children, className, delay = 0, ...props }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  [key: string]: any;
}) => {
  const controls = useAnimation();
  const ref = React.useRef(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.2
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            duration: 0.6, 
            delay 
          } 
        }
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Box = (): JSX.Element => {
  // 添加滚动位置状态
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="w-full">
        <header className="flex flex-col items-start">
          {/* Navigation Bar */}
          <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col w-full items-center bg-white dark:bg-gray-800 border-b-2 border-daxiran-green-medium dark:border-daxiran-green-light"
          >
            <div className="flex h-[72px] items-center justify-between px-16 py-0 relative self-stretch w-full">
              <div className="flex items-center gap-6">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="w-[84px] h-9"
                  alt="Company logo"
                  src="/img/company-logo.png"
                />

                <NavigationMenu>
                  <NavigationMenuList className="flex items-center gap-8">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <NavigationMenuItem>
                          {item.hasDropdown ? (
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center justify-center gap-1"
                            >
                              <span className="font-text-regular-normal text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--text-regular-normal-font-size)] tracking-[var(--text-regular-normal-letter-spacing)] leading-[var(--text-regular-normal-line-height)]">
                                {item.text}
                              </span>
                              <ChevronDownIcon className="w-6 h-6" />
                            </motion.div>
                          ) : (
                            <NavigationMenuLink asChild>
                              <motion.div whileHover={{ scale: 1.05 }}>
                                <Link 
                                  to={item.path} 
                                  className="font-text-regular-normal text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--text-regular-normal-font-size)] tracking-[var(--text-regular-normal-letter-spacing)] leading-[var(--text-regular-normal-line-height)]"
                                >
                                  {item.text}
                                </Link>
                              </motion.div>
                            </NavigationMenuLink>
                          )}
                        </NavigationMenuItem>
                      </motion.div>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Link to="/login" state={{ defaultMode: 'email' }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="px-5 py-2 rounded-xl border-2 border-solid border-daxiran-green-dark dark:border-daxiran-green-light"
                    >
                      <span className="font-text-regular-medium text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)]">
                        登录
                      </span>
                    </Button>
                  </motion.div>
                </Link>

                <Link to="/register" state={{ defaultMode: 'email' }}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Button className="px-5 py-2 bg-daxiran-green-medium hover:bg-daxiran-green-dark text-white dark:bg-daxiran-green-dark dark:hover:bg-daxiran-green-medium rounded-xl border border-solid border-transparent">
                      <span className="font-text-regular-medium text-white text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)]">
                        注册
                      </span>
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.nav>

          {/* Hero Section */}
          <section className="flex flex-col w-full items-center gap-0 px-16 py-16 bg-daxiran-green-lightest dark:bg-daxiran-green-dark">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex flex-col w-[768px] items-center gap-8"
            >
              <motion.div variants={fadeInUp} className="flex flex-col items-center gap-6 self-stretch w-full">
                <motion.h1 
                  variants={fadeInUp}
                  className="self-stretch font-heading-desktop-h1 text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--heading-desktop-h1-font-size)] text-center tracking-[var(--heading-desktop-h1-letter-spacing)] leading-[var(--heading-desktop-h1-line-height)]"
                >
                  轻松学英语，快乐掌握单词
                </motion.h1>

                <motion.p 
                  variants={fadeInUp}
                  className="self-stretch font-text-medium-normal text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--text-medium-normal-font-size)] text-center tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)]"
                >
                  我们的平台专为学生设计，让学习英语单词变得简单有趣。通过生动的卡通风格和互动学习，激发孩子们的学习兴趣。
                </motion.p>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                className="flex items-start gap-4"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.img
              animate={floatingAnimation}
              className="w-full h-[600px] object-cover -mt-2"
              alt="Placeholder image"
              src="/img/learning.png"
            />
          </section>

          {/* Features Section */}
          <AnimatedSection className="flex flex-col w-full items-start gap-20 px-16 py-28 bg-white dark:bg-gray-900">
            <div className="flex items-start gap-20 self-stretch w-full">
              <motion.div 
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="flex flex-col items-start gap-4 flex-1"
              >
                <h3 className="self-stretch font-heading-desktop-h3 text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--heading-desktop-h3-font-size)] tracking-[var(--heading-desktop-h3-letter-spacing)] leading-[var(--heading-desktop-h3-line-height)]">
                  我们的学习系统让孩子们轻松掌握英语单词
                </h3>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="flex flex-col items-start gap-6 flex-1"
              >
              </motion.div>
            </div>

            <div className="flex flex-col items-start gap-16 self-stretch w-full">
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="flex items-start justify-center gap-12 self-stretch w-full"
              >
                {featureCards.map((card, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    whileHover={{ 
                      y: -10,
                      transition: { duration: 0.2 }
                    }}
                    className="flex-1"
                  >
                    <Card className="flex-1 bg-transparent border-none">
                      <CardContent className="flex flex-col items-start gap-8 p-0">
                        <div className="flex flex-col items-start gap-6 self-stretch w-full">
                          <motion.img
                            whileHover={{ rotate: 10 }}
                            className="w-12 h-12"
                            alt="Icon relume"
                            src={card.icon}
                          />

                          <h5 className="self-stretch font-heading-desktop-h5 text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--heading-desktop-h5-font-size)] tracking-[var(--heading-desktop-h5-letter-spacing)] leading-[var(--heading-desktop-h5-line-height)]">
                            {card.title}
                          </h5>

                          <p className="self-stretch font-text-regular-normal text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--text-regular-normal-font-size)] tracking-[var(--text-regular-normal-letter-spacing)] leading-[var(--text-regular-normal-line-height)]">
                            {card.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Fun Learning Section */}
          <AnimatedSection className="flex flex-col w-full items-start gap-20 px-16 py-28 bg-daxiran-green-lightest dark:bg-daxiran-green-dark">
            <div className="flex items-center gap-20 self-stretch w-full">
              <div className="flex flex-col items-start gap-8 flex-1">
                <div className="flex flex-col items-start gap-8 self-stretch w-full">
                  <div className="flex flex-col items-start gap-4 self-stretch w-full">
                    <div className="flex items-center">
                      <span className="font-heading-desktop-tagline text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--heading-desktop-tagline-font-size)] tracking-[var(--heading-desktop-tagline-letter-spacing)] leading-[var(--heading-desktop-tagline-line-height)]">
                        乐趣
                      </span>
                    </div>

                    <div className="flex flex-col items-start gap-6 self-stretch w-full">
                      <h2 className="self-stretch font-heading-desktop-h2 text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--heading-desktop-h2-font-size)] tracking-[var(--heading-desktop-h2-letter-spacing)] leading-[var(--heading-desktop-h2-line-height)]">
                        让学习英语变得轻松有趣
                      </h2>

                      <p className="self-stretch font-text-medium-normal text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)]">
                        提供丰富多彩的单词学习体验。通过互动和游戏化的方式，孩子们可以在快乐中掌握英语单词。
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start px-0 py-2 gap-4 self-stretch w-full">
                    {featureListItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 self-stretch w-full"
                      >
                        <img
                          className="w-4 h-4"
                          alt="Icon relume"
                          src="/img/icon-relume-5.svg"
                        />

                        <p className="flex-1 font-text-regular-normal text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--text-regular-normal-font-size)] tracking-[var(--text-regular-normal-letter-spacing)] leading-[var(--text-regular-normal-line-height)]">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                </div>
              </div>

              <img
                className="h-[640px] flex-1 object-cover"
                alt="Placeholder image"
                src="/img/egg_swimming.png"
              />
            </div>
          </AnimatedSection>

          {/* Try Our Tools Section */}
          <AnimatedSection className="flex flex-col w-full items-start gap-20 px-16 py-28 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-20 self-stretch w-full">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col items-start gap-8 flex-1"
              >
                <div className="flex flex-col items-start gap-6 self-stretch w-full">
                  <motion.h2 
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.5 }}
                    className="self-stretch font-heading-desktop-h2 text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--heading-desktop-h2-font-size)] tracking-[var(--heading-desktop-h2-letter-spacing)] leading-[var(--heading-desktop-h2-line-height)]"
                  >
                    立即体验我们的学习工具
                  </motion.h2>

                  <motion.p 
                    whileInView={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="self-stretch font-text-medium-normal text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)]"
                  >
                    让您的学生在轻松愉快的环境中学习英语单词，提升学习效果！
                  </motion.p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  </motion.div>

                  <Link to="/register" state={{ defaultMode: 'email' }}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        className="px-6 py-2.5 rounded-xl border-2 border-solid border-daxiran-green-dark dark:border-daxiran-green-light"
                      >
                        <span className="font-text-regular-medium text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)]">
                          注册
                        </span>
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.img
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.7,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="h-[400px] flex-1 object-cover"
                alt="Placeholder image"
                src="/img/Superman.png"
              />
            </div>
          </AnimatedSection>

          {/* Footer */}
          <footer className="flex flex-col w-full items-center gap-5 px-16 py-5 bg-daxiran-green-lightest dark:bg-daxiran-green-dark">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-8 self-stretch w-full"
            >
              <div className="flex items-start gap-6">
                {legalLinks.map((link, index) => (
                  link.isLink && link.href ? (
                    <motion.a
                      key={index}
                      href={link.href}
                      target={link.href.startsWith('http') ? "_blank" : undefined}
                      rel={link.href.startsWith('http') ? "noopener noreferrer" : undefined}
                      whileHover={{ scale: 1.05 }}
                      className={`font-text-small-link text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--text-small-link-font-size)] tracking-[var(--text-small-link-letter-spacing)] leading-[var(--text-small-link-line-height)] underline`}
                    >
                      {link.text}
                    </motion.a>
                  ) : (
                  <motion.span
                    key={index}
                    whileHover={link.isLink ? { scale: 1.05 } : {}}
                    className={`font-text-small-${link.isLink ? "link" : "normal"} text-daxiran-green-dark dark:text-daxiran-green-lightest text-[length:var(--text-small-${link.isLink ? "link" : "normal"}-font-size)] tracking-[var(--text-small-${link.isLink ? "link" : "normal"}-letter-spacing)] leading-[var(--text-small-${link.isLink ? "link" : "normal"}-line-height)] ${link.isLink ? "underline" : ""}`}
                  >
                    {link.text}
                  </motion.span>
                  )
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center w-full">
                版权所有 © 小蜥蜴(深圳)信息技术有限责任公司
              </div>
            </motion.div>
          </footer>
        </header>
      </div>
    </div>
  );
};
