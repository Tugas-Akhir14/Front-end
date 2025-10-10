import { useRouter } from 'next/navigation';

function LogoutButton() {
  const router = useRouter();
  const logout = () => {
    try { sessionStorage.removeItem('token'); } catch {}
    router.replace('/auth/signin');
  };
  return <button onClick={logout}>Logout</button>;
}
