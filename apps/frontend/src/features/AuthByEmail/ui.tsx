import { Button } from '@/shared/ui/Button';

export const AuthByEmail = () => {
  return (
    <form className="flex flex-col gap-2">
      <input type="email" placeholder="Email" className="border p-2" />
      <Button>Login</Button>
    </form>
  );
};
