import React, { useEffect, useState } from "react";
import { X, Copy } from "lucide-react";
import axios from "axios";

interface TokenModalProps {
  open: boolean;
  onClose: () => void;
}

const TokenModal: React.FC<TokenModalProps> = ({ open, onClose }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Get user and auth token from session storage
  const user = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const userId = user?._id;
  const authToken = sessionStorage.getItem("token");

  // Fetch pregenerated token on modal open or after creation
  const fetchToken = async () => {
    if (!open || !userId || !authToken) return;
    setLoading(true);
    setError(null);
    setToken(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/token/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setToken(res.data.token || "No token found");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
    // eslint-disable-next-line
  }, [open]);

  // Create new token and refresh token display
  const handleCreate = async () => {
    if (!userId || !authToken) {
      setError("User ID or auth token not found.");
      return;
    }
    setCreateLoading(true);
    setError(null);
    try {
      await axios.post(
        "http://localhost:5000/api/token/generate-secondary-token",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      await fetchToken(); // Refresh token after creation
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Error occurred");
    } finally {
      setCreateLoading(false);
    }
  };

  // Copy token to clipboard
  const handleCopy = async () => {
    if (token) {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold mb-6 text-center">
          Token for Jira Access
        </h2>
        <div>
          <p className="flex items-start gap-2">
            <span className="font-bold">Token:</span>
            {loading ? (
              <span className="text-gray-400">Loading...</span>
            ) : token ? (
              <span
                className="break-all whitespace-pre-line overflow-hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxHeight: "6.5em", // ~4 lines for default font size
                }}
              >
                {token}
              </span>
            ) : (
              <span className="text-gray-400">No token yet</span>
            )}
          </p>
          {/* {error && <p className="text-red-500 mt-2">{error}</p>} */}
        </div>
        <div className="flex flex-col gap-2 mt-8">
          <div className="flex justify-between gap-2">
            <div className="flex justify-start">
              <button
                className="flex items-center px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={handleCopy}
                disabled={!token || loading}
                type="button"
                title="Copy token"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </button>
              {copied && (
                <span className="ml-2 text-green-600 text-xs font-medium self-center">
                  Copied
                </span>
              )}
            </div>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={onClose}
                disabled={loading || createLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
                onClick={handleCreate}
                disabled={loading || createLoading}
              >
                {createLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenModal;
