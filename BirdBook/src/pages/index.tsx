import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page immediately
    router.push('/login');
  }, [router]);

  return null; // This component won't render anything since we're redirecting
}
