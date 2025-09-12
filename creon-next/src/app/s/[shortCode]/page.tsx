"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const ShortLinkRedirect: React.FC = () => {
  const params = useParams<{ shortCode: string }>();
  const shortCode = params?.shortCode;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = () => {
      if (!shortCode) {
        setError("Invalid link");
        setIsLoading(false);
        return;
      }
      // Redirect to the backend endpoint using env var or fallback to localhost
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";
      window.location.href = `${baseUrl}/s/${shortCode}`;
    };
    // Add a small delay to show the loading state
    const timer = setTimeout(handleRedirect, 500);
    return () => clearTimeout(timer);
  }, [shortCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Link Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return null;
};

export default ShortLinkRedirect;
