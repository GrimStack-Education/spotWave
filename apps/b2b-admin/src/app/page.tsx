import { Button } from "@heroui/react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">SpotWave B2B Admin</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Welcome to the administration panel for B2B users.
      </p>
      <Button color="primary" size="lg">
        Get Started
      </Button>
    </div>
  );
}
