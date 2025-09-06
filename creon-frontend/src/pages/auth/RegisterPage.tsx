import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { apiService } from '../../services/api';

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string;
  }>({ isChecking: false, isAvailable: null, message: '' });
  
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchedUsername = watch('username');

  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus({ isChecking: false, isAvailable: null, message: '' });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameStatus({ 
        isChecking: false, 
        isAvailable: false, 
        message: 'Username can only contain letters, numbers, and underscores' 
      });
      return;
    }

    setUsernameStatus({ isChecking: true, isAvailable: null, message: 'Checking availability...' });

    try {
      const response = await apiService.checkUsernameAvailability(username);
      const { available } = response.data.data;
      
      setUsernameStatus({
        isChecking: false,
        isAvailable: available,
        message: available ? 'Username is available!' : 'Username is already taken'
      });
    } catch (error) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        message: 'Error checking username availability'
      });
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedUsername && !errors.username) {
        checkUsernameAvailability(watchedUsername);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedUsername, errors.username, checkUsernameAvailability]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img src="/logo.png" alt="Creon Logo" className="w-12 h-12" />
            <span className="text-3xl font-bold gradient-text">Creon</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Start building your online presence today</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('firstName')}
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
                fullWidth={false}
              />
              <Input
                {...register('lastName')}
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                fullWidth={false}
              />
            </div>

            <div className="space-y-1">
              <Input
                {...register('username')}
                label="Username"
                placeholder="johndoe"
                error={errors.username?.message || (usernameStatus.isAvailable === false ? usernameStatus.message : undefined)}
                autoComplete="username"
                rightIcon={
                  usernameStatus.isChecking ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-700 border-t-transparent" />
                  ) : usernameStatus.isAvailable === true ? (
                    <CheckIcon className="w-4 h-4 text-green-600" />
                  ) : usernameStatus.isAvailable === false && !errors.username ? (
                    <XMarkIcon className="w-4 h-4 text-red-600" />
                  ) : null
                }
              />
              {usernameStatus.isAvailable === true && !errors.username && (
                <p className="text-sm text-green-600 flex items-center space-x-1">
                  <CheckIcon className="w-4 h-4" />
                  <span>{usernameStatus.message}</span>
                </p>
              )}
            </div>

            <Input
              {...register('email')}
              type="email"
              label="Email Address"
              placeholder="john@example.com"
              error={errors.email?.message}
              autoComplete="email"
            />

            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Enter your password"
              error={errors.password?.message}
              autoComplete="new-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              }
            />

            <Input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              }
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              size="lg"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="text-green-700 hover:text-green-800 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-green-700 hover:text-green-800">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-green-700 hover:text-green-800">
            Privacy Policy
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;