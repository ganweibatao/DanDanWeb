import { ChevronRightIcon } from "lucide-react";
import React from "react";
import { Avatar } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Information = (): JSX.Element => {
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

  const handleBack = () => {
    // 返回首页
    navigate("/");
  };

  const featureCards = [
    {
      icon: "/img/icon-relume.svg",
      title: "设置选项：个性化您的学习体验，满足您的需求",
      description: "轻松调整您的账户设置，优化学习体验。",
      linkText: "设置",
    },
    {
      icon: "/img/icon-relume-1.svg",
      title: "使用时长：了解您在平台上的学习时间",
      description: "查看您在网站上花费的时间，帮助您合理安排学习计划。",
      linkText: "时长",
    },
    {
      icon: "/img/icon-relume-2.svg",
      title: "学生列表：快速访问您所有的学生信息",
      description: "一键查看所有学生的学习情况，便于管理和跟踪。",
      linkText: "学生",
    },
  ];

  const students = [
    {
      name: "张三",
      role: "学生",
      description: "点击查看张三的学习详情和进步记录。",
      image: "/img/placeholder-image-4.png",
    },
    {
      name: "李四",
      role: "学生",
      description: "点击查看李四的学习详情和进步记录。",
      image: "/img/placeholder-image-4.png",
    },
    {
      name: "王五",
      role: "学生",
      description: "点击查看王五的学习详情和进步记录。",
      image: "/img/placeholder-image-4.png",
    },
    {
      name: "赵六",
      role: "学生",
      description: "点击查看赵六的学习详情和进步记录。",
      image: "/img/placeholder-image-4.png",
    },
    {
      name: "钱七",
      role: "学生",
      description: "点击查看钱七的学习详情和进步记录。",
      image: "/img/placeholder-image-4.png",
    },
  ];

  return (
    <main className="w-full">
      <div className="w-full">
        <div className="flex flex-col">
          <section className="flex flex-col w-full h-[369px] items-start gap-20 px-16 py-28 bg-color-schemes-color-scheme-1-background">
            <div className="flex flex-col w-[768px] items-start gap-6 flex-1">
              <h1 className="font-heading-desktop-h1 text-[length:var(--heading-desktop-h1-font-size)] tracking-[var(--heading-desktop-h1-letter-spacing)] leading-[var(--heading-desktop-h1-line-height)] self-stretch font-[number:var(--heading-desktop-h1-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] [font-style:var(--heading-desktop-h1-font-style)]">
                欢迎回来，老师!
              </h1>
              <p className="font-text-medium-normal text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)] self-stretch font-[number:var(--text-medium-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] [font-style:var(--text-medium-normal-font-style)]">
                您已成功登录，开始管理您的学生和学习进度吧！
              </p>
            </div>
          </section>

          <section className="flex flex-col w-full items-start gap-20 px-16 py-28 bg-[color:var(--color-schemes-color-scheme-2-background)]">
            <div className="flex items-start gap-20 relative self-stretch w-full">
              <div className="gap-4 flex flex-col items-start flex-1">
                <h2 className="text-[length:var(--heading-desktop-h3-font-size)] tracking-[var(--heading-desktop-h3-letter-spacing)] leading-[var(--heading-desktop-h3-line-height)] self-stretch font-heading-desktop-h3 font-[number:var(--heading-desktop-h3-font-weight)] text-[color:var(--color-schemes-color-scheme-2-text)] [font-style:var(--heading-desktop-h3-font-style)]">
                  个人中心：轻松管理您的学生和学习进度
                </h2>
              </div>

              <div className="gap-6 flex flex-col items-start flex-1">
                <p className="self-stretch font-text-medium-normal font-[number:var(--text-medium-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-2-text)] text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)] [font-style:var(--text-medium-normal-font-style)]">
                  在个人中心，您可以方便地设置账户选项，查看使用网站的时长，以及管理您的学生列表。无论是跟踪学习效果还是查看历史记录，一切尽在掌握。让您的教学更加高效和有趣！
                </p>
                <p className="self-stretch font-text-medium-normal font-[number:var(--text-medium-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-2-text)] text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)] [font-style:var(--text-medium-normal-font-style)]">
                  登录时长：您已登录 2 小时 30 分钟。
                </p>
              </div>
            </div>

            <div className="flex-col items-start gap-16 self-stretch w-full flex">
              <div className="flex justify-center gap-12 self-stretch w-full items-start">
                {featureCards.map((card, index) => (
                  <Card
                    key={index}
                    className="flex flex-col items-start gap-8 flex-1 border-none bg-transparent"
                  >
                    <CardContent className="flex flex-col items-start gap-6 self-stretch w-full p-0">
                      <img
                        className="w-12 h-12"
                        alt="Feature icon"
                        src={card.icon}
                      />
                      <h3 className="text-[length:var(--heading-desktop-h5-font-size)] tracking-[var(--heading-desktop-h5-letter-spacing)] leading-[var(--heading-desktop-h5-line-height)] self-stretch font-heading-desktop-h5 font-[number:var(--heading-desktop-h5-font-weight)] text-[color:var(--color-schemes-color-scheme-2-text)] [font-style:var(--heading-desktop-h5-font-style)]">
                        {card.title}
                      </h3>
                      <p className="font-text-regular-normal text-[length:var(--text-regular-normal-font-size)] tracking-[var(--text-regular-normal-letter-spacing)] leading-[var(--text-regular-normal-line-height)] self-stretch font-[number:var(--text-regular-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-2-text)] [font-style:var(--text-regular-normal-font-style)]">
                        {card.description}
                      </p>
                    </CardContent>
                    <Button
                      variant="link"
                      className="p-0 flex items-center gap-2 text-[color:var(--primitives-color-neutral-darkest)]"
                    >
                      <span className="font-text-regular-medium font-[number:var(--text-regular-medium-font-weight)] text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)] whitespace-nowrap [font-style:var(--text-regular-medium-font-style)]">
                        {card.linkText}
                      </span>
                      <ChevronRightIcon className="w-6 h-6" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className="flex flex-col w-full items-start gap-20 px-16 py-28 bg-color-schemes-color-scheme-1-background">
            <div className="flex flex-col w-[768px] items-start gap-4">
              <div className="flex-col items-center gap-6 self-stretch w-full flex">
                <h2 className="text-[length:var(--heading-desktop-h2-font-size)] tracking-[var(--heading-desktop-h2-letter-spacing)] leading-[var(--heading-desktop-h2-line-height)] self-stretch font-heading-desktop-h2 font-[number:var(--heading-desktop-h2-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] [font-style:var(--heading-desktop-h2-font-style)]">
                  我们的学生
                </h2>
                <p className="self-stretch font-text-medium-normal font-[number:var(--text-medium-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)] [font-style:var(--text-medium-normal-font-style)]">
                  查看每个学生的学习进度和表现
                </p>
              </div>
            </div>

            <div className="flex-col items-start gap-16 self-stretch w-full flex">
              <div className="grid grid-cols-4 gap-8 self-stretch w-full">
                {students.slice(0, 4).map((student, index) => (
                  <Card
                    key={index}
                    className="flex flex-col items-start gap-6 flex-1 border-none bg-transparent"
                  >
                    <CardContent className="p-0 w-full">
                      <Avatar className="w-20 h-20 rounded-none">
                        <img
                          className="w-full h-full object-cover"
                          alt={`${student.name} profile`}
                          src={student.image}
                        />
                      </Avatar>

                      <div className="flex-col items-center gap-4 self-stretch w-full mt-6 flex">
                        <div className="flex flex-col items-center self-stretch w-full">
                          <h3 className="self-stretch mt-[-2.00px] font-text-large-semi-bold font-[number:var(--text-large-semi-bold-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-large-semi-bold-font-size)] tracking-[var(--text-large-semi-bold-letter-spacing)] leading-[var(--text-large-semi-bold-line-height)] [font-style:var(--text-large-semi-bold-font-style)]">
                            {student.name}
                          </h3>
                          <p className="self-stretch font-text-medium-normal font-[number:var(--text-medium-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)] [font-style:var(--text-medium-normal-font-style)]">
                            {student.role}
                          </p>
                        </div>
                        <p className="font-text-regular-normal text-[length:var(--text-regular-normal-font-size)] tracking-[var(--text-regular-normal-letter-spacing)] leading-[var(--text-regular-normal-line-height)] self-stretch font-[number:var(--text-regular-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] [font-style:var(--text-regular-normal-font-style)]">
                          {student.description}
                        </p>
                      </div>

                      <div className="flex items-start gap-3.5 mt-6">
                        <img
                          className="w-6 h-6"
                          alt="LinkedIn icon"
                          src="/img/icon-linkedin-4.svg"
                        />
                        <img
                          className="w-6 h-6"
                          alt="X icon"
                          src="/img/icon-x-4.svg"
                        />
                        <img
                          className="w-6 h-6"
                          alt="Dribble icon"
                          src="/img/icon-dribble-4.svg"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-start gap-8 self-stretch w-full">
                {students.slice(4).map((student, index) => (
                  <Card
                    key={index}
                    className="flex flex-col items-start gap-6 flex-1 border-none bg-transparent"
                  >
                    <CardContent className="p-0 w-full">
                      <Avatar className="w-20 h-20 rounded-none">
                        <img
                          className="w-full h-full object-cover"
                          alt={`${student.name} profile`}
                          src={student.image}
                        />
                      </Avatar>

                      <div className="flex-col items-center gap-4 self-stretch w-full mt-6 flex">
                        <div className="flex flex-col items-center self-stretch w-full">
                          <h3 className="self-stretch mt-[-2.00px] font-text-large-semi-bold font-[number:var(--text-large-semi-bold-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-large-semi-bold-font-size)] tracking-[var(--text-large-semi-bold-letter-spacing)] leading-[var(--text-large-semi-bold-line-height)] [font-style:var(--text-large-semi-bold-font-style)]">
                            {student.name}
                          </h3>
                          <p className="self-stretch font-text-medium-normal font-[number:var(--text-medium-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)] [font-style:var(--text-medium-normal-font-style)]">
                            {student.role}
                          </p>
                        </div>
                        <p className="font-text-regular-normal text-[length:var(--text-regular-normal-font-size)] tracking-[var(--text-regular-normal-letter-spacing)] leading-[var(--text-regular-normal-line-height)] self-stretch font-[number:var(--text-regular-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] [font-style:var(--text-regular-normal-font-style)]">
                          {student.description}
                        </p>
                      </div>

                      <div className="flex items-start gap-3.5 mt-6">
                        <img
                          className="w-6 h-6"
                          alt="LinkedIn icon"
                          src="/img/icon-linkedin-4.svg"
                        />
                        <img
                          className="w-6 h-6"
                          alt="X icon"
                          src="/img/icon-x-4.svg"
                        />
                        <img
                          className="w-6 h-6"
                          alt="Dribble icon"
                          src="/img/icon-dribble-4.svg"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className="flex flex-col w-full items-start gap-20 px-16 py-28 bg-[color:var(--color-schemes-color-scheme-2-background)]">
            <div className="flex items-center gap-8 self-stretch w-full">
              <div className="flex-col items-start gap-6 flex-1 flex">
                <div className="flex-col w-[768px] gap-6 flex items-start">
                  <h2 className="text-[length:var(--heading-desktop-h3-font-size)] tracking-[var(--heading-desktop-h3-letter-spacing)] leading-[var(--heading-desktop-h3-line-height)] self-stretch font-heading-desktop-h3 font-[number:var(--heading-desktop-h3-font-weight)] text-[color:var(--color-schemes-color-scheme-2-text)] [font-style:var(--heading-desktop-h3-font-style)]">
                    欢迎来到个人中心
                  </h2>
                  <p className="font-text-medium-normal text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)] self-stretch font-[number:var(--text-medium-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-2-text)] [font-style:var(--text-medium-normal-font-style)]">
                    管理您的学生和学习记录
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Button 
                  className="px-6 py-2.5 bg-[color:var(--primitives-color-neutral-darkest)] rounded-xl border border-solid border-[color:var(--primitives-color-neutral-darkest)]"
                  onClick={handleBack}
                >
                  <span className="font-text-regular-medium font-[number:var(--text-regular-medium-font-weight)] text-primitives-color-white text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)] whitespace-nowrap [font-style:var(--text-regular-medium-font-style)]">
                    返回
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="px-6 py-2.5 rounded-xl border-2 border-solid border-[color:var(--primitives-color-neutral-darkest)]"
                  onClick={handleLogout}
                >
                  <span className="font-text-regular-medium font-[number:var(--text-regular-medium-font-weight)] text-[color:var(--primitives-color-neutral-darkest)] text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)] whitespace-nowrap [font-style:var(--text-regular-medium-font-style)]">
                    退出
                  </span>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
