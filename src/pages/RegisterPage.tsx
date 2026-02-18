import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />

      <div className="w-full max-w-[420px] bg-surface rounded-xl shadow-modal p-8 relative z-10">
        <div className="flex items-center justify-center mb-8">
          <img src="/fortiv-logo.jpg" alt="Fortiv Solutions" className="h-12" />
        </div>

        <h1 className="font-display font-bold text-xl text-gray-900 mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-8">Start screening contracts in minutes</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Full Name</Label>
            <Input placeholder="Ahmad Al-Hassan" className="h-10 rounded-md border-gray-200 focus:border-brand focus:ring-brand/20" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Email Address</Label>
            <Input type="email" placeholder="you@company.com" className="h-10 rounded-md border-gray-200 focus:border-brand focus:ring-brand/20" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Organisation / Company</Label>
            <Input placeholder="Islamic Bank Ltd" className="h-10 rounded-md border-gray-200 focus:border-brand focus:ring-brand/20" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                className="h-10 rounded-md border-gray-200 focus:border-brand focus:ring-brand/20 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Confirm Password</Label>
            <Input type="password" placeholder="Confirm your password" className="h-10 rounded-md border-gray-200 focus:border-brand focus:ring-brand/20" />
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-brand hover:bg-brand-dark text-primary-foreground shadow-brand hover:shadow-lg transition-all"
          >
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-medium hover:text-brand-dark transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
