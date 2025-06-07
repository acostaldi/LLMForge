"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

// Type definition for deployments
type Deployment = {
  id: string;
  model: string;
  provider: string;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const { user } = useUser();
  const pathname = usePathname();
  const [deployments, setDeployments] = useState<Deployment[]>([]);

  useEffect(() => {
    // Refresh deployments every time path changes
    const stored = localStorage.getItem("deployments");
    if (stored) {
      setDeployments(JSON.parse(stored));
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <SignedOut>
        <div className="text-center mt-40">
          <p className="mb-4 text-lg">Please sign in to view your dashboard.</p>
          <SignInButton />
        </div>
      </SignedOut>

      <SignedIn>
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Welcome, {user?.firstName || "User"} 👋</h1>
          <UserButton />
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Render instance cards */}
          {deployments.map((deployment) => (
            <div
              key={deployment.id}
              className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="text-sm text-gray-500">{deployment.createdAt}</div>
              <h2 className="text-lg font-semibold mt-1">{deployment.model}</h2>
              <p className="text-sm text-gray-600">Provider: {deployment.provider}</p>
              <p
                className={`text-sm font-medium mt-2 ${
                  deployment.status === "Running"
                    ? "text-green-600"
                    : deployment.status === "Pending"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                Status: {deployment.status}
              </p>
              <Link
                href={`/chat/${deployment.id}`}
                className="text-sm text-blue-600 mt-3 inline-block hover:underline"
              >
                Open Instance →
              </Link>
            </div>
          ))}

          {/* New instance card */}
          <Link
            href="/deploy"
            className="flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 hover:bg-gray-100 transition"
          >
            <div className="text-4xl font-bold">＋</div>
            <p className="mt-2 font-medium">New Instance</p>
          </Link>
        </div>
      </SignedIn>
    </div>
  );
}