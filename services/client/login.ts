import { useMutation } from '@tanstack/react-query';
import axiosInstance from "@/lib/axiosInstance";
import { useRouter } from 'next/navigation';

type LoginData = {
  usn: string;
  pwd: string;
};

type LoginResponse = {
  success: boolean;
  error?: string;
};

export const useLogin = () => {
    const router = useRouter();

  return useMutation<LoginResponse, Error, LoginData>({
    mutationFn: (variables) => axiosInstance.post('/login', variables),
    onSuccess: (data) => {
        console.log('useLogin');
        
        if (data.success) {
            router.push('/');
          } else {
            router.push(`/login?error=access_denied`);
          }
    },
    onError: (error) => {
      console.error('Error during login:', error);
    }
  });
}
