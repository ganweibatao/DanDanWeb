import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Slider } from "../../../components/ui/slider";
import { Button } from "../../../components/ui/button";
import { X } from 'lucide-react';
import { Switch } from '../../../components/ui/switch';
import { useSound } from '../../../context/SoundContext';

export interface FontSizeSettings {
  english: number;
  pronunciation: number;
  chinese: number;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fontSizes: FontSizeSettings;
  onFontSizeChange: (setting: keyof FontSizeSettings, value: number) => void;
  onReset: () => void;
  showClock: boolean;
  onShowClockChange: (show: boolean) => void;
  showNotesPanel: boolean;
  onShowNotesPanelChange: (show: boolean) => void;
  isScrollSoundEnabled: boolean;
  onIsScrollSoundEnabledChange: (enabled: boolean) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  fontSizes,
  onFontSizeChange,
  onReset,
  showClock,
  onShowClockChange,
  showNotesPanel,
  onShowNotesPanelChange,
  isScrollSoundEnabled,
  onIsScrollSoundEnabledChange,
}) => {
  const { isSoundEnabled, toggleSound, volume, setVolume } = useSound();

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
                  onValueChange={(value: number[]) => onFontSizeChange('english', value[0])}
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
                  onValueChange={(value: number[]) => onFontSizeChange('pronunciation', value[0])}
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
                  onValueChange={(value: number[]) => onFontSizeChange('chinese', value[0])}
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
                onCheckedChange={toggleSound}
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
                onCheckedChange={onIsScrollSoundEnabledChange}
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
                onValueChange={(value: number[]) => setVolume(value[0])}
                className="w-full"
                disabled={!isSoundEnabled}
              />
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
                onCheckedChange={onShowClockChange}
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
                onCheckedChange={onShowNotesPanelChange}
              />
            </div>
          </div>

          <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>

          <div className="pt-2"> 
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onReset}
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