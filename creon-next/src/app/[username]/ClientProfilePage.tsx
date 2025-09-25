/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LinkIcon, ShareIcon, ShoppingBagIcon, UserIcon } from "lucide-react";
import Card from "@/components/ui/card";
import VideoThumbnail from "../../components/VideoThumbnail";
import { getVideoInfo } from "../../utils/videoUtils";
// import { authService } from "@/services/auth";
import { analyticsService } from "@/services/analytics";
import { shopService } from "@/services/shop";

interface Link {
  _id: string;
  userId: string;
  title: string;
  url: string;
  shortCode: string;
  description?: string;
  image?: string;
  isActive: boolean;
  clickCount: number;
  order: number;
  type: "link" | "header" | "social" | "product_collection";
  shortUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  userId: string;
  collectionId?: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  image: string;
  affiliateUrl: string;
  shortCode: string;
  clickCount: number;
  isActive: boolean;
  tags: string[];
  shortUrl: string;
  formattedPrice?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductCollection {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  image?: string;
  products: string[];
  isActive: boolean;
  order: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ClientProfilePageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profileData: any;
}

export default function ClientProfilePage({
  profileData,
}: ClientProfilePageProps) {
  // console.log("Profile Data Prop:", profileData);
  // Extract data safely

  // All the previous client-side logic and UI goes here
  // ...existing code from the previous page.tsx, but using the profileData prop instead of fetching
  // You will need to copy over all the logic, hooks, and JSX from the original file
  // and replace any usage of profileData from react-query with the prop

  // For brevity, you can copy the entire body of the previous Page component here,
  // replacing the data fetching logic with the prop usage.

  // Example:
  // const theme = useMemo(() => { ... }, [profileData?.data?.user?.theme]);
  // ...rest of the code

  // Get the user ID from profile data to fetch shop settings
  const userId = profileData?.data?.user?.id;

  // Shop settings query - fetch from API instead of localStorage
  const {
    data: shopSettingsData,
    // error: shopSettingsError,
  } = useQuery({
    queryKey: ["publicShopSettings", userId],
    queryFn: () => shopService.getPublicShopSettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const shopSettings = shopSettingsData?.data?.data?.settings;
  const shopEnabled = shopSettings?.isVisible ?? true;
  console.log("Fetched shop settings:", shopEnabled);

  const [activeTab, setActiveTab] = useState<"links" | "shop">("links");
  const [expandedCollections, setExpandedCollections] = useState<string[]>([]);

  // Shop settings are now included in the profile data

  // Extract theme data from the profile response (theme is already included in getUserProfile)
  const theme = useMemo(() => {
    const userTheme = profileData?.data?.user?.theme;
    if (!userTheme) {
      // Return default theme if no theme exists
      return {
        backgroundColor: "#ffffff",
        primaryColor: "#16a34a",
        secondaryColor: "#15803d",
        textColor: "#1f2937",
        accentColor: "#3b82f6",
        fontFamily: "Inter",
        fontSize: "medium",
        fontWeight: "normal",
        buttonStyle: "rounded",
        buttonShadow: true,
        buttonBorderWidth: 0,
        buttonAnimation: "hover-scale",
        profileImageShape: "circle",
        profileImageSize: "medium",
        linkSpacing: "normal",
        maxWidth: "normal",
        backgroundGradient: false,
        gradientDirection: "vertical",
        backdropBlur: false,
      };
    }
    return userTheme;
  }, [profileData?.data?.user?.theme]);
  // const shopSettings = profileData?.data?.data?.shopSettings || {};

  // Extract data safely
  //   const { user, links, collections, products } = profileData?.data?.data || {};
  const { user, links, collections, products } = profileData?.data || {};

  //   // Debug log to check collections and products data
  //   console.log("Profile Data:", {
  //     collectionsCount: collections?.length || 0,
  //     productsCount: products?.length || 0,
  //     collectionProducts: collections?.map((c: ProductCollection) => ({
  //       collectionId: c._id,
  //       productIds: c.products,
  //       productCount: c.products?.length || 0,
  //     })),
  //   });

  // Set default tab based on shopEnabled
  useEffect(() => {
    if (
      shopEnabled &&
      ((products && products.length > 0) ||
        (collections && collections.length > 0))
    ) {
      setActiveTab("shop");
    } else {
      setActiveTab("links");
    }
  }, [shopEnabled, products, collections]);

  // Apply theme to document body
  useEffect(() => {
    if (theme.backgroundColor) {
      document.body.style.backgroundColor = theme.backgroundColor;
    }
    if (theme.fontFamily) {
      document.body.style.fontFamily = theme.fontFamily;
    }

    return () => {
      // Cleanup
      document.body.style.backgroundColor = "";
      document.body.style.fontFamily = "";
    };
  }, [theme]);

  // Track profile view
  useEffect(() => {
    if (profileData?.data?.data?.user?.id) {
      analyticsService
        .trackEvent({
          type: "profile_view",
          userId: profileData.data.data.user.id,
        })
        .catch(() => {
          // Silently fail analytics tracking
        });
    }
  }, [profileData?.data?.data?.user?.id]);

  // Initialize collections to be expanded by default - only 1 or 3 products
  useEffect(() => {
    if (collections && collections.length > 0 && products) {
      const collectionsToExpand = collections
        .filter((collection: ProductCollection) => {
          const collectionProducts = products.filter((p: Product) =>
            collection.products?.includes(p._id)
          );
          const productCount = collectionProducts.length;
          return productCount === 1 || productCount === 3;
        })
        .map((c: ProductCollection) => c._id);

      setExpandedCollections(collectionsToExpand);
    }
  }, [collections, products]);

  const handleLinkClick = async (link: Link) => {
    // Track click analytics
    try {
      await analyticsService.trackEvent({
        type: "link_click",
        linkId: link._id,
      });
    } catch {
      // Silently fail analytics tracking
    }

    // Redirect to link
    window.open(link.url, "_blank");
  };

  const handleProductClick = async (product: Product) => {
    // Track click analytics
    try {
      await analyticsService.trackEvent({
        type: "product_click",
        productId: product._id,
      });
    } catch {
      // Silently fail analytics tracking
    }

    // Redirect to affiliate URL
    window.open(product.affiliateUrl, "_blank");
  };

  // Helper function to generate composite collection image
  const generateCompositeCollectionImage = (collection: ProductCollection) => {
    if (collection.image) {
      return collection.image;
    }

    // Return null to indicate we need to render a composite div
    // (we'll handle the composite rendering in JSX)
    return null;
  };

  // Helper function to get products with images for composite rendering
  const getCompositeProducts = (collection: ProductCollection) => {
    const collectionProducts =
      products?.filter((p: Product) => collection.products?.includes(p._id)) ||
      [];

    const productsWithImages = collectionProducts.filter(
      (p: Product) => p.image
    );

    // Return maximum 4 products for composite
    return productsWithImages.slice(0, 4);
  };

  if (!profileData || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: theme.backgroundColor || "#ffffff" }}
      >
        <Card className="text-center max-w-md">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: theme.textColor || "#1f2937" }}
          >
            Profile Not Found
          </h1>
          <p style={{ color: theme.textColor || "#6b7280", opacity: 0.8 }}>
            {`The profile you're looking for doesn't exist or has been removed.`}
          </p>
        </Card>
      </div>
    );
  }

  const shareProfile = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.firstName} ${user.lastName} - ${user.username}`,
          text: user.bio || `Check out ${user.username}'s profile`,
          url,
        });
      } catch {
        // Fallback to clipboard
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You might want to add a toast notification here
    } catch {
      console.error("Failed to copy to clipboard");
    }
  };

  // Generate dynamic styles based on theme
  const pageStyle = {
    backgroundColor: theme.backgroundColor || "#ffffff",
    backgroundImage: theme.backgroundGradient
      ? `linear-gradient(${
          theme.gradientDirection === "horizontal"
            ? "90deg"
            : theme.gradientDirection === "diagonal"
            ? "135deg"
            : "180deg"
        }, ${theme.backgroundColor || "#ffffff"}, ${
          theme.secondaryColor || "#f3f4f6"
        })`
      : "none",
    color: theme.textColor || "#1f2937",
    fontFamily: `"${
      theme.fontFamily || "Inter"
    }", system-ui, -apple-system, sans-serif`,
    fontSize:
      theme.fontSize === "small"
        ? "14px"
        : theme.fontSize === "large"
        ? "18px"
        : "16px",
    fontWeight: theme.fontWeight || "normal",
    minHeight: "100vh",
  };

  const containerStyle = {
    maxWidth:
      theme.maxWidth === "small"
        ? "480px"
        : theme.maxWidth === "large"
        ? "768px"
        : "640px",
  };

  const profileImageStyle = {
    borderRadius:
      theme.profileImageShape === "square"
        ? "8px"
        : theme.profileImageShape === "rounded-square"
        ? "16px"
        : "50%",
    width:
      theme.profileImageSize === "small"
        ? "80px"
        : theme.profileImageSize === "large"
        ? "160px"
        : "128px",
    height:
      theme.profileImageSize === "small"
        ? "80px"
        : theme.profileImageSize === "large"
        ? "160px"
        : "128px",
  };

  const buttonStyle = {
    backgroundColor: theme.primaryColor || "#16a34a",
    borderColor: theme.primaryColor || "#16a34a",
    borderWidth: `${theme.buttonBorderWidth || 0}px`,
    color: "#ffffff",
    borderRadius:
      theme.buttonStyle === "square"
        ? "8px"
        : theme.buttonStyle === "pill"
        ? "50px"
        : "12px",
    boxShadow: theme.buttonShadow ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
    fontFamily: `"${
      theme.fontFamily || "Inter"
    }", system-ui, -apple-system, sans-serif`,
    fontSize:
      theme.fontSize === "small"
        ? "14px"
        : theme.fontSize === "large"
        ? "18px"
        : "16px",
    fontWeight: theme.fontWeight || "normal",
  };

  // Helper function to get border radius for link buttons
  const getLinkButtonRadius = () => {
    if (theme.buttonStyle === "square") return "8px";
    if (theme.buttonStyle === "pill") return "50px";
    return "12px"; // default rounded
  };

  const linkSpacingClass =
    theme.linkSpacing === "compact"
      ? "space-y-2"
      : theme.linkSpacing === "relaxed"
      ? "space-y-6"
      : "space-y-4";

  return (
    <div
      style={{
        ...pageStyle,
        fontFamily: `"${
          theme.fontFamily || "Inter"
        }", system-ui, -apple-system, sans-serif`,
      }}
      className={theme.backdropBlur ? "backdrop-blur-sm" : ""}
    >
      <div className="container mx-auto px-4 py-8" style={containerStyle}>
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block mb-6">
            {user.profileImage ? (
              <img
                src={
                  user.profileImage.startsWith("http")
                    ? user.profileImage
                    : `${
                        process.env.NEXT_PUBLIC_API_BASE_URL ||
                        "http://localhost:5001"
                      }${user.profileImage}`
                }
                alt={`${user.firstName} ${user.lastName}`}
                className="object-cover mx-auto border-4 border-white shadow-xl"
                style={profileImageStyle}
              />
            ) : (
              <div
                className="flex items-center justify-center mx-auto border-4 border-white shadow-xl"
                style={{
                  ...profileImageStyle,
                  background: `linear-gradient(135deg, ${
                    theme.primaryColor || "#16a34a"
                  }, ${theme.secondaryColor || "#15803d"})`,
                }}
              >
                <span className="text-white text-4xl font-bold">
                  {user.firstName?.[0] || user.username?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: theme.textColor || "#1f2937" }}
          >
            {user.firstName} {user.lastName}
          </h1>
          <p
            className="text-lg mb-4"
            style={{ color: theme.textColor || "#6b7280", opacity: 0.8 }}
          >
            @{user.username}
          </p>

          {user.bio && (
            <p
              className="text-center max-w-md mx-auto mb-6"
              style={{ color: theme.textColor || "#374151" }}
            >
              {user.bio}
            </p>
          )}

          {/* Social Links */}
          {user.socialLinks &&
            Object.values(user.socialLinks).some((link) => link) && (
              <div className="flex justify-center space-x-4 mb-6">
                {user.socialLinks.instagram && (
                  <a
                    href={user.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 transition-colors"
                    style={
                      {
                        "--hover-color": theme.accentColor || "#8b5cf6",
                      } as React.CSSProperties
                    }
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color =
                        theme.accentColor || "#8b5cf6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#4b5563";
                    }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {user.socialLinks.youtube && (
                  <a
                    href={user.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color =
                        theme.accentColor || "#8b5cf6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#4b5563";
                    }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}
                {user.socialLinks.twitter && (
                  <a
                    href={user.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color =
                        theme.accentColor || "#8b5cf6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#4b5563";
                    }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                )}
                {user.socialLinks.linkedin && (
                  <a
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color =
                        theme.accentColor || "#8b5cf6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#4b5563";
                    }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.25 11.268h-3v-5.604c0-1.337-.025-3.061-1.865-3.061-1.867 0-2.154 1.459-2.154 2.967v5.698h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.844-1.563 3.042 0 3.604 2.002 3.604 4.604v5.592z" />
                    </svg>
                  </a>
                )}
                {user.socialLinks.facebook && (
                  <a
                    href={user.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color =
                        theme.accentColor || "#8b5cf6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#4b5563";
                    }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.326v21.348c0 .733.592 1.326 1.325 1.326h11.495v-9.294h-3.128v-3.622h3.128v-2.672c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12v9.294h6.116c.73 0 1.323-.593 1.323-1.326v-21.349c0-.734-.593-1.326-1.324-1.326z" />
                    </svg>
                  </a>
                )}
              </div>
            )}

          <button
            onClick={shareProfile}
            className={`inline-flex items-center px-4 py-2 border-2 font-medium transition-all mb-8 ${
              theme.buttonAnimation === "hover-lift"
                ? "hover:-translate-y-1"
                : theme.buttonAnimation === "hover-scale"
                ? "hover:scale-105"
                : theme.buttonAnimation === "hover-glow"
                ? "hover:shadow-lg"
                : ""
            }`}
            style={buttonStyle}
          >
            <ShareIcon className="w-4 h-4 mr-2" />
            Share Profile
          </button>
        </motion.div>

        {/* Tabs - Only show if shop is enabled and there are products/collections */}
        {shopEnabled &&
          ((products && products.length > 0) ||
            (collections && collections.length > 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div
                className="flex rounded-lg border p-1"
                style={{
                  backgroundColor: theme.backgroundColor || "#ffffff",
                  borderColor: theme.primaryColor
                    ? `${theme.primaryColor}40`
                    : "#e5e7eb",
                  borderRadius: getLinkButtonRadius(),
                }}
              >
                <button
                  onClick={() => setActiveTab("links")}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === "links"
                      ? "text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === "links"
                        ? theme.primaryColor || "#16a34a"
                        : "transparent",
                    color:
                      activeTab === "links"
                        ? "#ffffff"
                        : theme.textColor || "#6b7280",
                    borderRadius: getLinkButtonRadius(),
                    fontFamily: `"${
                      theme.fontFamily || "Inter"
                    }", system-ui, -apple-system, sans-serif`,
                    fontSize:
                      theme.fontSize === "small"
                        ? "12px"
                        : theme.fontSize === "large"
                        ? "16px"
                        : "14px",
                  }}
                >
                  <LinkIcon className="w-4 h-4 mr-2 inline" />
                  Links
                </button>
                <button
                  onClick={() => setActiveTab("shop")}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === "shop"
                      ? "text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === "shop"
                        ? theme.primaryColor || "#16a34a"
                        : "transparent",
                    color:
                      activeTab === "shop"
                        ? "#ffffff"
                        : theme.textColor || "#6b7280",
                    borderRadius: getLinkButtonRadius(),
                    fontFamily: `"${
                      theme.fontFamily || "Inter"
                    }", system-ui, -apple-system, sans-serif`,
                    fontSize:
                      theme.fontSize === "small"
                        ? "12px"
                        : theme.fontSize === "large"
                        ? "16px"
                        : "14px",
                  }}
                >
                  <ShoppingBagIcon className="w-4 h-4 mr-2 inline" />
                  Shop
                </button>
              </div>
            </motion.div>
          )}

        {/* Links Section */}
        {activeTab === "links" && links && links.length > 0 && (
          <div className={`mb-8 ${linkSpacingClass}`}>
            {links.map((link: Link, index: number) => {
              const videoInfo = getVideoInfo(link.url);
              return (
                <motion.div
                  key={link._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div
                    onClick={() => handleLinkClick(link)}
                    className={`cursor-pointer p-4 bg-white rounded-lg border border-gray-200 transition-all duration-200 ${
                      theme.buttonAnimation === "hover-lift"
                        ? "hover:-translate-y-1"
                        : theme.buttonAnimation === "hover-scale"
                        ? "hover:scale-[1.02]"
                        : theme.buttonAnimation === "hover-glow"
                        ? "hover:shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    style={{
                      backgroundColor: theme.backgroundColor || "#ffffff",
                      borderColor: theme.primaryColor
                        ? `${theme.primaryColor}20`
                        : "#e5e7eb",
                      borderWidth: `${theme.buttonBorderWidth || 1}px`,
                      borderRadius: getLinkButtonRadius(),
                      boxShadow: theme.buttonShadow
                        ? "0 2px 4px rgba(0, 0, 0, 0.1)"
                        : "none",
                      fontFamily: `"${
                        theme.fontFamily || "Inter"
                      }", system-ui, -apple-system, sans-serif`,
                      fontSize:
                        theme.fontSize === "small"
                          ? "14px"
                          : theme.fontSize === "large"
                          ? "18px"
                          : "16px",
                      fontWeight: theme.fontWeight || "normal",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {videoInfo.isVideo ? (
                          <VideoThumbnail
                            url={link.url}
                            title={link.title}
                            size="medium"
                          />
                        ) : link.image ? (
                          <img
                            src={link.image}
                            alt={link.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${
                                theme.primaryColor || "#16a34a"
                              }, ${theme.secondaryColor || "#15803d"})`,
                            }}
                          >
                            <LinkIcon className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3
                              className="font-semibold truncate"
                              style={{ color: theme.textColor || "#1f2937" }}
                            >
                              {link.title}
                            </h3>
                            {videoInfo.isVideo && (
                              <span
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{
                                  backgroundColor:
                                    theme.accentColor || "#8b5cf6",
                                }}
                              >
                                Video
                              </span>
                            )}
                          </div>
                          {link.description && (
                            <p
                              className="text-sm truncate"
                              style={{
                                color: theme.textColor || "#6b7280",
                                opacity: 0.7,
                              }}
                            >
                              {link.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          color: theme.textColor || "#9ca3af",
                          opacity: 0.5,
                        }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Collections when shop is disabled - use same expanded style as shop tab */}
        {!shopEnabled && collections && collections.length > 0 && (
          <div className={`mb-8 ${linkSpacingClass}`}>
            {collections.map((collection: ProductCollection, index: number) => {
              // Create a unique ID for this collection for expansion tracking
              const collectionId = collection._id;
              const isExpanded = expandedCollections.includes(collectionId);
              const collectionProducts =
                products?.filter((p: Product) =>
                  collection.products?.includes(p._id)
                ) || [];
              const productCount = collectionProducts.length;

              // Function to toggle expansion state
              const toggleExpand = () => {
                setExpandedCollections((prev) =>
                  isExpanded
                    ? prev.filter((id) => id !== collectionId)
                    : [...prev, collectionId]
                );
              };

              return (
                <motion.div
                  key={collection._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="mb-4"
                >
                  {/* Collection Card - styled similarly to links for consistency */}
                  <div
                    onClick={toggleExpand}
                    className={`cursor-pointer transition-all duration-200 overflow-hidden ${
                      theme.buttonAnimation === "hover-lift"
                        ? "hover:-translate-y-1"
                        : theme.buttonAnimation === "hover-scale"
                        ? "hover:scale-[1.02]"
                        : theme.buttonAnimation === "hover-glow"
                        ? "hover:shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    style={{
                      backgroundColor: theme.backgroundColor || "#ffffff",
                      borderColor: theme.primaryColor
                        ? `${theme.primaryColor}20`
                        : "#e5e7eb",
                      borderWidth: `${theme.buttonBorderWidth || 1}px`,
                      borderStyle: "solid",
                      borderRadius: getLinkButtonRadius(),
                      boxShadow: theme.buttonShadow
                        ? "0 2px 4px rgba(0, 0, 0, 0.1)"
                        : "none",
                    }}
                  >
                    {/* Collection Image Area */}
                    {generateCompositeCollectionImage(collection) ? (
                      <div className="relative">
                        <img
                          src={generateCompositeCollectionImage(collection)!}
                          alt={collection.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                          <div className="flex justify-between items-end w-full">
                            <div>
                              <h2
                                className="text-xl font-bold text-white mb-1"
                                style={{
                                  fontFamily: `"${
                                    theme.fontFamily || "Inter"
                                  }", system-ui, -apple-system, sans-serif`,
                                  fontSize:
                                    theme.fontSize === "small"
                                      ? "18px"
                                      : theme.fontSize === "large"
                                      ? "24px"
                                      : "20px",
                                  fontWeight:
                                    theme.fontWeight === "light"
                                      ? 300
                                      : theme.fontWeight === "medium"
                                      ? 500
                                      : theme.fontWeight === "semibold"
                                      ? 600
                                      : theme.fontWeight === "bold"
                                      ? 700
                                      : 400,
                                }}
                              >
                                {collection.title}
                              </h2>
                              {collection.description && (
                                <p
                                  className="text-white/80 text-sm line-clamp-2"
                                  style={{
                                    fontFamily: `"${
                                      theme.fontFamily || "Inter"
                                    }", system-ui, -apple-system, sans-serif`,
                                    fontSize:
                                      theme.fontSize === "small"
                                        ? "12px"
                                        : theme.fontSize === "large"
                                        ? "16px"
                                        : "14px",
                                  }}
                                >
                                  {collection.description}
                                </p>
                              )}
                            </div>
                            {productCount > 0 && (
                              <div className="flex items-center bg-white/20 rounded-full p-1 backdrop-blur-sm">
                                <span className="text-white text-xs font-medium mr-1">
                                  {productCount}{" "}
                                  {productCount === 1 ? "item" : "items"}
                                </span>
                                <svg
                                  className={`w-4 h-4 text-white transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : getCompositeProducts(collection).length > 0 ? (
                      <div className="relative">
                        <div
                          className={`w-full h-48 grid gap-1 ${
                            getCompositeProducts(collection).length === 1
                              ? "grid-cols-1"
                              : getCompositeProducts(collection).length === 2
                              ? "grid-cols-2"
                              : getCompositeProducts(collection).length === 3
                              ? "grid-cols-3"
                              : "grid-cols-2 grid-rows-2"
                          }`}
                        >
                          {getCompositeProducts(collection).map(
                            (product: Product, idx: number) => (
                              <img
                                key={idx}
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                style={{
                                  borderTopLeftRadius:
                                    idx === 0 ? getLinkButtonRadius() : "0",
                                  borderTopRightRadius:
                                    getCompositeProducts(collection).length ===
                                      1 ||
                                    (getCompositeProducts(collection).length ===
                                      2 &&
                                      idx === 1) ||
                                    (getCompositeProducts(collection).length ===
                                      3 &&
                                      idx === 2) ||
                                    (getCompositeProducts(collection).length ===
                                      4 &&
                                      idx === 1)
                                      ? getLinkButtonRadius()
                                      : "0",
                                }}
                              />
                            )
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                          <div className="flex justify-between items-end w-full">
                            <div>
                              <h2
                                className="text-xl font-bold text-white mb-1"
                                style={{
                                  fontFamily: `"${
                                    theme.fontFamily || "Inter"
                                  }", system-ui, -apple-system, sans-serif`,
                                  fontSize:
                                    theme.fontSize === "small"
                                      ? "18px"
                                      : theme.fontSize === "large"
                                      ? "24px"
                                      : "20px",
                                  fontWeight:
                                    theme.fontWeight === "light"
                                      ? 300
                                      : theme.fontWeight === "medium"
                                      ? 500
                                      : theme.fontWeight === "semibold"
                                      ? 600
                                      : theme.fontWeight === "bold"
                                      ? 700
                                      : 400,
                                }}
                              >
                                {collection.title}
                              </h2>
                              {collection.description && (
                                <p
                                  className="text-white/80 text-sm line-clamp-2"
                                  style={{
                                    fontFamily: `"${
                                      theme.fontFamily || "Inter"
                                    }", system-ui, -apple-system, sans-serif`,
                                    fontSize:
                                      theme.fontSize === "small"
                                        ? "12px"
                                        : theme.fontSize === "large"
                                        ? "16px"
                                        : "14px",
                                  }}
                                >
                                  {collection.description}
                                </p>
                              )}
                            </div>
                            {productCount > 0 && (
                              <div className="flex items-center bg-white/20 rounded-full p-1 backdrop-blur-sm">
                                <span className="text-white text-xs font-medium mr-1">
                                  {productCount}{" "}
                                  {productCount === 1 ? "item" : "items"}
                                </span>
                                <svg
                                  className={`w-4 h-4 text-white transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="p-4"
                        style={{
                          backgroundColor: theme.backgroundColor || "#ffffff",
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                              style={{
                                backgroundColor: `${
                                  theme.primaryColor || "#16a34a"
                                }20`,
                              }}
                            >
                              <ShoppingBagIcon
                                className="w-5 h-5"
                                style={{
                                  color: theme.primaryColor || "#16a34a",
                                }}
                              />
                            </div>
                            <div>
                              <h3
                                className="font-semibold"
                                style={{
                                  color: theme.textColor || "#1f2937",
                                  fontFamily: `"${
                                    theme.fontFamily || "Inter"
                                  }", system-ui, -apple-system, sans-serif`,
                                  fontSize:
                                    theme.fontSize === "small"
                                      ? "14px"
                                      : theme.fontSize === "large"
                                      ? "18px"
                                      : "16px",
                                }}
                              >
                                {collection.title}
                              </h3>
                              {collection.description && (
                                <p
                                  className="text-sm line-clamp-1"
                                  style={{
                                    color: theme.textColor || "#6b7280",
                                    opacity: 0.7,
                                  }}
                                >
                                  {collection.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {productCount > 0 && (
                              <div className="flex items-center mr-2">
                                <span
                                  className="text-sm font-medium mr-1"
                                  style={{
                                    color: theme.textColor || "#6b7280",
                                    opacity: 0.8,
                                  }}
                                >
                                  {productCount}{" "}
                                  {productCount === 1 ? "item" : "items"}
                                </span>
                              </div>
                            )}
                            <div
                              style={{
                                color: theme.textColor || "#9ca3af",
                                opacity: 0.5,
                              }}
                            >
                              <svg
                                className={`w-5 h-5 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expandable Products Container */}
                  <motion.div
                    initial="collapsed"
                    animate={isExpanded ? "expanded" : "collapsed"}
                    variants={{
                      expanded: { opacity: 1, height: "auto", marginTop: 16 },
                      collapsed: { opacity: 0, height: 0, marginTop: 0 },
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {collectionProducts.length === 0 ? (
                        <div
                          className="col-span-2 text-center py-6 rounded-lg"
                          style={{
                            backgroundColor: `${
                              theme.backgroundColor || "#ffffff"
                            }`,
                            border: `1px dashed ${
                              theme.primaryColor
                                ? `${theme.primaryColor}40`
                                : "#e5e7eb"
                            }`,
                            borderRadius: getLinkButtonRadius(),
                          }}
                        >
                          <ShoppingBagIcon
                            className="w-8 h-8 mx-auto mb-2 opacity-60"
                            style={{ color: theme.primaryColor || "#16a34a" }}
                          />
                          <p
                            style={{
                              color: theme.textColor || "#6b7280",
                              opacity: 0.7,
                              fontFamily: `"${
                                theme.fontFamily || "Inter"
                              }", system-ui, -apple-system, sans-serif`,
                            }}
                          >
                            No products in this collection yet
                          </p>
                        </div>
                      ) : (
                        /* Display products that belong to this collection */
                        collectionProducts.map((product: Product) => (
                          <motion.div
                            key={product._id}
                            whileHover={{
                              scale:
                                theme.buttonAnimation === "hover-scale"
                                  ? 1.03
                                  : 1,
                              y:
                                theme.buttonAnimation === "hover-lift" ? -5 : 0,
                              boxShadow:
                                theme.buttonAnimation === "hover-glow"
                                  ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                                  : "",
                            }}
                            className="cursor-pointer overflow-hidden transition-all duration-300"
                            onClick={() => handleProductClick(product)}
                            style={{
                              backgroundColor:
                                theme.backgroundColor || "#ffffff",
                              borderRadius: getLinkButtonRadius(),
                              boxShadow: theme.buttonShadow
                                ? "0 2px 5px rgba(0, 0, 0, 0.08)"
                                : "none",
                              border: `${
                                theme.buttonBorderWidth || 1
                              }px solid ${
                                theme.primaryColor
                                  ? `${theme.primaryColor}20`
                                  : "#e5e7eb"
                              }`,
                            }}
                          >
                            <div className="relative">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-full object-contain"
                                style={{
                                  borderTopLeftRadius: getLinkButtonRadius(),
                                  borderTopRightRadius: getLinkButtonRadius(),
                                }}
                              />
                              <div
                                className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"
                                style={{
                                  borderBottomLeftRadius: getLinkButtonRadius(),
                                  borderBottomRightRadius:
                                    getLinkButtonRadius(),
                                }}
                              ></div>
                            </div>
                            <div className="p-3">
                              <h4
                                className="font-semibold text-sm mb-1 line-clamp-2"
                                style={{
                                  color: theme.textColor || "#1f2937",
                                  fontFamily: `"${
                                    theme.fontFamily || "Inter"
                                  }", system-ui, -apple-system, sans-serif`,
                                  fontSize:
                                    theme.fontSize === "small"
                                      ? "12px"
                                      : theme.fontSize === "large"
                                      ? "16px"
                                      : "14px",
                                  fontWeight: theme.fontWeight || "normal",
                                }}
                              >
                                {product.title}
                              </h4>
                              {product.price && (
                                <div className="flex items-center justify-between mt-1">
                                  <p
                                    className="font-bold"
                                    style={{
                                      color: theme.primaryColor || "#16a34a",
                                      fontSize:
                                        theme.fontSize === "small"
                                          ? "12px"
                                          : theme.fontSize === "large"
                                          ? "16px"
                                          : "14px",
                                    }}
                                  >
                                    {product.currency === "INR"
                                      ? `₹${product.price.toFixed(2)}`
                                      : product.currency === "USD"
                                      ? `$${product.price.toFixed(2)}`
                                      : `${
                                          product.currency
                                        } ${product.price.toFixed(2)}`}
                                  </p>
                                  <button
                                    className="text-xs py-1 px-2 rounded-full"
                                    style={{
                                      backgroundColor: `${
                                        theme.primaryColor || "#16a34a"
                                      }20`,
                                      color: theme.primaryColor || "#16a34a",
                                      fontFamily: `"${
                                        theme.fontFamily || "Inter"
                                      }", system-ui, -apple-system, sans-serif`,
                                    }}
                                  >
                                    Shop Now
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Product Collections */}
        {activeTab === "shop" && collections && collections.length > 0 && (
          <div className={`mb-8 ${linkSpacingClass}`}>
            {collections.map((collection: ProductCollection, index: number) => {
              // Create a unique ID for this collection for expansion tracking
              const collectionId = collection._id;
              const isExpanded = expandedCollections.includes(collectionId);
              const collectionProducts =
                products?.filter((p: Product) =>
                  collection.products?.includes(p._id)
                ) || [];
              const productCount = collectionProducts.length;

              // Function to toggle expansion state
              const toggleExpand = () => {
                setExpandedCollections((prev) =>
                  isExpanded
                    ? prev.filter((id) => id !== collectionId)
                    : [...prev, collectionId]
                );
              };

              return (
                <motion.div
                  key={collection._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="mb-4"
                >
                  {/* Collection Card - styled similarly to links for consistency */}
                  <div
                    onClick={toggleExpand}
                    className={`cursor-pointer transition-all duration-200 overflow-hidden ${
                      theme.buttonAnimation === "hover-lift"
                        ? "hover:-translate-y-1"
                        : theme.buttonAnimation === "hover-scale"
                        ? "hover:scale-[1.02]"
                        : theme.buttonAnimation === "hover-glow"
                        ? "hover:shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    style={{
                      backgroundColor: theme.backgroundColor || "#ffffff",
                      borderColor: theme.primaryColor
                        ? `${theme.primaryColor}20`
                        : "#e5e7eb",
                      borderWidth: `${theme.buttonBorderWidth || 1}px`,
                      borderStyle: "solid",
                      borderRadius: getLinkButtonRadius(),
                      boxShadow: theme.buttonShadow
                        ? "0 2px 4px rgba(0, 0, 0, 0.1)"
                        : "none",
                    }}
                  >
                    {/* Collection Image Area */}
                    {generateCompositeCollectionImage(collection) ? (
                      <div className="relative">
                        <img
                          src={generateCompositeCollectionImage(collection)!}
                          alt={collection.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                          <div className="flex justify-between items-end w-full">
                            <div>
                              <h2
                                className="text-xl font-bold text-white mb-1"
                                style={{
                                  fontFamily: `"${
                                    theme.fontFamily || "Inter"
                                  }", system-ui, -apple-system, sans-serif`,
                                  fontSize:
                                    theme.fontSize === "small"
                                      ? "18px"
                                      : theme.fontSize === "large"
                                      ? "24px"
                                      : "20px",
                                  fontWeight:
                                    theme.fontWeight === "light"
                                      ? 300
                                      : theme.fontWeight === "medium"
                                      ? 500
                                      : theme.fontWeight === "semibold"
                                      ? 600
                                      : theme.fontWeight === "bold"
                                      ? 700
                                      : 400,
                                }}
                              >
                                {collection.title}
                              </h2>
                              {collection.description && (
                                <p
                                  className="text-white/80 text-sm line-clamp-2"
                                  style={{
                                    fontFamily: `"${
                                      theme.fontFamily || "Inter"
                                    }", system-ui, -apple-system, sans-serif`,
                                    fontSize:
                                      theme.fontSize === "small"
                                        ? "12px"
                                        : theme.fontSize === "large"
                                        ? "16px"
                                        : "14px",
                                  }}
                                >
                                  {collection.description}
                                </p>
                              )}
                            </div>
                            {productCount > 0 && (
                              <div className="flex items-center bg-white/20 rounded-full p-1 backdrop-blur-sm">
                                <span className="text-white text-xs font-medium mr-1">
                                  {productCount}{" "}
                                  {productCount === 1 ? "item" : "items"}
                                </span>
                                <svg
                                  className={`w-4 h-4 text-white transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : getCompositeProducts(collection).length > 0 ? (
                      <div className="relative">
                        <div
                          className={`w-full h-48 grid gap-1 ${
                            getCompositeProducts(collection).length === 1
                              ? "grid-cols-1"
                              : getCompositeProducts(collection).length === 2
                              ? "grid-cols-2"
                              : getCompositeProducts(collection).length === 3
                              ? "grid-cols-3"
                              : "grid-cols-2 grid-rows-2"
                          }`}
                        >
                          {getCompositeProducts(collection).map(
                            (product: Product, idx: number) => (
                              <img
                                key={idx}
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                style={{
                                  borderTopLeftRadius:
                                    idx === 0 ? getLinkButtonRadius() : "0",
                                  borderTopRightRadius:
                                    getCompositeProducts(collection).length ===
                                      1 ||
                                    (getCompositeProducts(collection).length ===
                                      2 &&
                                      idx === 1) ||
                                    (getCompositeProducts(collection).length ===
                                      3 &&
                                      idx === 2) ||
                                    (getCompositeProducts(collection).length ===
                                      4 &&
                                      idx === 1)
                                      ? getLinkButtonRadius()
                                      : "0",
                                }}
                              />
                            )
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                          <div className="flex justify-between items-end w-full">
                            <div>
                              <h2
                                className="text-xl font-bold text-white mb-1"
                                style={{
                                  fontFamily: `"${
                                    theme.fontFamily || "Inter"
                                  }", system-ui, -apple-system, sans-serif`,
                                  fontSize:
                                    theme.fontSize === "small"
                                      ? "18px"
                                      : theme.fontSize === "large"
                                      ? "24px"
                                      : "20px",
                                  fontWeight:
                                    theme.fontWeight === "light"
                                      ? 300
                                      : theme.fontWeight === "medium"
                                      ? 500
                                      : theme.fontWeight === "semibold"
                                      ? 600
                                      : theme.fontWeight === "bold"
                                      ? 700
                                      : 400,
                                }}
                              >
                                {collection.title}
                              </h2>
                              {collection.description && (
                                <p
                                  className="text-white/80 text-sm line-clamp-2"
                                  style={{
                                    fontFamily: `"${
                                      theme.fontFamily || "Inter"
                                    }", system-ui, -apple-system, sans-serif`,
                                    fontSize:
                                      theme.fontSize === "small"
                                        ? "12px"
                                        : theme.fontSize === "large"
                                        ? "16px"
                                        : "14px",
                                  }}
                                >
                                  {collection.description}
                                </p>
                              )}
                            </div>
                            {productCount > 0 && (
                              <div className="flex items-center bg-white/20 rounded-full p-1 backdrop-blur-sm">
                                <span className="text-white text-xs font-medium mr-1">
                                  {productCount}{" "}
                                  {productCount === 1 ? "item" : "items"}
                                </span>
                                <svg
                                  className={`w-4 h-4 text-white transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="p-4"
                        style={{
                          backgroundColor: theme.backgroundColor || "#ffffff",
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                              style={{
                                backgroundColor: `${
                                  theme.primaryColor || "#16a34a"
                                }20`,
                              }}
                            >
                              <ShoppingBagIcon
                                className="w-5 h-5"
                                style={{
                                  color: theme.primaryColor || "#16a34a",
                                }}
                              />
                            </div>
                            <div>
                              <h3
                                className="font-semibold"
                                style={{
                                  color: theme.textColor || "#1f2937",
                                  fontFamily: `"${
                                    theme.fontFamily || "Inter"
                                  }", system-ui, -apple-system, sans-serif`,
                                  fontSize:
                                    theme.fontSize === "small"
                                      ? "14px"
                                      : theme.fontSize === "large"
                                      ? "18px"
                                      : "16px",
                                }}
                              >
                                {collection.title}
                              </h3>
                              {collection.description && (
                                <p
                                  className="text-sm line-clamp-1"
                                  style={{
                                    color: theme.textColor || "#6b7280",
                                    opacity: 0.7,
                                  }}
                                >
                                  {collection.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {productCount > 0 && (
                              <div className="flex items-center mr-2">
                                <span
                                  className="text-sm font-medium mr-1"
                                  style={{
                                    color: theme.textColor || "#6b7280",
                                    opacity: 0.8,
                                  }}
                                >
                                  {productCount}{" "}
                                  {productCount === 1 ? "item" : "items"}
                                </span>
                              </div>
                            )}
                            <div
                              style={{
                                color: theme.textColor || "#9ca3af",
                                opacity: 0.5,
                              }}
                            >
                              <svg
                                className={`w-5 h-5 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expandable Products Container */}
                  <motion.div
                    initial="collapsed"
                    animate={isExpanded ? "expanded" : "collapsed"}
                    variants={{
                      expanded: { opacity: 1, height: "auto", marginTop: 16 },
                      collapsed: { opacity: 0, height: 0, marginTop: 0 },
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {collectionProducts.length === 0 ? (
                        <div
                          className="col-span-2 text-center py-6 rounded-lg"
                          style={{
                            backgroundColor: `${
                              theme.backgroundColor || "#ffffff"
                            }`,
                            border: `1px dashed ${
                              theme.primaryColor
                                ? `${theme.primaryColor}40`
                                : "#e5e7eb"
                            }`,
                            borderRadius: getLinkButtonRadius(),
                          }}
                        >
                          <ShoppingBagIcon
                            className="w-8 h-8 mx-auto mb-2 opacity-60"
                            style={{ color: theme.primaryColor || "#16a34a" }}
                          />
                          <p
                            style={{
                              color: theme.textColor || "#6b7280",
                              opacity: 0.7,
                              fontFamily: `"${
                                theme.fontFamily || "Inter"
                              }", system-ui, -apple-system, sans-serif`,
                            }}
                          >
                            No products in this collection yet
                          </p>
                        </div>
                      ) : (
                        /* Display products that belong to this collection */
                        collectionProducts.map((product: Product) => (
                          <motion.div
                            key={product._id}
                            whileHover={{
                              scale:
                                theme.buttonAnimation === "hover-scale"
                                  ? 1.03
                                  : 1,
                              y:
                                theme.buttonAnimation === "hover-lift" ? -5 : 0,
                              boxShadow:
                                theme.buttonAnimation === "hover-glow"
                                  ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                                  : "",
                            }}
                            className="cursor-pointer overflow-hidden transition-all duration-300"
                            onClick={() => handleProductClick(product)}
                            style={{
                              backgroundColor:
                                theme.backgroundColor || "#ffffff",
                              borderRadius: getLinkButtonRadius(),
                              boxShadow: theme.buttonShadow
                                ? "0 2px 5px rgba(0, 0, 0, 0.08)"
                                : "none",
                              border: `${
                                theme.buttonBorderWidth || 1
                              }px solid ${
                                theme.primaryColor
                                  ? `${theme.primaryColor}20`
                                  : "#e5e7eb"
                              }`,
                            }}
                          >
                            <div className="relative">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-32 object-cover"
                                style={{
                                  borderTopLeftRadius: getLinkButtonRadius(),
                                  borderTopRightRadius: getLinkButtonRadius(),
                                }}
                              />
                              <div
                                className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"
                                style={{
                                  borderBottomLeftRadius: getLinkButtonRadius(),
                                  borderBottomRightRadius:
                                    getLinkButtonRadius(),
                                }}
                              ></div>
                            </div>
                            <div className="p-3">
                              <h4
                                className="font-semibold text-sm mb-1 line-clamp-2"
                                style={{
                                  color: theme.textColor || "#1f2937",
                                  fontFamily: `"${
                                    theme.fontFamily || "Inter"
                                  }", system-ui, -apple-system, sans-serif`,
                                  fontSize:
                                    theme.fontSize === "small"
                                      ? "12px"
                                      : theme.fontSize === "large"
                                      ? "16px"
                                      : "14px",
                                  fontWeight: theme.fontWeight || "normal",
                                }}
                              >
                                {product.title}
                              </h4>
                              {product.price && (
                                <div className="flex items-center justify-between mt-1">
                                  <p
                                    className="font-bold"
                                    style={{
                                      color: theme.primaryColor || "#16a34a",
                                      fontSize:
                                        theme.fontSize === "small"
                                          ? "12px"
                                          : theme.fontSize === "large"
                                          ? "16px"
                                          : "14px",
                                    }}
                                  >
                                    {product.currency === "INR"
                                      ? `₹${product.price.toFixed(2)}`
                                      : product.currency === "USD"
                                      ? `$${product.price.toFixed(2)}`
                                      : `${
                                          product.currency
                                        } ${product.price.toFixed(2)}`}
                                  </p>
                                  <button
                                    className="text-xs py-1 px-2 rounded-full"
                                    style={{
                                      backgroundColor: `${
                                        theme.primaryColor || "#16a34a"
                                      }20`,
                                      color: theme.primaryColor || "#16a34a",
                                      fontFamily: `"${
                                        theme.fontFamily || "Inter"
                                      }", system-ui, -apple-system, sans-serif`,
                                    }}
                                  >
                                    Shop Now
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Tab-specific Empty State */}
        {((activeTab === "links" && (!links || links.length === 0)) ||
          (activeTab === "shop" &&
            (!products || products.length === 0) &&
            (!collections || collections.length === 0))) &&
          ((links && links.length > 0) ||
            (products && products.length > 0) ||
            (collections && collections.length > 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="text-center py-12">
                {activeTab === "links" ? (
                  <>
                    <LinkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: theme.textColor || "#1f2937" }}
                    >
                      No links yet
                    </h3>
                    <p
                      className="text-gray-500"
                      style={{
                        color: theme.textColor || "#6b7280",
                        opacity: 0.8,
                      }}
                    >
                      {user.firstName} {`hasn't added any links yet.`}
                    </p>
                  </>
                ) : (
                  <>
                    <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: theme.textColor || "#1f2937" }}
                    >
                      No shop items yet
                    </h3>
                    <p
                      className="text-gray-500"
                      style={{
                        color: theme.textColor || "#6b7280",
                        opacity: 0.8,
                      }}
                    >
                      {user.firstName}{" "}
                      {`hasn't added any products or collections yet.`}
                    </p>
                  </>
                )}
              </Card>
            </motion.div>
          )}

        {/* Overall Empty State */}
        {(!links || links.length === 0) &&
          (!products || products.length === 0) &&
          (!collections || collections.length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="text-center py-12">
                <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: theme.textColor || "#1f2937" }}
                >
                  Nothing here yet
                </h3>
                <p
                  className="text-gray-500"
                  style={{ color: theme.textColor || "#6b7280", opacity: 0.8 }}
                >
                  {user.firstName} {`hasn't added any content yet.`}
                </p>
              </Card>
            </motion.div>
          )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-12 py-8"
        >
          <p className="text-gray-500 text-sm">
            Powered by{" "}
            <Link
              href="https://synquic.com/"
              className="font-medium transition-colors"
              style={{
                color: "green",
              }}
            >
              Synquic
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
