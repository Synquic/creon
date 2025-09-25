/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  ShoppingBagIcon,
  BoxesIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  XIcon,
  // CopyIcon,
  // CheckIcon,
  CameraIcon,
  // EyeIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { ProductsService } from "@/services/product";
import { collectionService } from "@/services/collections";
import { shopService } from "@/services/shop";
// import { authService } from "@/services/auth";

// --- Product Types & Schema ---
interface Product {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  image?: string;
  affiliateUrl: string;
  shortCode: string;
  tags: string[];
  clickCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const productSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z
    .string()
    .max(500, "Description too long")
    .optional()
    .or(z.literal("")),
  price: z.number().min(0, "Price must be positive"),
  currency: z.string().min(1, "Currency is required"),
  affiliateUrl: z
    .string()
    .url("Please enter a valid URL")
    .min(1, "URL is required"),
  shortCode: z.string().min(1, "Short code is required"),
  tags: z.array(z.string()).optional(),
  image: z.string().min(1, "Product image is required"),
});
type ProductFormData = z.infer<typeof productSchema>;

// --- Collection Types & Schema ---
interface Collection {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  image?: string;
  products: (string | Product)[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const collectionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z
    .string()
    .max(500, "Description too long")
    .optional()
    .or(z.literal("")),
  image: z.string().optional(),
  products: z.array(z.string()),
});
type CollectionFormData = z.infer<typeof collectionSchema>;

const ShopPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"products" | "collections">(
    "products"
  );

  // General
  const queryClient = useQueryClient();

  // Shop settings query
  const { data: shopSettingsData, isLoading: shopSettingsLoading } = useQuery({
    queryKey: ["shopSettings"],
    queryFn: () => shopService.getShopSettings(),
  });

  const shopSettings = shopSettingsData?.data?.data?.settings;
  const shopEnabled = shopSettings?.isVisible ?? false;

  // Shop settings mutation
  const updateShopSettingsMutation = useMutation({
    mutationFn: (settings: { isVisible: boolean }) =>
      shopService.updateShopSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopSettings"] });
      toast.success("Shop settings updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update shop settings");
    },
  });

  const handleShopEnabledToggle = () => {
    updateShopSettingsMutation.mutate({ isVisible: !shopEnabled });
  };
  // Product state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentProductImage, setCurrentProductImage] = useState<string | null>(
    null
  );
  // --- Product Form ---
  const {
    register: registerProduct,
    handleSubmit: handleSubmitProduct,
    reset: resetProduct,
    setValue: setValueProduct,
    formState: { errors: errorsProduct, isSubmitting: isSubmittingProduct },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { currency: "INR", tags: [], image: "", shortCode: "" },
  });

  // Auto-parse product from URL (copied from products/page.tsx)
  const [url, setUrl] = useState("");
  const [parsing, setParsing] = useState(false);
  interface ParsedProductData {
    productTitle?: string;
    productDescription?: string;
    price?: number | string;
    currency?: string;
    productCode?: string;
    productImage?: string;
    [key: string]: unknown;
  }
  const [pendingParsedData, setPendingParsedData] =
    useState<ParsedProductData | null>(null);

  // Hydrate product form with parsed data when available
  React.useEffect(() => {
    if (showProductForm && pendingParsedData) {
      setTimeout(() => {
        try {
          setValueProduct("title", pendingParsedData.productTitle || "", {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValueProduct(
            "description",
            pendingParsedData.productDescription || "",
            { shouldValidate: true, shouldDirty: true }
          );
          const priceValue =
            typeof pendingParsedData.price === "number"
              ? pendingParsedData.price
              : Number(
                  (pendingParsedData.price as number | string | undefined)
                    ?.toString()
                    .replace(/[^\d.]/g, "")
                ) || 0;
          setValueProduct("price", priceValue, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValueProduct("currency", pendingParsedData.currency || "USD", {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValueProduct("affiliateUrl", url, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValueProduct("shortCode", pendingParsedData.productCode || "", {
            shouldValidate: true,
            shouldDirty: true,
          });
          if (pendingParsedData.productImage) {
            setValueProduct("image", pendingParsedData.productImage, {
              shouldValidate: true,
              shouldDirty: true,
            });
            setCurrentProductImage(pendingParsedData.productImage);
          }
        } catch {
          toast.error("Failed to populate form with product data");
        }
        setPendingParsedData(null);
      }, 300);
    }
  }, [showProductForm, pendingParsedData, setValueProduct, url]);

  // Handler for parsing URL
  const handleParseUrl = async () => {
    if (!url) return;
    try {
      setParsing(true);
      if (showProductForm) {
        resetProduct({
          title: "",
          description: "",
          price: 0,
          currency: "INR",
          affiliateUrl: url,
          shortCode: "",
          image: "",
          tags: [],
        });
        setCurrentProductImage(null);
      }
      setPendingParsedData(null);
      // Use linkService.fetchParsedData (as in products/page.tsx)
      const { linkService } = await import("@/services/link");
      const parsed = await linkService.fetchParsedData(url);
      if (parsed?.data?.data) {
        setPendingParsedData(parsed.data.data);
        if (!showProductForm) setShowProductForm(true);
        toast.success("URL parsed successfully, filling form data...");
      } else {
        toast.error("Could not parse product data from the URL.");
      }
    } catch {
      toast.error("Unable to parse product data from the URL.");
    } finally {
      setParsing(false);
    }
  };
  // Collection state
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [currentCollectionImage, setCurrentCollectionImage] = useState<
    string | null
  >(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Products Query ---
  const {
    data: productsData,
    isLoading: productsLoading,
    // error: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => ProductsService.getProducts(),
  });
  const products: Product[] = productsData?.data?.data?.products || [];

  // --- Collections Query ---
  const {
    data: collectionsData,
    isLoading: collectionsLoading,
    // error: collectionsError,
  } = useQuery({
    queryKey: ["collections"],
    queryFn: () => collectionService.getCollections(),
  });
  const collections: Collection[] =
    collectionsData?.data?.data?.collections || [];

  // --- Product Mutations ---
  const createProductMutation = useMutation({
    mutationFn: ProductsService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully!");
      setShowProductForm(false);
      setCurrentProductImage(null);
      resetProduct();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create product";
      toast.error(errorMessage);
    },
  });
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      ProductsService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully!");
      setEditingProduct(null);
      setShowProductForm(false);
      setCurrentProductImage(null);
      resetProduct();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update product";
      toast.error(errorMessage);
    },
  });
  const deleteProductMutation = useMutation({
    mutationFn: ProductsService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });

  // --- Collection Mutations ---
  const createCollectionMutation = useMutation({
    mutationFn: collectionService.createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Collection created successfully!");
      setShowCollectionForm(false);
      setCurrentCollectionImage(null);
      setSelectedProducts([]);
      resetCollection();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create collection";
      toast.error(errorMessage);
    },
  });
  const updateCollectionMutation = useMutation({
    mutationFn: ({
      id,
      title,
      data,
    }: {
      id: string;
      title: string;
      data: object;
    }) => {
      return collectionService.updateCollection(id, title, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Collection updated successfully!");
      setEditingCollection(null);
      setShowCollectionForm(false);
      setCurrentCollectionImage(null);
      setSelectedProducts([]);
      resetCollection();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update collection";
      toast.error(errorMessage);
    },
  });
  const deleteCollectionMutation = useMutation({
    mutationFn: collectionService.deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Collection deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete collection");
    },
  });

  // --- Product Form ---
  // const {
  //   register: registerProduct,
  //   handleSubmit: handleSubmitProduct,
  //   reset: resetProduct,
  //   setValue: setValueProduct,
  //   formState: { errors: errorsProduct, isSubmitting: isSubmittingProduct },
  // } = useForm<ProductFormData>({
  //   resolver: zodResolver(productSchema),
  //   defaultValues: { currency: "USD", tags: [] },
  // });

  // --- Collection Form ---
  const {
    register: registerCollection,
    handleSubmit: handleSubmitCollection,
    reset: resetCollection,
    setValue: setValueCollection,
    formState: {
      errors: errorsCollection,
      isSubmitting: isSubmittingCollection,
    },
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: { products: [] },
  });

  // Sync selectedProducts with editingCollection when editing starts
  React.useEffect(() => {
    if (editingCollection && editingCollection.products) {
      // Ensure we only store product IDs as strings, not full objects
      const productIds = editingCollection.products.map((product) =>
        typeof product === "string" ? product : product._id
      );
      setSelectedProducts(productIds);
      setValueCollection("products", productIds);
    } else if (!showCollectionForm) {
      // Reset when form is closed
      setSelectedProducts([]);
    }
  }, [editingCollection, showCollectionForm, setValueCollection]);

  // Helper function to generate composite collection image
  const generateCompositeCollectionImage = (collection: Collection) => {
    if (collection.image) {
      return collection.image;
    }

    // Return null to indicate we need to render a composite div
    // (we'll handle the composite rendering in JSX)
    return null;
  };

  // Helper function to get products with images for composite rendering
  const getCompositeProducts = (collection: Collection) => {
    if (!collection.products || !products) return [];

    const collectionProducts = products.filter((p: Product) => {
      // Handle both string IDs and Product objects in collection.products
      const productIds = collection.products.map((item) =>
        typeof item === "string" ? item : item._id
      );
      const isInCollection = productIds.includes(p._id);
      const hasImage = p.image && p.image.trim() !== "";
      return isInCollection && hasImage;
    });

    // Return maximum 4 products for composite
    return collectionProducts.slice(0, 4);
  };

  // --- Handlers ---
  // Product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setValueProduct("title", product.title);
    setValueProduct("description", product.description || "");
    setValueProduct("price", product.price);
    setValueProduct("currency", product.currency);
    setValueProduct("affiliateUrl", product.affiliateUrl);
    setValueProduct("shortCode", product.shortCode);
    setValueProduct("tags", product.tags);
    setValueProduct("image", product.image || "");
    setCurrentProductImage(product.image || null);
    setShowProductForm(true);
  };
  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProductMutation.mutateAsync(productId);
    }
  };

  // Collection
  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setValueCollection("title", collection.title);
    setValueCollection("description", collection.description || "");
    setValueCollection("image", collection.image || "");

    // Ensure we only work with product IDs (strings), not full objects
    const productIds = collection.products.map((product) =>
      typeof product === "string" ? product : product._id
    );
    setValueCollection("products", productIds);
    setSelectedProducts(productIds);
    setCurrentCollectionImage(collection.image || null);
    setShowCollectionForm(true);
  };
  const handleDeleteCollection = async (collectionId: string) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      await deleteCollectionMutation.mutateAsync(collectionId);
    }
  };

  // --- UI ---
  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-4">
      {/* Shop Info and Toggle */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold mb-1">Manage your Shop</h2>
          <p className="text-gray-600 text-sm">
            Add products and collections to your public profile, Use the toggle
            to show or hide your shop tab for visitors.
          </p>
        </div>
        <label className="flex items-center cursor-pointer select-none">
          <span className="mr-2 text-sm font-medium text-gray-700">
            Shop Enabled
          </span>
          <span className="relative">
            <input
              type="checkbox"
              checked={shopEnabled}
              onChange={handleShopEnabledToggle}
              disabled={updateShopSettingsMutation.isPending}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
          </span>
        </label>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "products"
              ? "bg-primary text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "collections"
              ? "bg-primary text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("collections")}
        >
          Collections
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          {/* Add Product Button */}
          {!showProductForm && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowProductForm(true)}
              className="w-full mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Product</span>
            </motion.button>
          )}

          {/* Auto-parse product from URL (only when not editing) */}
          {!editingProduct && (
            <div className="flex items-center gap-2 mb-6">
              <Input
                type="text"
                className="border rounded-2xl px-3 py-2 flex-1 transition-all hover:border-yellow-400 hover:shadow-[0_0_0_3px_rgba(255,215,0,0.3)]"
                placeholder="Paste product URL to parse with AI✨..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={parsing}
              />
              <Button onClick={handleParseUrl} disabled={!url || parsing}>
                {parsing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Parsing...
                  </span>
                ) : (
                  "Parse with AI✨"
                )}
              </Button>
            </div>
          )}

          {/* Product Form */}
          <AnimatePresence>
            {showProductForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      setCurrentProductImage(null);
                      resetProduct();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmitProduct((data) => {
                    const productImage = currentProductImage || data.image;
                    if (!productImage) {
                      toast.error("Product image is required");
                      return;
                    }
                    const cleanData = {
                      ...data,
                      image: productImage,
                    };
                    if (editingProduct) {
                      updateProductMutation.mutate({
                        id: editingProduct._id,
                        data: cleanData,
                      });
                    } else {
                      createProductMutation.mutate(cleanData);
                    }
                  })}
                  className="space-y-4"
                >
                  {/* Product Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Product Image <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div
                          className={`w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden ${
                            errorsProduct.image
                              ? "border-2 border-red-300"
                              : "border-2 border-transparent"
                          }`}
                        >
                          {currentProductImage ? (
                            <img
                              src={currentProductImage}
                              alt="Product preview"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <ShoppingBagIcon className="w-10 h-10 text-gray-400" />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700 transition-colors">
                          <CameraIcon className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (!file.type.startsWith("image/")) {
                                toast.error("Please select an image file");
                                return;
                              }
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error("Image size must be less than 5MB");
                                return;
                              }
                              const imageUrl = URL.createObjectURL(file);
                              setCurrentProductImage(imageUrl);
                              setValueProduct("image", imageUrl, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">
                          Upload a product image to showcase your item
                        </p>
                        <p className="text-xs text-gray-500">
                          Supported formats: JPG, PNG, GIF (max 5MB)
                        </p>
                      </div>
                    </div>
                    {errorsProduct.image && (
                      <p className="mt-2 text-sm text-red-600">
                        {errorsProduct.image.message}
                      </p>
                    )}
                    {/* Hidden input for form registration */}
                    <input
                      {...registerProduct("image")}
                      type="hidden"
                      value={currentProductImage || ""}
                    />
                  </div>

                  <Input
                    {...registerProduct("title")}
                    label="Product Title"
                    placeholder="Amazing Product"
                    error={errorsProduct.title?.message}
                  />
                  <Input
                    {...registerProduct("price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    label="Price"
                    placeholder="29.99"
                    error={errorsProduct.price?.message}
                  />
                  <Input
                    {...registerProduct("currency")}
                    label="Currency"
                    placeholder="USD"
                    error={errorsProduct.currency?.message}
                  />
                  <Input
                    {...registerProduct("affiliateUrl")}
                    label="Affiliate URL"
                    placeholder="https://example.com/product"
                    error={errorsProduct.affiliateUrl?.message}
                  />
                  <Input
                    {...registerProduct("shortCode")}
                    label="Custom Short Code *"
                    placeholder="amazing-product"
                    error={errorsProduct.shortCode?.message}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      {...registerProduct("description")}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Describe your amazing product..."
                    />
                    {errorsProduct.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errorsProduct.description.message}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      isLoading={isSubmittingProduct}
                      className="flex-1"
                    >
                      {editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                        setCurrentProductImage(null);
                        resetProduct();
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products List */}
          {productsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-700 border-t-transparent"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No products yet
              </h3>
              <p className="text-gray-600">
                Add your first product to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ShoppingBagIcon className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-base text-gray-900 line-clamp-1">
                        {product.title}
                      </h3>
                      <span className="text-base font-bold text-primary">
                        {product.currency} {product.price}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="flex items-center space-x-1">
                        <ChartBarIcon className="w-4 h-4" />
                        <span>{product.clickCount} clicks</span>
                      </span>
                      <span className="font-mono">/{product.shortCode}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collections Tab */}
      {activeTab === "collections" && (
        <div>
          {/* Add Collection Button */}
          {!showCollectionForm && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowCollectionForm(true)}
              className="w-full mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Collection</span>
            </motion.button>
          )}

          {/* Collection Form */}
          <AnimatePresence>
            {showCollectionForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingCollection
                      ? "Edit Collection"
                      : "Create New Collection"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCollectionForm(false);
                      setEditingCollection(null);
                      setCurrentCollectionImage(null);
                      setSelectedProducts([]);
                      resetCollection();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmitCollection((data) => {
                    const cleanData = {
                      ...data,
                      image: currentCollectionImage || data.image,
                      products: selectedProducts,
                    };
                    if (editingCollection) {
                      updateCollectionMutation.mutate({
                        id: editingCollection._id,
                        title: data.title,
                        data: cleanData,
                      });
                    } else {
                      createCollectionMutation.mutate(cleanData);
                    }
                  })}
                  onError={(errors) => {
                    toast.error("Please fix the errors in the form.");
                    console.error("❌ Form validation errors:", errors);
                  }}
                  className="space-y-4"
                >
                  {/* Collection Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Collection Cover Image
                    </label>
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                          {currentCollectionImage ? (
                            <img
                              src={currentCollectionImage}
                              alt="Collection preview"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <BoxesIcon className="w-10 h-10 text-gray-400" />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700 transition-colors">
                          <CameraIcon className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (!file.type.startsWith("image/")) {
                                toast.error("Please select an image file");
                                return;
                              }
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error("Image size must be less than 5MB");
                                return;
                              }
                              setCurrentCollectionImage(
                                URL.createObjectURL(file)
                              );
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <Input
                    {...registerCollection("title")}
                    label="Collection Title"
                    placeholder="My Amazing Collection"
                    error={errorsCollection.title?.message}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      {...registerCollection("description")}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Describe your collection..."
                    />
                    {errorsCollection.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errorsCollection.description.message}
                      </p>
                    )}
                  </div>

                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Products
                    </label>
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search products by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {productsLoading ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-700"></div>
                        </div>
                      ) : products.length ? (
                        <div className="grid grid-cols-2 gap-3">
                          {products
                            .filter((product) =>
                              product.title
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            )
                            .map((product) => (
                              <div
                                key={product._id}
                                onClick={() => {
                                  const updatedSelection =
                                    selectedProducts.includes(product._id)
                                      ? selectedProducts.filter(
                                          (id) => id !== product._id
                                        )
                                      : [...selectedProducts, product._id];
                                  setSelectedProducts(updatedSelection);
                                  setValueCollection(
                                    "products",
                                    updatedSelection
                                  );
                                }}
                                className={`cursor-pointer p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                                  selectedProducts.includes(product._id)
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex flex-col items-center text-center space-y-2">
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                    {product.image ? (
                                      <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-full object-contain"
                                      />
                                    ) : (
                                      <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="w-full">
                                    <p className="font-medium text-gray-900 text-xs line-clamp-2 leading-tight">
                                      {product.title}
                                    </p>
                                    <p className="text-xs text-gray-600 font-semibold mt-1">
                                      {product.currency} {product.price}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          No products available
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      isLoading={
                        isSubmittingCollection ||
                        updateCollectionMutation.isPending ||
                        createCollectionMutation.isPending
                      }
                      disabled={
                        isSubmittingCollection ||
                        updateCollectionMutation.isPending ||
                        createCollectionMutation.isPending
                      }
                      className="flex-1"
                    >
                      {editingCollection
                        ? updateCollectionMutation.isPending
                          ? "Updating..."
                          : "Update Collection"
                        : createCollectionMutation.isPending
                        ? "Creating..."
                        : "Create Collection"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCollectionForm(false);
                        setEditingCollection(null);
                        setCurrentCollectionImage(null);
                        setSelectedProducts([]);
                        resetCollection();
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collections List */}
          {collectionsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-700 border-t-transparent"></div>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-12">
              <BoxesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No collections yet
              </h3>
              <p className="text-gray-600">
                Create your first collection to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <div
                  key={collection._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                    {(() => {
                      const compositeImage =
                        generateCompositeCollectionImage(collection);

                      if (compositeImage) {
                        return (
                          <img
                            src={compositeImage}
                            alt={collection.title}
                            className="w-full h-full object-contain"
                          />
                        );
                      }

                      // Generate composite from products
                      const compositeProducts =
                        getCompositeProducts(collection);

                      if (compositeProducts.length === 0) {
                        return (
                          <BoxesIcon className="w-10 h-10 text-gray-400" />
                        );
                      }

                      if (compositeProducts.length === 1) {
                        return (
                          <img
                            src={compositeProducts[0].image}
                            alt={collection.title}
                            className="w-full h-full object-contain"
                          />
                        );
                      }

                      if (compositeProducts.length === 2) {
                        return (
                          <div className="w-full h-full grid grid-cols-2">
                            {compositeProducts.map((product, idx) => (
                              <div
                                key={idx}
                                className="relative overflow-hidden"
                              >
                                <img
                                  src={product.image}
                                  alt={product.title}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ))}
                          </div>
                        );
                      }

                      if (compositeProducts.length === 3) {
                        return (
                          <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                            <div className="row-span-2 overflow-hidden">
                              <img
                                src={compositeProducts[0].image}
                                alt={compositeProducts[0].title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="overflow-hidden">
                              <img
                                src={compositeProducts[1].image}
                                alt={compositeProducts[1].title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="overflow-hidden">
                              <img
                                src={compositeProducts[2].image}
                                alt={compositeProducts[2].title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                        );
                      }

                      // 4+ products - 2x2 grid
                      return (
                        <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                          {compositeProducts.slice(0, 4).map((product, idx) => (
                            <div key={idx} className="overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-base text-gray-900 line-clamp-1">
                        {collection.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {collection.products.length} products
                      </span>
                    </div>
                    {collection.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                        {collection.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCollection(collection)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit collection"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(collection._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete collection"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopPage;
