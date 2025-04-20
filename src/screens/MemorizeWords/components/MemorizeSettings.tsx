import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Slider } from "../../../components/ui/slider";
import { Button } from "../../../components/ui/button";
import { X } from 'lucide-react';
import { Switch } from '../../../components/ui/switch';
import { Input } from '../../../components/ui/input';
import { useSettings } from '../../../context/SettingsContext';

// 定义预设颜色类型
interface PresetColor {
  label: string;
  value: string;
}

// 预设颜色选项
const presetColors: PresetColor[] = [
  { label: '淡绿', value: '#f0fdf4' },
  { label: '极淡绿', value: '#fafffa' },
  { label: '淡黄', value: '#fffef0' },
  { label: '白色', value: '#ffffff' },
];

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSetting, updateFontSize, resetSettings } = useSettings();
  const { fontSizes, showClock, showNotesPanel, isSoundEnabled, isScrollSoundEnabled, volume, wordItemBgColor } = settings;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl animate-fade-in-scale">
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle>设置</CardTitle>
          <CardDescription>调整显示选项</CardDescription>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(100vh-16rem)] p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">字体大小设置</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="english-size">英文字体大小</Label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{fontSizes.english}</span>
                </div>
                <Slider
                  id="english-size"
                  min={12}
                  max={28}
                  step={1}
                  value={[fontSizes.english]}
                  onValueChange={(value: number[]) => updateFontSize('english', value[0])}
                  className="w-full"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">小</span>
                  <span className="text-xs text-gray-500">大</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pronunciation-size">音标字体大小</Label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{fontSizes.pronunciation}</span>
                </div>
                <Slider
                  id="pronunciation-size"
                  min={8}
                  max={18}
                  step={1}
                  value={[fontSizes.pronunciation]}
                  onValueChange={(value: number[]) => updateFontSize('pronunciation', value[0])}
                  className="w-full"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">小</span>
                  <span className="text-xs text-gray-500">大</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="chinese-size">中文字体大小</Label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{fontSizes.chinese}</span>
                </div>
                <Slider
                  id="chinese-size"
                  min={10}
                  max={24}
                  step={1}
                  value={[fontSizes.chinese]}
                  onValueChange={(value: number[]) => updateFontSize('chinese', value[0])}
                  className="w-full"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">小</span>
                  <span className="text-xs text-gray-500">大</span>
                </div>
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">音量控制</h3>
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="sound-effects-switch" className="flex flex-col space-y-1">
                <span>全局音效</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  打开或关闭应用内的所有音效。
                </span>
              </Label>
              <Switch
                id="sound-effects-switch"
                checked={isSoundEnabled}
                onCheckedChange={(checked) => updateSetting('isSoundEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between pt-4 pb-2">
              <Label htmlFor="scroll-sound-switch" className={`flex flex-col space-y-1 ${!isSoundEnabled ? 'opacity-50' : ''}`}>
                <span>滚动音效</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  在滚动列表时播放音效。
                </span>
              </Label>
              <Switch
                id="scroll-sound-switch"
                checked={isScrollSoundEnabled}
                onCheckedChange={(checked) => updateSetting('isScrollSoundEnabled', checked)}
                disabled={!isSoundEnabled}
              />
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="volume-slider" className={`${!isSoundEnabled ? 'text-gray-400 dark:text-gray-500 opacity-50' : ''}`}>音量大小</Label>
                <span className={`text-sm ${!isSoundEnabled ? 'text-gray-400 dark:text-gray-500 opacity-50' : 'text-gray-500 dark:text-gray-400'}`}>{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                id="volume-slider"
                min={0}
                max={1}
                step={0.01}
                value={[volume]}
                onValueChange={(value: number[]) => updateSetting('volume', value[0])}
                className="w-full"
                disabled={!isSoundEnabled}
              />
            </div>
          </div>

          <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">单词项背景色</h3>
            <div className="space-y-3 pt-1">
              <Label className="flex flex-col space-y-1">
                <span>亮色模式背景</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  选择预设或输入自定义颜色值。
                </span>
              </Label>

              <div className="flex flex-wrap gap-2">
                {presetColors.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => updateSetting('wordItemBgColor', preset.value)}
                    className={`relative border-2 ${wordItemBgColor === preset.value ? 'border-blue-500' : 'border-gray-200 dark:border-gray-600'}`}
                  >
                    <span 
                      className="w-4 h-4 rounded-sm mr-2 border border-gray-300 dark:border-gray-500"
                      style={{ backgroundColor: preset.value }}
                    ></span>
                    {preset.label}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Label htmlFor="word-item-bg-color" className="text-sm flex-shrink-0">自定义:</Label>
                <Input
                  id="word-item-bg-color"
                  type="text"
                  value={wordItemBgColor}
                  onChange={(e) => updateSetting('wordItemBgColor', e.target.value)}
                  placeholder="例如: #f0fdf4"
                  className="w-full h-9 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">界面元素</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-clock-switch" className="flex flex-col space-y-1">
                <span>显示行走时钟</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  在屏幕底部显示一个行走的时钟动画。
                </span>
              </Label>
              <Switch
                id="show-clock-switch"
                checked={showClock}
                onCheckedChange={(checked) => updateSetting('showClock', checked)}
              />
            </div>

            <div className="flex items-center justify-between pt-4 pb-2">
              <Label htmlFor="show-notes-switch" className="flex flex-col space-y-1">
                <span>启用笔记面板</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  允许打开和查看单词笔记。
                </span>
              </Label>
              <Switch
                id="show-notes-switch"
                checked={showNotesPanel}
                onCheckedChange={(checked) => updateSetting('showNotesPanel', checked)}
              />
            </div>
          </div>

          <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>

          <div className="pt-2"> 
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetSettings}
              className="w-full text-gray-600 dark:text-gray-300"
            >
              恢复默认设置
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 