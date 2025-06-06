import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { SidebarFooterLinks } from './SidebarFooterLinks';
import { GiftIcon, ChevronRightIcon, CopyIcon } from 'lucide-react';


export const ProfileSidebar: React.FC = () => {
  const [inviteLink] = useState('https://invite.DanZai.com/BDHTZT B5CW...');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        console.log('Link copied to clipboard!');
        // Consider adding a toast notification here for user feedback
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  return (
    <aside className="w-72 bg-gray-100 dark:bg-gray-900 p-6 flex flex-col space-y-6 border-l border-gray-200 dark:border-gray-700 h-screen sticky top-0 overflow-y-auto">
      {/* Add Friends Card */}
      <Card className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-200">添加好友</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center space-x-3">
                  <GiftIcon className="w-6 h-6 text-green-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">邀请朋友</span>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 rounded-lg p-6">
              <DialogHeader className="text-center mb-4">
                <div className="mx-auto mb-4 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl">
                  🦉
                </div>
                <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">邀请好友</DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  分享就是快乐对不对？蛋仔好玩又免费，别藏着，大家一起玩才对！
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-2">
                  <Input
                    id="invite-link"
                    value={inviteLink}
                    readOnly
                    className="flex-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={copyToClipboard} className="px-3 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-blue-500 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md">
                    <CopyIcon className="w-4 h-4 mr-1" />
                    复制链接
                  </Button>
                </div>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 my-4">或分享至...</p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg py-2">
                    FACEBOOK
                  </Button>
                  <Button variant="outline" className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg py-2">
                    推特
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      {/* Footer Links */}
      <div className="mt-auto"> {/* Pushes footer to the bottom if sidebar has extra space */}
        <SidebarFooterLinks />
      </div>
    </aside>
  );
}; 