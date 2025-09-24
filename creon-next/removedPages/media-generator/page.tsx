"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PhotoIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CursorArrowRaysIcon,
  UserIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface MediaFormData {
  variationCount: string;
  headline: string;
  subHeading: string;
  pointers: string;
  cta: string;
  buttonText: string;
  email: string;
  personDetails: string;
  otherRequirements: string;
  resolution: string;
  wantHeadlineVariations: string;
}

const MediaGeneratorPage: React.FC = () => {
  const [formData, setFormData] = useState<MediaFormData>({
    variationCount: "1",
    headline: "",
    subHeading: "",
    pointers: "",
    cta: "",
    buttonText: "",
    email: "",
    personDetails: "",
    otherRequirements: "",
    resolution: "square",
    wantHeadlineVariations: "false",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://dhruvthc.app.n8n.cloud/webhook/28c13a76-b3e0-4486-8bf8-8fc09b25d88c",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setIsSubmitted(true);
        toast.success("Media generation request submitted successfully!");
        // Reset form after successful submission
        setFormData({
          variationCount: "1",
          headline: "",
          subHeading: "",
          pointers: "",
          cta: "",
          buttonText: "",
          email: "",
          personDetails: "",
          otherRequirements: "",
          resolution: "square",
          wantHeadlineVariations: "false",
        });
      } else {
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting media generation request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      variationCount: "1",
      headline: "",
      subHeading: "",
      pointers: "",
      cta: "",
      buttonText: "",
      email: "",
      personDetails: "",
      otherRequirements: "",
      resolution: "square",
      wantHeadlineVariations: "false",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl"></div>
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-green-100/50 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-emerald-100/50 rounded-full"></div>

        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Media Generator
              </h1>
              <p className="text-gray-600 text-lg">
                Generate stunning media content with AI
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <PhotoIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Media Content
              </h2>
              <p className="text-gray-600">
                Fill in the details to generate personalized media content for
                your campaign.
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Variation Count */}
                <div>
                  <label
                    htmlFor="variationCount"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Variation Count *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CogIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="variationCount"
                      name="variationCount"
                      value={formData.variationCount}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Number of variations"
                    />
                  </div>
                </div>

                {/* Headline */}
                <div>
                  <label
                    htmlFor="headline"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Headline *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="headline"
                      name="headline"
                      value={formData.headline}
                      onChange={handleInputChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter main headline"
                    />
                  </div>
                </div>

                {/* Sub Heading */}
                <div>
                  <label
                    htmlFor="subHeading"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Sub Heading *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="subHeading"
                      name="subHeading"
                      value={formData.subHeading}
                      onChange={handleInputChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter sub heading"
                    />
                  </div>
                </div>

                {/* Pointers */}
                <div>
                  <label
                    htmlFor="pointers"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Key Points
                  </label>
                  <textarea
                    id="pointers"
                    name="pointers"
                    value={formData.pointers}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter key points (one per line)"
                  />
                </div>

                {/* CTA */}
                <div>
                  <label
                    htmlFor="cta"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Call to Action *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CursorArrowRaysIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="cta"
                      name="cta"
                      value={formData.cta}
                      onChange={handleInputChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter call to action"
                    />
                  </div>
                </div>

                {/* Button Text */}
                <div>
                  <label
                    htmlFor="buttonText"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Button Text *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CursorArrowRaysIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="buttonText"
                      name="buttonText"
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter button text"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                {/* Person Details */}
                <div>
                  <label
                    htmlFor="personDetails"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Person Details
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="personDetails"
                      name="personDetails"
                      value={formData.personDetails}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter person details"
                    />
                  </div>
                </div>

                {/* Other Requirements */}
                <div>
                  <label
                    htmlFor="otherRequirements"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Other Requirements
                  </label>
                  <textarea
                    id="otherRequirements"
                    name="otherRequirements"
                    value={formData.otherRequirements}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter any other requirements"
                  />
                </div>

                {/* Resolution */}
                <div>
                  <label
                    htmlFor="resolution"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Resolution *
                  </label>
                  <select
                    id="resolution"
                    name="resolution"
                    value={formData.resolution}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="square">Square</option>
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                  </select>
                </div>

                {/* Want Headline Variations */}
                <div>
                  <label
                    htmlFor="wantHeadlineVariations"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Want Headline Variations
                  </label>
                  <select
                    id="wantHeadlineVariations"
                    name="wantHeadlineVariations"
                    value={formData.wantHeadlineVariations}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <PhotoIcon className="w-5 h-5" />
                      <span>Generate Media</span>
                    </>
                  )}
                </motion.button>
              </form>
            ) : (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <CheckCircleIcon className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Media Generation Request Submitted!
                </h3>

                <p className="text-gray-600 mb-6">
                  Your media generation request has been submitted successfully.
                  You will receive the generated media content via email
                  shortly.
                </p>

                <motion.button
                  onClick={resetForm}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Generate More Media
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* How it Works */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Fill Details</h4>
                  <p className="text-gray-600 text-sm">
                    Provide your content requirements and preferences
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">AI Processing</h4>
                  <p className="text-gray-600 text-sm">
                    Our AI generates personalized media content
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Receive Content
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Get your generated media delivered to your email
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-gradient-to-br from-purple-50 via-indigo-25 to-blue-50 rounded-3xl p-6 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {`What You'll Get`}
            </h3>
            <div className="space-y-3">
              {[
                "High-quality media content",
                "Multiple variations",
                "Custom headlines and CTAs",
                "Professional design elements",
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MediaGeneratorPage;
