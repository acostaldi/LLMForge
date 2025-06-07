"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Deployment = {
  id: string;
  model: string;
  provider: string;
  status: string;
  createdAt: string;
};

export default function ChatInstancePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params); // ✅ unwrap Promise
  const [deployment, setDeployment] = useState<Deployment | null>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("deployments") || "[]");
    const match = stored.find((d: Deployment) => d.id === id);
    if (!match) {
      router.push("/dashboard");
    } else {
      setDeployment(match);
    }
  }, [id, router]);

  if (!deployment) return <p className="p-6 text-gray-600">Loading instance...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Managing Instance: {deployment.model}</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 border rounded space-y-2">
          <h2 className="font-semibold text-lg">Instance Details</h2>
          <p><strong>Model:</strong> {deployment.model}</p>
          <p><strong>Provider:</strong> {deployment.provider}</p>
          <p><strong>Status:</strong> {deployment.status}</p>
          <p><strong>Created:</strong> {deployment.createdAt}</p>

          <button
            onClick={() => {
              const stored = JSON.parse(localStorage.getItem("deployments") || "[]");
              const updated = stored.filter((d: Deployment) => d.id !== id);
              localStorage.setItem("deployments", JSON.stringify(updated));
              router.push("/dashboard");
            }}
            className="mt-4 text-red-600 hover:underline text-sm"
          >
            🗑️ Delete Instance
          </button>
        </div>

        <div className="md:col-span-2 bg-white border p-4 rounded h-96 flex items-center justify-center text-gray-400 text-sm">
          Chat UI coming soon...
        </div>
      </div>
    </div>
  );
}