"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, AlertCircle, Eye, EyeOff } from 'lucide-react';

const demoCredentials = [
  { role: 'Super Admin', username: 'superadmin', password: 'admin123' },
  { role: 'Operations Manager', username: 'ops_manager', password: 'ops123' },
  { role: 'Dispatch Coordinator', username: 'dispatch', password: 'dispatch123' },
  { role: 'Warehouse Manager', username: 'warehouse', password: 'warehouse123' },
  { role: 'Driver / Field Agent', username: 'driver01', password: 'driver123' },
  { role: 'Finance Manager', username: 'finance', password: 'finance123' },
  { role: 'Customer Support', username: 'support', password: 'support123' },
  { role: 'Customer (Self-Service)', username: 'customer01', password: 'cust123' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(username, password);
      if (response.success) {
        router.push('/dashboard');
      } else {
        setError(response.error || 'Invalid credentials');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (cred: typeof demoCredentials[0]) => {
    setUsername(cred.username);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
              <Truck className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">LogisticsPro</h1>
              <p className="text-muted-foreground">Enterprise Logistics Management</p>
            </div>
          </div>
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground max-w-md">
              Streamline your logistics operations with real-time tracking, fleet management, and comprehensive analytics.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 bg-card rounded-lg border border-border">
                <p className="text-2xl font-bold text-primary">3600+</p>
                <p className="text-sm text-muted-foreground">Shipments Managed</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <p className="text-2xl font-bold text-primary">94.5%</p>
                <p className="text-sm text-muted-foreground">On-Time Delivery</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <p className="text-2xl font-bold text-primary">15+</p>
                <p className="text-sm text-muted-foreground">Active Vehicles</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <p className="text-2xl font-bold text-primary">22+</p>
                <p className="text-sm text-muted-foreground">Professional Drivers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 lg:hidden mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">LogisticsPro</span>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {demoCredentials.map((cred) => (
                  <Button
                    key={cred.username}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start"
                    onClick={() => handleQuickLogin(cred)}
                  >
                    {cred.role}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
