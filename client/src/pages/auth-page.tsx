import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export default function AuthPage() {
  const [_, setLocation] = useLocation();
  const { login, user, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  const handleLogin = async () => {
    try {
      await login(username, password);
      setLocation('/'); // Redirect after successful login
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login error appropriately (e.g., display an error message)
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}