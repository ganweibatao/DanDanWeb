import { ChevronRightIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Avatar } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";

interface Student {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  bio: string;
  level: string;
  interests: string;
  learning_goal: string;
  gender: string;
}

export const Information = (): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        if (!token || !userData) {
          navigate("/login");
          return;
        }

        // 设置请求头
        axios.defaults.headers.common["Authorization"] = `Token ${token}`;
        
        const user = JSON.parse(userData);
        // 注意：Login和Register组件存储的是userType，这里统一使用userType
        setUserType(user.userType);

        // 只有教师才能获取学生列表
        if (user.userType === 'teacher') {
          // 获取当前教师信息
          console.log("user.id", user.id);
          const teacherResponse = await axios.get(`http://localhost:8000/api/v1/accounts/teachers/?user_id=${user.id}`);
          console.log("teacherResponse", teacherResponse);
          if (teacherResponse.data && teacherResponse.data.count > 0) {
            const teacherId = teacherResponse.data.results[0].id;
            
            // 直接使用教师的学生专用端点
            const studentsResponse = await axios.get(`http://localhost:8000/api/v1/accounts/teachers/${teacherId}/students/`);
            let studentList = [];
            if (studentsResponse.data && typeof studentsResponse.data === 'object') {
              // 检查是否是分页响应
              if (Array.isArray(studentsResponse.data.results)) {
                studentList = studentsResponse.data.results;
              } 
              // 检查是否是直接的数组响应
              else if (Array.isArray(studentsResponse.data)) {
                studentList = studentsResponse.data;
              }
              // 处理其他可能的格式问题
              else {
                console.error("Unexpected response format:", studentsResponse.data);
                setError("数据格式错误");
              }
            }
            setStudents(studentList);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("获取数据失败，请重试");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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

  // 学生数据现在来自API
  const studentPlaceholders = [
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

  // 添加点击学生卡片跳转到学生详情页的函数
  const handleStudentClick = (studentId: number) => {
    navigate(`/students/`);
  };

  // 如果是教师，显示API返回的学生；否则使用占位符数据
  const displayStudents = userType === 'teacher' && students.length > 0 
    ? students.map(student => ({
        id: student.id,
        name: student.username || student.email || `学生 ${student.id}`, // 确保始终有一个名称显示
        role: "学生",
        description: `英语水平: ${student.level || '未设置'}, 兴趣爱好: ${student.interests || '未设置'}`,
        image: student.avatar ? `http://localhost:8000${student.avatar}` : "/img/placeholder-image-4.png",
      }))
    : studentPlaceholders;

  return (
    <main className="w-full">
      <div className="w-full">
        <div className="flex flex-col">
          <section className="flex flex-col w-full h-[369px] items-start gap-20 px-16 py-28 bg-color-schemes-color-scheme-1-background">
            <div className="flex justify-between items-start w-full">
              <div className="flex flex-col w-[768px] items-start gap-6">
                <h1 className="font-heading-desktop-h1 text-[length:var(--heading-desktop-h1-font-size)] tracking-[var(--heading-desktop-h1-letter-spacing)] leading-[var(--heading-desktop-h1-line-height)] self-stretch font-[number:var(--heading-desktop-h1-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] [font-style:var(--heading-desktop-h1-font-style)]">
                  欢迎回来!
                </h1>
                <p className="font-text-medium-normal text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)] self-stretch font-[number:var(--text-medium-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] [font-style:var(--text-medium-normal-font-style)]">
                  您已成功登录，开始管理您的学习进度吧！
                </p>
              </div>
              <div className="flex items-center">
                <UserAvatar />
              </div>
            </div>
          </section>

          <section className="flex flex-col w-full items-start gap-20 px-16 py-28 bg-[color:var(--color-schemes-color-scheme-2-background)]">
            <div className="flex items-start gap-20 relative self-stretch w-full">
              <div className="gap-4 flex flex-col items-start flex-1">
                <h2 className="text-[length:var(--heading-desktop-h3-font-size)] tracking-[var(--heading-desktop-h3-letter-spacing)] leading-[var(--heading-desktop-h3-line-height)] self-stretch font-heading-desktop-h3 font-[number:var(--heading-desktop-h3-font-weight)] text-[color:var(--color-schemes-color-scheme-2-text)] [font-style:var(--heading-desktop-h3-font-style)]">
                  个人中心：轻松管理您的学习进度
                </h2>
              </div>

              <div className="gap-6 flex flex-col items-start flex-1">
                <p className="self-stretch font-text-medium-normal font-[number:var(--text-medium-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-2-text)] text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)] [font-style:var(--text-medium-normal-font-style)]">
                  在个人中心，您可以方便地设置账户选项以及管理您的学习记录。无论是跟踪学习效果还是查看历史记录，一切尽在掌握。让您的学习更加高效和有趣！
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
                  {userType === 'teacher' ? '我的学生' : '我们的学生'}
                </h2>
                <p className="self-stretch font-text-medium-normal font-[number:var(--text-medium-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)] [font-style:var(--text-medium-normal-font-style)]">
                  {loading ? '加载中...' : error ? error : userType === 'teacher' && displayStudents.length === 0 ? '您当前还没有学生，请添加学生关联' : '查看每个学生的学习进度和表现'}
                </p>
              </div>
            </div>

            <div className="flex-col items-start gap-16 self-stretch w-full flex">
              {loading ? (
                <div className="w-full text-center py-8">加载中...</div>
              ) : error ? (
                <div className="w-full text-center py-8 text-red-500">{error}</div>
              ) : displayStudents.length === 0 && userType === 'teacher' ? (
                <div className="w-full text-center py-8">
                  <p className="mb-4">您当前没有关联的学生</p>
                  <Button 
                    className="px-6 py-2.5 bg-[color:var(--primitives-color-neutral-darkest)] rounded-xl border border-solid border-[color:var(--primitives-color-neutral-darkest)]"
                  >
                    <span className="font-text-regular-medium font-[number:var(--text-regular-medium-font-weight)] text-primitives-color-white text-[length:var(--text-regular-medium-font-size)] tracking-[var(--text-regular-medium-letter-spacing)] leading-[var(--text-regular-medium-line-height)] whitespace-nowrap [font-style:var(--text-regular-medium-font-style)]">
                      添加学生
                    </span>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-8 self-stretch w-full">
                    {displayStudents.slice(0, 4).map((student, index) => (
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
                              <h3 
                                className="self-stretch mt-[-2.00px] font-text-large-semi-bold font-[number:var(--text-large-semi-bold-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-large-semi-bold-font-size)] tracking-[var(--text-large-semi-bold-letter-spacing)] leading-[var(--text-large-semi-bold-line-height)] [font-style:var(--text-large-semi-bold-font-style)] cursor-pointer hover:underline"
                                onClick={() => handleStudentClick(student.id)}
                              >
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

                  {displayStudents.length > 4 && (
                    <div className="flex items-start gap-8 self-stretch w-full">
                      {displayStudents.slice(4).map((student, index) => (
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
                                <h3 
                                  className="self-stretch mt-[-2.00px] font-text-large-semi-bold font-[number:var(--text-large-semi-bold-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-large-semi-bold-font-size)] tracking-[var(--text-large-semi-bold-letter-spacing)] leading-[var(--text-large-semi-bold-line-height)] [font-style:var(--text-large-semi-bold-font-style)] cursor-pointer hover:underline"
                                  onClick={() => handleStudentClick(student.id)}
                                >
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
                  )}
                </>
              )}
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
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
