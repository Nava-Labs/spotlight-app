import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="flex justify-center"></div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to Spotlight
        </h1>
        <p className="text-xl text-gray-600 max-w-prose mx-auto">
          Unleash your creativity and connect with a global audience. CreatorHub
          is the ultimate platform for content creators to share their passion,
          grow their following, and monetize their talent.
        </p>
        <div>
          <Link href="/onboarding">
            <Button className="text-md shadow border border-zinc-700" size="lg">
              Become a Creator
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
