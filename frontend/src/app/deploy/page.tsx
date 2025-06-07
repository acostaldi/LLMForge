"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeployPage() {
  const router = useRouter();
  const [model, setModel] = useState("");
  const [provider, setProvider] = useState("");
  const [status, setStatus] = useState("Running");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Fake deployment data
    const newDeployment = {
      id: Date.now().toString(),
      model,
      provider,
      status,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    // Save to localStorage for now (real backend later)
    const existing = JSON.parse(localStorage.getItem("deployments") || "[]");
    localStorage.setItem("deployments", JSON.stringify([...existing, newDeployment]));

    // Redirect to dashboard
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