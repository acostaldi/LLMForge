"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function DeployPage() {
  const router = useRouter();
  const { user } = useUser();
  const [model, setModel] = useState("");
  const [provider, setProvider] = useState("");
  const status = "Running";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newDeployment = {
      id: Date.now().toString(),
      model,
      provider,
      status,
      createdAt: new Date().toISOString().slice(0, 10),
      settings: {
        temperature: 0.7,
        top_k: 40,
        max_tokens: 256,
      },
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem("deployments") || "[]");
    localStorage.setItem("deployments", JSON.stringify([...existing, newDeployment]));

    // Trigger notebook generation
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
      const res = await fetch(`${BACKEND_URL}/api/generate-notebook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          top_k: 40,
          max_tokens: 256,
          user_id: user?.id || "anonymous",
        }),
      });

      const data = await res.json();
      console.log("Notebook URL:", data.notebook_url); // You could persist or display this later
    } catch (err) {
      console.error("Notebook generation failed:", err);
    }

    router.push("/dashboard");
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Deploy a New Instance</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Model Name</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="block font-medium">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          >
            <option>Colab</option>
            <option>AWS</option>
            <option>GCP</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Deploy
        </button>
      </form>
    </div>
  );
}