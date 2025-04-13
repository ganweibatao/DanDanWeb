import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { X } from 'lucide-react';

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
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  fontSizes,
  onFontSizeChange,
  onReset
}) => {
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
        <CardContent className="space-y-6">
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
            
            <div className="pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onReset}
                className="w-full text-gray-600 dark:text-gray-300"
              >
                恢复默认设置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 