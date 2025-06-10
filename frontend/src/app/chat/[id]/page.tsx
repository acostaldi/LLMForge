"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";

type Deployment = {
  id: string;
  model: string;
  provider: string;
  status: string;
  createdAt: string;
  settings: {
    temperature: number;
    top_k: number;
    max_tokens: number;
  };
};

export default function ChatInstancePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState<string>("");

  // Load from localStorage
  useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("deployments") || "[]");
  const match = stored.find((d: Deployment) => d.id === id);
  if (!match) {
    router.push("/dashboard");
  } else {
    const settings = match.settings || {
      temperature: 0.7,
      top_k: 40,
      max_tokens: 256,
    };
    setDeployment({ ...match, settings });

    const savedMsgs = JSON.parse(localStorage.getItem(`messages-${id}`) || "[]");
    setMessages(savedMsgs);

    // Set API key
    setApiKey(match.id + "-APIKEY-XYZ123");
  }
 }, [id, router]);

  // Save changes to localStorage
  const saveDeployment = (updated: Deployment) => {
    const stored = JSON.parse(localStorage.getItem("deployments") || "[]");
    const updatedList = stored.map((d: Deployment) => (d.id === updated.id ? updated : d));
    localStorage.setItem("deployments", JSON.stringify(updatedList));
    setDeployment(updated);
  };

  const handleDelete = () => {
    const stored = JSON.parse(localStorage.getItem("deployments") || "[]");
    const updated = stored.filter((d: Deployment) => d.id !== id);
    localStorage.setItem("deployments", JSON.stringify(updated));
    router.push("/dashboard");
  };

  if (!deployment) return <p className="p-6 text-gray-600">Loading instance...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Managing Instance:{" "}
          <input
            value={deployment.model}
            onChange={(e) =>
              saveDeployment({ ...deployment, model: e.target.value })
            }
            className="font-mono bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
          />
        </h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Instance Info + Settings */}
        <div className="bg-white p-4 border rounded space-y-4">
          <div>
            <h2 className="font-semibold text-lg mb-1">Details</h2>
            <p><strong>Provider:</strong> {deployment.provider}</p>
            <p><strong>Status:</strong> {deployment.status}</p>
            <p><strong>Created:</strong> {deployment.createdAt}</p>
          </div>

          <div>
            <h2 className="font-semibold text-lg mt-4 mb-2">Model Settings</h2>
            <label className="block text-sm font-medium">Temperature</label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={deployment.settings.temperature}
              onChange={(e) =>
                saveDeployment({
                  ...deployment,
                  settings: { ...deployment.settings, temperature: parseFloat(e.target.value) },
                })
              }
              className="w-full border p-1 rounded mb-2"
            />

            <label className="block text-sm font-medium">Top-K</label>
            <input
              type="number"
              min={0}
              max={100}
              value={deployment.settings.top_k}
              onChange={(e) =>
                saveDeployment({
                  ...deployment,
                  settings: { ...deployment.settings, top_k: parseInt(e.target.value) },
                })
              }
              className="w-full border p-1 rounded mb-2"
            />

            <label className="block text-sm font-medium">Max Tokens</label>
            <input
              type="number"
              min={1}
              max={2048}
              value={deployment.settings.max_tokens}
              onChange={(e) =>
                saveDeployment({
                  ...deployment,
                  settings: { ...deployment.settings, max_tokens: parseInt(e.target.value) },
                })
              }
              className="w-full border p-1 rounded"
            />
          </div>

          <button
            onClick={handleDelete}
            className="mt-4 text-red-600 hover:underline text-sm"
          >
            🗑️ Delete Instance
          </button>
        </div>

        {/* Placeholder Chat */}
        <div className="md:col-span-2 space-y-4">
        {/* Chat Log */}
        <div className="bg-white border p-4 rounded h-72 overflow-y-auto">
            {messages.length === 0 ? (
            <p className="text-gray-400">Start a conversation...</p>
            ) : (
            messages.map((msg, idx) => (
                <div key={idx} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                <span className={`inline-block px-3 py-1 rounded text-sm ${
                    msg.sender === "user" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                }`}>
                    {msg.text}
                </span>
                </div>
            ))
            )}
        </div>

        {/* Chat Input */}
        <form
            onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim() || !deployment) return;

            // Show user's message immediately
            const newMessages = [...messages, { sender: "user" as const, text: input }];
            setMessages(newMessages);

            // Prepare request payload
            const payload = {
              deployment_id: deployment.id,
              message: input,
              settings: deployment.settings,
            };

            //TODO Make this work with a real backend, just just localhost
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

            // Send to backend
            fetch(`${BACKEND_URL}/api/chat`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
              .then((res) => res.json())
              .then((data) => {
                const updated = [...newMessages, { sender: "bot" as const, text: data.response }];
                setMessages(updated);
                localStorage.setItem(`messages-${deployment.id}`, JSON.stringify(updated));
              })
              .catch((err) => {
              console.error("Chat request failed:", err); // ✅ use err
              const errorReply = { sender: "bot" as const, text: "⚠️ Failed to contact model." };
              const updated = [...newMessages, errorReply];
              setMessages(updated);
            });

            setInput(""); // Clear input field
          }}
            className="flex space-x-2"
            >
                
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow border rounded px-3 py-2"
            placeholder="Send a message..."
            />
            <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
            Send
            </button>
        </form>

        {/* API Key Viewer */}
        <div className="bg-white border p-4 rounded space-y-2">
            <h2 className="text-sm font-semibold">API Key</h2>
            <div className="flex items-center space-x-2">
            <input
                type="text"
                value={apiKey}
                readOnly
                className="flex-grow border px-3 py-1 rounded text-sm font-mono"
            />
            <button
                onClick={() => navigator.clipboard.writeText(apiKey)}
                className="text-blue-600 text-sm hover:underline"
            >
                Copy
            </button>
            </div>
            <p className="text-xs text-gray-500">Use this key to authenticate requests to this instance.</p>
        </div>
        </div>
      </div>
    </div>
  );
}