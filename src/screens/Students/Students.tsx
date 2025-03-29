import { ChevronRightIcon } from "lucide-react";
import React from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

// Data for vocabulary cards
const vocabularyCards = [
  {
    title: "词汇学习进度更新",
    description: "了解你的艾宾浩斯复习效果和进展",
    action: "了解更多",
  },
  {
    title: "学习效果回顾",
    description: "查看历史复习效果和学习记录",
    action: "了解更多",
  },
  {
    title: "开始单词学习",
    description: "点击这里开始你的单词学习之旅",
    action: "开始学习",
  },
];

// Data for timeline entries
const timelineEntries = [
  {
    description:
      "查看此日期的学习记录，了解学生的复习效果。每一次的复习都是进步的机会。",
  },
  {
    description:
      "在这里，您可以看到该日期的复习记录。每次复习都是学习进步的重要环节。",
  },
  {
    description:
      "此处显示该日期的学习记录。通过持续复习，学生的记忆将更加牢固。",
  },
];

export const Students = (): JSX.Element => {
  return (
    <div className="w-full">
      <div className="w-full">
        <div className="flex flex-col items-start">
          <header className="flex flex-col w-full h-[369px] items-start gap-20 px-16 py-28 relative bg-[url(/img/header-54.png)] bg-cover bg-[50%_50%]">
            <div className="flex flex-col w-[768px] items-start gap-6 relative flex-1">
              <h1 className="relative self-stretch font-heading-desktop-h1 font-[number:var(--heading-desktop-h1-font-weight)] text-[color:var(--primitives-color-white)] text-[length:var(--heading-desktop-h1-font-size)] tracking-[var(--heading-desktop-h1-letter-spacing)] leading-[var(--heading-desktop-h1-line-height)] [font-style:var(--heading-desktop-h1-font-style)]">
                学生学习概况
              </h1>
              <p className="relative self-stretch font-text-medium-normal font-[number:var(--text-medium-normal-font-weight)] text-[color:var(--primitives-color-white)] text-[length:var(--text-medium-normal-font-size)] tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)] [font-style:var(--text-medium-normal-font-style)]">
                查看学生的基本信息和学习进度，助力他们的英语学习之旅。
              </p>
            </div>
          </header>

          <section className="flex flex-col w-full items-start gap-20 px-16 py-28 bg-white">
            <div className="flex items-start gap-20 relative self-stretch w-full">
              <div className="gap-4 flex flex-col items-start relative flex-1">
                <h2 className="text-[length:var(--heading-desktop-h2-font-size)] tracking-[var(--heading-desktop-h2-letter-spacing)] leading-[var(--heading-desktop-h2-line-height)] relative self-stretch font-heading-desktop-h2 font-[number:var(--heading-desktop-h2-font-weight)] text-gray-900 [font-style:var(--heading-desktop-h2-font-style)]">
                  学生艾宾浩斯记忆与复习情况
                </h2>
              </div>

              <div className="gap-8 flex flex-col items-start relative flex-1">
                <div className="flex flex-col items-start gap-8 relative self-stretch w-full">
                  <p className="self-stretch font-text-medium-normal font-[number:var(--text-medium-normal-font-weight)] text-[length:var(--text-medium-normal-font-size)] leading-[var(--text-medium-normal-line-height)] text-gray-700 tracking-[var(--text-medium-normal-letter-spacing)] [font-style:var(--text-medium-normal-font-style)]">
                    在这里，您可以查看学生的艾宾浩斯记忆曲线，了解他们的复习效果。通过这些数据，您能更好地帮助学生提升记忆效率。
                  </p>

                  <div className="flex flex-col items-start gap-4 relative self-stretch w-full">
                    <div className="gap-6 py-2 flex items-start relative self-stretch w-full">
                      <div className="flex flex-col items-start gap-2 relative flex-1">
                        <h2 className="relative self-stretch font-heading-desktop-h2 font-[number:var(--heading-desktop-h2-font-weight)] text-gray-900 text-[length:var(--heading-desktop-h2-font-size)] tracking-[var(--heading-desktop-h2-letter-spacing)] leading-[var(--heading-desktop-h2-line-height)] [font-style:var(--heading-desktop-h2-font-style)]">
                          50%
                        </h2>
                        <p className="self-stretch font-text-regular-normal font-[number:var(--text-regular-normal-font-weight)] text-[length:var(--text-regular-normal-font-size)] leading-[var(--text-regular-normal-line-height)] text-gray-700 tracking-[var(--text-regular-normal-letter-spacing)] [font-style:var(--text-regular-normal-font-style)]">
                          复习效果显著，学习更轻松！
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-2 relative flex-1">
                        <h2 className="relative self-stretch font-heading-desktop-h2 font-[number:var(--heading-desktop-h2-font-weight)] text-gray-900 text-[length:var(--heading-desktop-h2-font-size)] tracking-[var(--heading-desktop-h2-letter-spacing)] leading-[var(--heading-desktop-h2-line-height)] [font-style:var(--heading-desktop-h2-font-style)]">
                          50%
                        </h2>
                        <p className="self-stretch font-text-regular-normal font-[number:var(--text-regular-normal-font-weight)] text-[length:var(--text-regular-normal-font-size)] leading-[var(--text-regular-normal-line-height)] text-gray-700 tracking-[var(--text-regular-normal-letter-spacing)] [font-style:var(--text-regular-normal-font-style)]">
                          持续进步，掌握更多单词！
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 relative">
                  <Button
                    variant="outline"
                    className="rounded-xl border-2 border-solid border-gray-900"
                  >
                    开始
                  </Button>

                  <Button
                    variant="ghost"
                    className="rounded-xl flex items-center gap-2 text-gray-900"
                  >
                    查看
                    <ChevronRightIcon className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>

            {/* <img
              className="self-stretch w-full h-[738px] object-cover"
              alt="Placeholder image"
              src="/img/placeholder-image copy.png"
            /> */}
          </section>

          <section className="flex flex-col w-full items-start gap-16 px-16 py-28 bg-white">
            <div className="flex flex-col w-[768px] items-start gap-4">
              <div className="flex flex-col items-center gap-6 relative self-stretch w-full">
                <h2 className="text-[length:var(--heading-desktop-h2-font-size)] tracking-[var(--heading-desktop-h2-letter-spacing)] leading-[var(--heading-desktop-h2-line-height)] relative self-stretch font-heading-desktop-h2 font-[number:var(--heading-desktop-h2-font-weight)] text-gray-900 [font-style:var(--heading-desktop-h2-font-style)]">
                  当前词库概览
                </h2>
                <p className="self-stretch font-text-medium-normal font-[number:var(--text-medium-normal-font-weight)] text-[length:var(--text-medium-normal-font-size)] leading-[var(--text-medium-normal-line-height)] text-gray-700 tracking-[var(--text-medium-normal-letter-spacing)] [font-style:var(--text-medium-normal-font-style)]">
                  查看你的学习进度和词汇
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-16 relative self-stretch w-full">
              <div className="gap-8 flex items-start relative self-stretch w-full">
                {vocabularyCards.map((card, index) => (
                  <Card
                    key={index}
                    className="flex flex-col items-start gap-6 flex-1 bg-white border border-gray-200"
                  >
                    <CardContent className="p-0">
                      <img
                        className="relative self-stretch w-full h-[300px] object-cover"
                        alt="Placeholder image"
                        src="/img/placeholder-image-3.png"
                      />

                      <div className="flex flex-col items-start gap-4 pt-6 px-6">
                        <div className="flex items-center gap-4">
                          <Badge
                            variant="outline"
                            className="rounded-md border-2 border-solid border-gray-900 bg-white"
                          >
                            词汇
                          </Badge>
                          <span className="font-text-small-semi-bold text-gray-600 text-[length:var(--text-small-semi-bold-font-size)] leading-[var(--text-small-semi-bold-line-height)]">
                            5分钟阅读
                          </span>
                        </div>

                        <div className="flex flex-col w-full items-start gap-2">
                          <h5 className="text-[length:var(--heading-desktop-h5-font-size)] tracking-[var(--heading-desktop-h5-letter-spacing)] leading-[var(--heading-desktop-h5-line-height)] relative self-stretch font-heading-desktop-h5 font-[number:var(--heading-desktop-h5-font-weight)] text-gray-900 [font-style:var(--heading-desktop-h5-font-style)]">
                            {card.title}
                          </h5>
                          <p className="self-stretch font-text-regular-normal font-[number:var(--text-regular-normal-font-weight)] text-[length:var(--text-regular-normal-font-size)] leading-[var(--text-regular-normal-line-height)] text-gray-700 tracking-[var(--text-regular-normal-letter-spacing)] [font-style:var(--text-regular-normal-font-style)]">
                            {card.description}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-2">
                        <Button
                          variant="ghost"
                          className="rounded-xl flex items-center gap-2 text-gray-900"
                        >
                          {card.action}
                          <ChevronRightIcon className="w-6 h-6" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-end gap-4 self-stretch w-full">
              <Button
                variant="outline"
                className="rounded-xl border-2 border-solid border-gray-900"
              >
                查看全部
              </Button>
            </div>
          </section>

          <section className="flex flex-col w-full items-center gap-28 px-16 py-28 bg-white">
            <div className="flex flex-col w-[768px] items-center gap-8">
              <div className="flex flex-col items-center gap-4 relative self-stretch w-full">
                <div className="flex flex-col items-center gap-6 relative self-stretch w-full">
                  <h2 className="relative self-stretch font-heading-desktop-h2 font-[number:var(--heading-desktop-h2-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--heading-desktop-h2-font-size)] text-center tracking-[var(--heading-desktop-h2-letter-spacing)] leading-[var(--heading-desktop-h2-line-height)] [font-style:var(--heading-desktop-h2-font-style)]">
                    学生背诵进度与复习历史
                  </h2>
                  <p className="relative self-stretch font-text-medium-normal font-[number:var(--text-medium-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-medium-normal-font-size)] text-center tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)] [font-style:var(--text-medium-normal-font-style)]">
                    在这里，您可以查看学生的背诵进度和复习历史。通过这些数据，您可以更好地了解学生的学习情况。
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-col items-start flex relative self-stretch w-full">
              {timelineEntries.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-start relative self-stretch w-full"
                >
                  <div className="flex items-start justify-end px-0 py-16 relative flex-1 self-stretch">
                    <h3 className="flex-1 text-[length:var(--heading-desktop-h3-font-size)] text-right tracking-[var(--heading-desktop-h3-letter-spacing)] leading-[var(--heading-desktop-h3-line-height)] relative self-stretch font-heading-desktop-h3 font-[number:var(--heading-desktop-h3-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] [font-style:var(--heading-desktop-h3-font-style)]">
                      日期
                    </h3>
                  </div>

                  <div className="flex flex-col w-48 items-center gap-2.5 relative self-stretch">
                    <div className="inline-flex flex-col items-center gap-4 relative flex-1 grow">
                      <div className="h-16 relative w-[3px] bg-[color:var(--color-schemes-color-scheme-1-text)]" />
                      <div className="relative w-[15px] h-[15px] bg-[color:var(--color-schemes-color-scheme-1-text)] rounded-[7.5px]" />
                      <div className="flex-1 grow relative w-[3px] bg-[color:var(--color-schemes-color-scheme-1-text)]" />
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-16 px-0 py-16 relative flex-1 self-stretch">
                    <div className="flex flex-col items-start gap-8 relative self-stretch w-full">
                      <p className="self-stretch font-text-medium-normal font-[number:var(--text-medium-normal-font-weight)] text-[length:var(--text-medium-normal-font-size)] leading-[var(--text-medium-normal-line-height)] text-[color:var(--color-schemes-color-scheme-1-text)] tracking-[var(--text-medium-normal-letter-spacing)] [font-style:var(--text-medium-normal-font-style)]">
                        {entry.description}
                      </p>

                      <div className="flex items-center gap-6">
                        <Button
                          variant="outline"
                          className="rounded-xl border-2 border-solid border-[color:var(--primitives-color-neutral-darkest)]"
                        >
                          查看
                        </Button>

                        <Button
                          variant="ghost"
                          className="rounded-xl flex items-center gap-2"
                        >
                          详情
                          <ChevronRightIcon className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>

                    <img
                      className="self-stretch w-full h-[560px] relative object-cover"
                      alt="Placeholder image"
                      src="/img/placeholder-image-6.png"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col w-[768px] items-center gap-8">
              <div className="flex flex-col items-center gap-4 relative self-stretch w-full">
                <div className="inline-flex items-center">
                  <span className="font-heading-desktop-tagline font-[number:var(--heading-desktop-tagline-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--heading-desktop-tagline-font-size)] tracking-[var(--heading-desktop-tagline-letter-spacing)] leading-[var(--heading-desktop-tagline-line-height)] [font-style:var(--heading-desktop-tagline-font-style)]">
                    标语
                  </span>
                </div>

                <div className="flex flex-col items-center gap-6 relative self-stretch w-full">
                  <h2 className="relative self-stretch font-heading-desktop-h2 font-[number:var(--heading-desktop-h2-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--heading-desktop-h2-font-size)] text-center tracking-[var(--heading-desktop-h2-letter-spacing)] leading-[var(--heading-desktop-h2-line-height)] [font-style:var(--heading-desktop-h2-font-style)]">
                    学生学习进度与复习记录
                  </h2>
                  <p className="relative self-stretch font-text-medium-normal font-[number:var(--text-medium-normal-font-weight)] text-[color:var(--color-schemes-color-scheme-1-text)] text-[length:var(--text-medium-normal-font-size)] text-center tracking-[var(--text-medium-normal-letter-spacing)] leading-[var(--text-medium-normal-line-height)] [font-style:var(--text-medium-normal-font-style)]">
                    在这里，您可以全面了解学生的学习进度和复习记录。通过这些信息，您可以更好地指导学生的学习。
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col w-full items-start gap-20 px-16 py-28 bg-white">
            <div className="items-center gap-20 flex relative self-stretch w-full">
              <div className="gap-8 flex flex-col items-start relative flex-1">
                <div className="flex flex-col items-start gap-6 relative self-stretch w-full">
                  <h2 className="text-[length:var(--heading-desktop-h2-font-size)] tracking-[var(--heading-desktop-h2-letter-spacing)] leading-[var(--heading-desktop-h2-line-height)] relative self-stretch font-heading-desktop-h2 font-[number:var(--heading-desktop-h2-font-weight)] text-gray-900 [font-style:var(--heading-desktop-h2-font-style)]">
                    开始单词学习
                  </h2>
                  <p className="self-stretch font-text-medium-normal font-[number:var(--text-medium-normal-font-weight)] text-[length:var(--text-medium-normal-font-size)] leading-[var(--text-medium-normal-line-height)] text-gray-700 tracking-[var(--text-medium-normal-letter-spacing)] [font-style:var(--text-medium-normal-font-style)]">
                    在这里，你可以查看学习效果并开始新的单词学习挑战，提升你的词汇量！
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <Button className="rounded-xl bg-[color:var(--primitives-color-neutral-darkest)] text-[color:var(--primitives-color-white)]">
                    学习
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-2 border-solid border-[color:var(--primitives-color-neutral-darkest)]"
                  >
                    复习
                  </Button>
                </div>
              </div>

              <img
                className="flex-1 h-[400px] object-cover"
                alt="Placeholder image"
                src="/img/placeholder-image-7.png"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
