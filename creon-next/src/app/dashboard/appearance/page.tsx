"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  PaintbrushIcon,
  EyeIcon,
  SwatchBookIcon,
  SmartphoneIcon,
  // ArrowPathIcon,
} from "lucide-react";
import Button from "@/components/ui/button";
import PublicProfilePreview from "@/components/PublicProfilePreview";
import { themeService } from "@/services/theme";
import toast from "react-hot-toast";

interface ColorPalette {
  name: string;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  accentColor: string;
}

const AppearancePageNew: React.FC = () => {
  // const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("colors");

  const { data: themeData, isLoading } = useQuery({
    queryKey: ["theme"],
    queryFn: () => themeService.getUserTheme(),
  });

  const updateThemeMutation = useMutation({
    mutationFn: themeService.updateTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theme"] });
      toast.success("Theme updated successfully!");
    },
    onError: (error: unknown) => {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: unknown }).response === "object" &&
        (error as { response?: { data?: unknown } }).response !== null &&
        "data" in (error as { response?: { data?: unknown } }).response! &&
        typeof (error as { response: { data?: unknown } }).response.data ===
          "object" &&
        (error as { response: { data?: unknown } }).response.data !== null &&
        "message" in
          (error as { response: { data: { message?: string } } }).response.data
      ) {
        toast.error(
          (
            (error as { response: { data: { message?: string } } }).response
              .data as { message?: string }
          ).message || "Failed to update theme"
        );
      } else {
        toast.error("Failed to update theme");
      }
    },
  });

  const resetThemeMutation = useMutation({
    mutationFn: themeService.resetTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theme"] });
      toast.success("Theme reset to default!");
    },
    onError: (error: string) => {
      toast.error("Failed to reset theme");
      console.log(error);
    },
  });

  const theme = themeData?.data?.data?.theme || {};

  const colorPalettes: ColorPalette[] = [
    {
      name: "Green Fresh",
      backgroundColor: "#ffffff",
      primaryColor: "#16a34a",
      secondaryColor: "#15803d",
      textColor: "#1f2937",
      accentColor: "#3b82f6",
    },
    {
      name: "Ocean Blue",
      backgroundColor: "#f0f9ff",
      primaryColor: "#0ea5e9",
      secondaryColor: "#0284c7",
      textColor: "#1e293b",
      accentColor: "#8b5cf6",
    },
    {
      name: "Sunset Orange",
      backgroundColor: "#fff7ed",
      primaryColor: "#ea580c",
      secondaryColor: "#c2410c",
      textColor: "#1c1917",
      accentColor: "#f59e0b",
    },
    {
      name: "Royal Purple",
      backgroundColor: "#faf5ff",
      primaryColor: "#9333ea",
      secondaryColor: "#7c3aed",
      textColor: "#1f2937",
      accentColor: "#ec4899",
    },
    {
      name: "Rose Pink",
      backgroundColor: "#fff1f2",
      primaryColor: "#e11d48",
      secondaryColor: "#be123c",
      textColor: "#1f2937",
      accentColor: "#f97316",
    },
    {
      name: "Dark Mode",
      backgroundColor: "#0f172a",
      primaryColor: "#22d3ee",
      secondaryColor: "#06b6d4",
      textColor: "#f1f5f9",
      accentColor: "#a78bfa",
    },
  ];

  const fontFamilies = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Source Sans Pro",
    "Nunito",
    "Raleway",
    "Ubuntu",
  ];

  const handleThemeUpdate = (updates: object) => {
    updateThemeMutation.mutate(updates);
  };

  const handleColorPaletteSelect = (palette: ColorPalette) => {
    const updates = {
      backgroundColor: palette.backgroundColor,
      primaryColor: palette.primaryColor,
      secondaryColor: palette.secondaryColor,
      textColor: palette.textColor,
      accentColor: palette.accentColor,
    };
    handleThemeUpdate(updates);
  };

  const ColorPicker: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
  }> = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-3">
        <div
          className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
          style={{ backgroundColor: value, minWidth: "3rem" }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "color";
            input.value = value;
            input.addEventListener("change", (e) => {
              onChange((e.target as HTMLInputElement).value);
            });
            input.click();
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  const tabs = [
    { id: "colors", name: "Colors", icon: SwatchBookIcon },
    { id: "typography", name: "Typography", icon: PaintbrushIcon },
    { id: "buttons", name: "Buttons", icon: SmartphoneIcon },
    { id: "layout", name: "Layout", icon: EyeIcon },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Appearance
            </h1>
            <p className="text-gray-600">
              Customize how your profile looks to visitors
            </p>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end mb-6">
            <Button
              onClick={() => resetThemeMutation.mutate()}
              variant="outline"
              disabled={resetThemeMutation.isPending}
            >
              Reset to Default
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {activeTab === "colors" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Color Palette
                </h3>

                {/* Predefined Palettes */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Quick Palettes
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {colorPalettes.map((palette, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorPaletteSelect(palette)}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex space-x-2 mb-2">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: palette.primaryColor }}
                          />
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{
                              backgroundColor: palette.secondaryColor,
                            }}
                          />
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: palette.accentColor }}
                          />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {palette.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="space-y-6">
                  <h4 className="text-sm font-medium text-gray-700">
                    Custom Colors
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ColorPicker
                      label="Background Color"
                      value={theme.backgroundColor || "#ffffff"}
                      onChange={(value) =>
                        handleThemeUpdate({ backgroundColor: value })
                      }
                    />
                    <ColorPicker
                      label="Primary Color"
                      value={theme.primaryColor || "#16a34a"}
                      onChange={(value) =>
                        handleThemeUpdate({ primaryColor: value })
                      }
                    />
                    <ColorPicker
                      label="Secondary Color"
                      value={theme.secondaryColor || "#15803d"}
                      onChange={(value) =>
                        handleThemeUpdate({ secondaryColor: value })
                      }
                    />
                    <ColorPicker
                      label="Text Color"
                      value={theme.textColor || "#1f2937"}
                      onChange={(value) =>
                        handleThemeUpdate({ textColor: value })
                      }
                    />
                    <ColorPicker
                      label="Accent Color"
                      value={theme.accentColor || "#3b82f6"}
                      onChange={(value) =>
                        handleThemeUpdate({ accentColor: value })
                      }
                    />
                  </div>
                </div>

                {/* Gradient Settings */}
                <div className="space-y-6 mt-8">
                  <h4 className="text-sm font-medium text-gray-700">
                    Background Gradient
                  </h4>
                  <div className="space-y-4">
                    {/* Enable/Disable Gradient */}
                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={theme.backgroundGradient || false}
                          onChange={(e) =>
                            handleThemeUpdate({
                              backgroundGradient: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Enable Background Gradient
                        </span>
                      </label>
                    </div>

                    {/* Gradient Direction */}
                    {theme.backgroundGradient && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Gradient Direction
                        </label>
                        <div className="flex space-x-3">
                          {[
                            {
                              value: "vertical",
                              label: "Vertical",
                              icon: "↓",
                            },
                            {
                              value: "horizontal",
                              label: "Horizontal",
                              icon: "→",
                            },
                            {
                              value: "diagonal",
                              label: "Diagonal",
                              icon: "↘",
                            },
                          ].map((direction) => (
                            <Button
                              key={direction.value}
                              onClick={() =>
                                handleThemeUpdate({
                                  gradientDirection: direction.value,
                                })
                              }
                              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                (theme.gradientDirection || "vertical") ===
                                direction.value
                                  ? "border-primary bg-gray text-primary-700"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <span className="text-lg mr-2">
                                {direction.icon}
                              </span>
                              {direction.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gradient Preview */}
                    {theme.backgroundGradient && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Gradient Preview
                        </label>
                        <div
                          className="w-full h-20 rounded-lg border-2 border-gray-200"
                          style={{
                            background: `linear-gradient(${
                              theme.gradientDirection === "horizontal"
                                ? "90deg"
                                : theme.gradientDirection === "diagonal"
                                ? "135deg"
                                : "180deg"
                            }, ${theme.backgroundColor || "#ffffff"}, ${
                              theme.secondaryColor || "#15803d"
                            })`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "typography" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Typography
                </h3>

                <div className="space-y-6">
                  {/* Font Family */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Font Family
                    </label>
                    <select
                      value={theme.fontFamily || "Inter"}
                      onChange={(e) =>
                        handleThemeUpdate({ fontFamily: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {fontFamilies.map((font) => (
                        <option
                          key={font}
                          value={font}
                          style={{ fontFamily: font }}
                        >
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Font Size
                    </label>
                    <div className="flex space-x-3">
                      {["small", "medium", "large"].map((size) => (
                        <button
                          key={size}
                          onClick={() => handleThemeUpdate({ fontSize: size })}
                          className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                            (theme.fontSize || "medium") === size
                              ? "border-primary bg-primary-50 text-primary-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Font Weight
                    </label>
                    <div className="flex space-x-3 flex-wrap gap-2">
                      {["light", "normal", "medium", "semibold", "bold"].map(
                        (weight) => (
                          <button
                            key={weight}
                            onClick={() =>
                              handleThemeUpdate({ fontWeight: weight })
                            }
                            className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                              (theme.fontWeight || "normal") === weight
                                ? "border-primary bg-primary-50 text-primary-700"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            style={{ fontWeight: weight as string }}
                          >
                            {weight.charAt(0).toUpperCase() + weight.slice(1)}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "buttons" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Button Style
                </h3>

                <div className="space-y-6">
                  {/* Button Shape */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Button Shape
                    </label>
                    <div className="flex space-x-3">
                      {[
                        { value: "rounded", label: "Rounded" },
                        { value: "square", label: "Square" },
                        { value: "pill", label: "Pill" },
                      ].map((style) => (
                        <button
                          key={style.value}
                          onClick={() =>
                            handleThemeUpdate({ buttonStyle: style.value })
                          }
                          className={`px-6 py-3 border-2 transition-colors ${
                            (theme.buttonStyle || "rounded") === style.value
                              ? "border-primary bg-primary-50 text-primary-700"
                              : "border-gray-200 hover:border-gray-300"
                          } ${
                            style.value === "rounded"
                              ? "rounded-lg"
                              : style.value === "square"
                              ? "rounded-none"
                              : "rounded-full"
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Button Animation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Button Animation
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "none", label: "None" },
                        { value: "hover-lift", label: "Lift" },
                        { value: "hover-scale", label: "Scale" },
                        { value: "hover-glow", label: "Glow" },
                      ].map((animation) => (
                        <button
                          key={animation.value}
                          onClick={() =>
                            handleThemeUpdate({
                              buttonAnimation: animation.value,
                            })
                          }
                          className={`p-3 border-2 rounded-lg transition-all ${
                            (theme.buttonAnimation || "hover-scale") ===
                            animation.value
                              ? "border-primary bg-primary-50 text-primary-700"
                              : "border-gray-200 hover:border-gray-300"
                          } ${
                            animation.value === "hover-lift"
                              ? "hover:-translate-y-1"
                              : animation.value === "hover-scale"
                              ? "hover:scale-105"
                              : animation.value === "hover-glow"
                              ? "hover:shadow-lg"
                              : ""
                          }`}
                        >
                          {animation.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Button Shadow */}
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={theme.buttonShadow !== false}
                        onChange={(e) =>
                          handleThemeUpdate({
                            buttonShadow: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Enable Button Shadow
                      </span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "layout" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Layout Options
                </h3>

                <div className="space-y-6">
                  {/* Profile Image Shape */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Profile Image Shape
                    </label>
                    <div className="flex space-x-3">
                      {[
                        { value: "circle", label: "Circle" },
                        { value: "square", label: "Square" },
                        { value: "rounded-square", label: "Rounded" },
                      ].map((shape) => (
                        <button
                          key={shape.value}
                          onClick={() =>
                            handleThemeUpdate({
                              profileImageShape: shape.value,
                            })
                          }
                          className={`px-4 py-2 border-2 rounded-lg transition-colors ${
                            (theme.profileImageShape || "circle") ===
                            shape.value
                              ? "border-primary bg-primary-50 text-primary-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {shape.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Link Spacing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Link Spacing
                    </label>
                    <div className="flex space-x-3">
                      {[
                        { value: "compact", label: "Compact" },
                        { value: "normal", label: "Normal" },
                        { value: "relaxed", label: "Relaxed" },
                      ].map((spacing) => (
                        <button
                          key={spacing.value}
                          onClick={() =>
                            handleThemeUpdate({ linkSpacing: spacing.value })
                          }
                          className={`px-4 py-2 border-2 rounded-lg transition-colors ${
                            (theme.linkSpacing || "normal") === spacing.value
                              ? "border-primary bg-primary-50 text-primary-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {spacing.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Backdrop Blur */}
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={theme.backdropBlur || false}
                        onChange={(e) =>
                          handleThemeUpdate({
                            backdropBlur: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Enable Backdrop Blur
                      </span>
                    </label>
                  </div>

                  {/* Hide Branding */}
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={theme.hideBranding || false}
                        onChange={(e) =>
                          handleThemeUpdate({
                            hideBranding: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Hide Creon Branding
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {`Remove "Powered by Creon" from your public profile`}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Live Preview
            </h3>
            <PublicProfilePreview
              className="mx-auto"
              hideBranding={theme.hideBranding || false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearancePageNew;
