import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const tabs = ['Profile', 'Security', 'Notifications'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Left Nav */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
                activeTab === tab
                  ? "bg-accent text-brand"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3 bg-surface rounded-xl border border-border shadow-card p-6">
          {activeTab === 'Profile' && (
            <div className="space-y-6">
              <h2 className="font-display font-semibold text-lg text-gray-900">Profile Information</h2>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Display Name</Label>
                  <Input defaultValue="Ahmad Al-Hassan" className="h-10 border-gray-200 focus:border-brand focus:ring-brand/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <Input defaultValue="ahmad@islamicbank.com" disabled className="h-10 border-gray-200 bg-gray-50 text-gray-500" />
                  <p className="text-xs text-gray-400">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Organisation</Label>
                  <Input defaultValue="Islamic Bank Ltd" className="h-10 border-gray-200 focus:border-brand focus:ring-brand/20" />
                </div>
                <Button className="bg-brand hover:bg-brand-dark text-primary-foreground shadow-brand">Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="space-y-6">
              <h2 className="font-display font-semibold text-lg text-gray-900">Security Settings</h2>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Current Password</Label>
                  <Input type="password" className="h-10 border-gray-200 focus:border-brand focus:ring-brand/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">New Password</Label>
                  <Input type="password" className="h-10 border-gray-200 focus:border-brand focus:ring-brand/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                  <Input type="password" className="h-10 border-gray-200 focus:border-brand focus:ring-brand/20" />
                </div>
                <Button className="bg-brand hover:bg-brand-dark text-primary-foreground shadow-brand">Update Password</Button>
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="space-y-6">
              <h2 className="font-display font-semibold text-lg text-gray-900">Notification Preferences</h2>
              <div className="space-y-5">
                {[
                  { label: 'Email when analysis completes', desc: 'Get notified when your document analysis is ready' },
                  { label: 'Monthly limit warning at 80%', desc: 'Alert when approaching your monthly analysis limit' },
                  { label: 'License expiry reminder', desc: 'Notification 7 days before license expires' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
