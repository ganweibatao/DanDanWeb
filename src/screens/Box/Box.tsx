import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../../components/ui/navigation-menu";
import { Separator } from "../../components/ui/separator";
import { Link } from "react-router-dom";

// Navigation menu items data
const navItems = [
  { text: "首页" },
  { text: "关于我们" },
  { text: "联系我们" },
  { text: "更多选项", hasDropdown: true },
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

// Footer links
const footerLinks = ["链接一", "链接二", "链接三", "链接四", "链接五"];

// Social media icons
const socialIcons = [
  { src: "/img/icon-facebook.svg", alt: "Icon facebook" },
  { src: "/img/icon-instagram.svg", alt: "Icon instagram" },
  { src: "/img/icon-x.svg", alt: "Icon x" },
  { src: "/img/icon-linkedin.svg", alt: "Icon linkedin" },
  { src: "/img/icon-youtube.svg", alt: "Icon youtube" },
];

// Footer legal links
const legalLinks = [
  { text: "© 2024 Relume. All rights reserved." },
  { text: "隐私政策", isLink: true },
  { text: "服务条款", isLink: true },
  { text: "Cookies设置", isLink: true },
];

export const Box = (): JSX.Element => {
  return (
    <div className="w-full">
      <div className="w-full">
        <header className="flex flex-col items-start">
          {/* Navigation Bar */}
          <nav className="flex flex-col w-full items-center bg-color-schemes-color-scheme-1-background border-b-2 border-[color:var(--color-schemes-color-scheme-1-border)]">
            <div className="flex h-[72px] items-center justify-between px-16 py-0 relative self-stretch w-full">
              <div className="flex items-center gap-6">
                <img
                  className="w-[84px] h-9"
                  alt="Company logo"
                  src="/img/company-logo.svg"
                />

                <NavigationMenu>
                  <NavigationMenuList className="flex items-center gap-8">
                    {navItems.map((item, index) => (
                      <NavigationMenuItem key={index}>
                        {item.hasDropdown ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-text-regular-normal text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-regular-normal-font-size)] tracking-[var(--text-regular-normal-letter-spacing)] leading-[var(--text-regular-normal-line-height)]">
                              {item.text}
                            </span>
                            <ChevronDownIcon className="w-6 h-6" />
                          </div>
                        ) : (
                          <NavigationMenuLink className="font-text-regular-normal text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-regular-normal-font-size)] tracking-[var(--text-regular-normal-letter-spacing)] leading-[var(--text-regular-normal-line-height)]">
                            {item.text}
                          </NavigationMenuLink>
                        )}
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="px-5 py-2 rounded-xl border-2 border-solid border-[color:var(--primitives-color-neutral-darkest)]"
                  >
                    <span className="font-text-regular-medium text-[color:var(--primitives-color-neutral-darkest)] text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)]">
                      登录
                    </span>
                  </Button>
                </Link>

                <Link to="/register">
                  <Button className="px-5 py-2 bg-[color:var(--primitives-color-neutral-darkest)] rounded-xl border border-solid border-[color:var(--primitives-color-neutral-darkest)]">
                    <span className="font-text-regular-medium text-primitives-color-white text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)]">
                      注册
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="flex flex-col w-full items-center gap-20 px-16 py-28 bg-color-schemes-color-scheme-1-background">
            <div className="flex flex-col w-[768px] items-center gap-8">
              <div className="flex flex-col items-center gap-6 self-stretch w-full">
                <h1 className="self-stretch font-heading-desktop-h1 text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--heading-desktop-h1-font-size)] text-center tracking-[var(--heading-desktop-h1-letter-spacing)] leading-[var(--heading-desktop-h1-line-height)]">
                  轻松学英语，快乐掌握单词
                </h1>

                <p className="self-stretch font-text-medium-normal text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-medium-normal-font-size)] text-center tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)]">
                  我们的平台专为小学生设计，让学习英语单词变得简单有趣。通过生动的卡通风格和互动学习，激发孩子们的学习兴趣。
                </p>
              </div>

              <div className="flex items-start gap-4">
                <Button className="px-6 py-2.5 bg-[color:var(--primitives-color-neutral-darkest)] rounded-xl border border-solid border-[color:var(--primitives-color-neutral-darkest)]">
                  <span className="font-text-regular-medium text-primitives-color-white text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)]">
                    了解更多
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="px-6 py-2.5 rounded-xl border-2 border-solid border-[color:var(--primitives-color-neutral-darkest)]"
                >
                  <span className="font-text-regular-medium text-[color:var(--primitives-color-neutral-darkest)] text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)]">
                    注册
                  </span>
                </Button>
              </div>
            </div>

            <img
              className="w-full h-[738px] object-cover"
              alt="Placeholder image"
              src="/img/placeholder-image.png"
            />
          </section>

          {/* Features Section */}
          <section className="flex flex-col w-full items-start gap-20 px-16 py-28 bg-[color:var(--color-schemes-color-scheme-2-background)]">
            <div className="flex items-start gap-20 self-stretch w-full">
              <div className="flex flex-col items-start gap-4 flex-1">
                <h3 className="self-stretch font-heading-desktop-h3 text-[color:var(--color-schemes-color-scheme-2-text)] text-[length:var(--heading-desktop-h3-font-size)] tracking-[var(--heading-desktop-h3-letter-spacing)] leading-[var(--heading-desktop-h3-line-height)]">
                  我们的学习系统让孩子们轻松掌握英语单词
                </h3>
              </div>

              <div className="flex flex-col items-start gap-6 flex-1">
                <p className="self-stretch font-text-medium-normal text-[color:var(--color-schemes-color-scheme-2-text)] text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)]">
                  通过互动学习，孩子们可以在轻松愉快的环境中掌握新单词。我们的系统结合了艾宾浩斯记忆法，帮助学生巩固记忆。老师可以实时跟踪学生的学习进度，确保每个孩子都能获得最佳学习效果。
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-16 self-stretch w-full">
              <div className="flex items-start justify-center gap-12 self-stretch w-full">
                {featureCards.map((card, index) => (
                  <Card
                    key={index}
                    className="flex-1 bg-transparent border-none"
                  >
                    <CardContent className="flex flex-col items-start gap-8 p-0">
                      <div className="flex flex-col items-start gap-6 self-stretch w-full">
                        <img
                          className="w-12 h-12"
                          alt="Icon relume"
                          src={card.icon}
                        />

                        <h5 className="self-stretch font-heading-desktop-h5 text-[color:var(--color-schemes-color-scheme-2-text)] text-[length:var(--heading-desktop-h5-font-size)] tracking-[var(--heading-desktop-h5-letter-spacing)] leading-[var(--heading-desktop-h5-line-height)]">
                          {card.title}
                        </h5>

                        <p className="self-stretch font-text-regular-normal text-[color:var(--color-schemes-color-scheme-2-text)] text-[length:var(--text-regular-normal-font-size)] tracking-[var(--text-regular-normal-letter-spacing)] leading-[var(--text-regular-normal-line-height)]">
                          {card.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Fun Learning Section */}
          <section className="flex flex-col w-full items-start gap-20 px-16 py-28 bg-color-schemes-color-scheme-1-background">
            <div className="flex items-center gap-20 self-stretch w-full">
              <div className="flex flex-col items-start gap-8 flex-1">
                <div className="flex flex-col items-start gap-8 self-stretch w-full">
                  <div className="flex flex-col items-start gap-4 self-stretch w-full">
                    <div className="flex items-center">
                      <span className="font-heading-desktop-tagline text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--heading-desktop-tagline-font-size)] tracking-[var(--heading-desktop-tagline-letter-spacing)] leading-[var(--heading-desktop-tagline-line-height)]">
                        乐趣
                      </span>
                    </div>

                    <div className="flex flex-col items-start gap-6 self-stretch w-full">
                      <h2 className="self-stretch font-heading-desktop-h2 text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--heading-desktop-h2-font-size)] tracking-[var(--heading-desktop-h2-letter-spacing)] leading-[var(--heading-desktop-h2-line-height)]">
                        让学习英语变得轻松有趣
                      </h2>

                      <p className="self-stretch font-text-medium-normal text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)]">
                        我们的平台专为小学生设计，提供丰富多彩的单词学习体验。通过互动和游戏化的方式，孩子们可以在快乐中掌握英语单词。
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

                        <p className="flex-1 font-text-regular-normal text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-regular-normal-font-size)] tracking-[var(--text-regular-normal-letter-spacing)] leading-[var(--text-regular-normal-line-height)]">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <Button
                    variant="outline"
                    className="px-6 py-2.5 rounded-xl border-2 border-solid border-[color:var(--primitives-color-neutral-darkest)]"
                  >
                    <span className="font-text-regular-medium text-[color:var(--primitives-color-neutral-darkest)] text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)]">
                      了解更多
                    </span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="flex items-center justify-center gap-2 rounded-xl"
                  >
                    <span className="font-text-regular-medium text-[color:var(--primitives-color-neutral-darkest)] text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)]">
                      注册
                    </span>
                    <ChevronRightIcon className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              <img
                className="h-[640px] flex-1 object-cover"
                alt="Placeholder image"
                src="/img/placeholder-image-1.png"
              />
            </div>
          </section>

          {/* Try Our Tools Section */}
          <section className="flex flex-col w-full items-start gap-20 px-16 py-28 bg-[color:var(--color-schemes-color-scheme-2-background)]">
            <div className="flex items-center gap-20 self-stretch w-full">
              <div className="flex flex-col items-start gap-8 flex-1">
                <div className="flex flex-col items-start gap-6 self-stretch w-full">
                  <h2 className="self-stretch font-heading-desktop-h2 text-[color:var(--color-schemes-color-scheme-2-text)] text-[length:var(--heading-desktop-h2-font-size)] tracking-[var(--heading-desktop-h2-letter-spacing)] leading-[var(--heading-desktop-h2-line-height)]">
                    立即体验我们的学习工具
                  </h2>

                  <p className="self-stretch font-text-medium-normal text-[color:var(--color-schemes-color-scheme-2-text)] text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)]">
                    让您的学生在轻松愉快的环境中学习英语单词，提升学习效果！
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <Button className="px-6 py-2.5 bg-[color:var(--primitives-color-neutral-darkest)] rounded-xl border border-solid border-[color:var(--primitives-color-neutral-darkest)]">
                    <span className="font-text-regular-medium text-primitives-color-white text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)]">
                      试用
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="px-6 py-2.5 rounded-xl border-2 border-solid border-[color:var(--primitives-color-neutral-darkest)]"
                  >
                    <span className="font-text-regular-medium text-[color:var(--primitives-color-neutral-darkest)] text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)]">
                      注册
                    </span>
                  </Button>
                </div>
              </div>

              <img
                className="h-[400px] flex-1 object-cover"
                alt="Placeholder image"
                src="/img/placeholder-image-2.png"
              />
            </div>
          </section>

          {/* Footer */}
          <footer className="flex flex-col w-full items-center gap-20 px-16 py-20 bg-color-schemes-color-scheme-1-background">
            <div className="flex items-center gap-8 self-stretch w-full">
              <div className="flex flex-col items-start gap-6 flex-1">
                <img
                  className="w-[84px] h-9"
                  alt="Company logo"
                  src="/img/company-logo-1.svg"
                />
              </div>

              <div className="flex items-start gap-8">
                {footerLinks.map((link, index) => (
                  <span
                    key={index}
                    className="font-text-small-semi-bold text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-small-semi-bold-font-size)] tracking-[var(--text-small-semi-bold-letter-spacing)] leading-[var(--text-small-semi-bold-line-height)]"
                  >
                    {link}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 flex-1">
                {socialIcons.map((icon, index) => (
                  <img
                    key={index}
                    className="w-6 h-6"
                    alt={icon.alt}
                    src={icon.src}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-8 self-stretch w-full">
              <Separator className="w-full h-0.5" />

              <div className="flex items-start gap-6">
                {legalLinks.map((link, index) => (
                  <span
                    key={index}
                    className={`font-text-small-${link.isLink ? "link" : "normal"} text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-small-${link.isLink ? "link" : "normal"}-font-size)] tracking-[var(--text-small-${link.isLink ? "link" : "normal"}-letter-spacing)] leading-[var(--text-small-${link.isLink ? "link" : "normal"}-line-height)] ${link.isLink ? "underline" : ""}`}
                  >
                    {link.text}
                  </span>
                ))}
              </div>
            </div>
          </footer>
        </header>
      </div>
    </div>
  );
};
