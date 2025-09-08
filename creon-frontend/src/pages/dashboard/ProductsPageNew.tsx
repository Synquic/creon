import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  ShoppingBagIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import * as simpleApi from "../../services/api-simple";
import { apiService } from "../../services/api";

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
  collectionId?: string;
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
  shortCode: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val || val === "") return true;
        return (
          val.length >= 4 && val.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(val)
        );
      },
      {
        message:
          "Short code must be 4-20 characters and contain only letters, numbers, hyphens, and underscores",
      }
    ),
  tags: z.array(z.string()).optional(),
  image: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductsPageNew: React.FC = () => {
  // All hooks must be at the top level, not inside any conditionals or functions
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [parsing, setParsing] = useState(false);
  const [pendingParsedData, setPendingParsedData] = useState<any>(null);

  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => simpleApi.getProducts(),
  });

  const createProductMutation = useMutation({
    mutationFn: simpleApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully!");
      setShowCreateForm(false);
      setCurrentImage(null);
      reset();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create product";
      toast.error(errorMessage);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      simpleApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully!");
      setEditingProduct(null);
      setShowCreateForm(false);
      setCurrentImage(null);
      reset();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update product";
      toast.error(errorMessage);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: simpleApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to delete product");
    },
  });

  const toggleProductMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      simpleApi.updateProduct(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error("Failed to toggle product status");
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: simpleApi.uploadImage,
    onSuccess: (response) => {
      const imageUrl = response.data.data.url;
      setCurrentImage(imageUrl);
      setValue("image", imageUrl);
      toast.success("Image uploaded successfully!");
      setUploadingImage(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to upload image");
      setUploadingImage(false);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      currency: "USD",
      tags: [],
    },
  });

  // At the top, after all hooks:
  React.useEffect(() => {
    if (showCreateForm && pendingParsedData) {
      // Wait for the form to mount with a longer delay to ensure form fields are fully mounted
      setTimeout(() => {
        console.log("[DEBUG] Hydrating form with:", pendingParsedData);

        try {
          // Set values with validation and mark as dirty
          setValue("title", pendingParsedData.productTitle || "", {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValue("description", pendingParsedData.productDescription || "", {
            shouldValidate: true,
            shouldDirty: true,
          });

          // Handle price - convert string to number if needed
          const priceValue =
            typeof pendingParsedData.price === "number"
              ? pendingParsedData.price
              : Number(
                  pendingParsedData.price?.toString().replace(/[^\d.]/g, "")
                ) || 0;

          setValue("price", priceValue, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValue("currency", pendingParsedData.currency || "USD", {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValue("affiliateUrl", url, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValue("shortCode", pendingParsedData.productCode || "", {
            shouldValidate: true,
            shouldDirty: true,
          });

          // Set image if available
          if (pendingParsedData.productImage) {
            setValue("image", pendingParsedData.productImage, {
              shouldValidate: true,
              shouldDirty: true,
            });
            setCurrentImage(pendingParsedData.productImage);
          }

          // Debug: log form values after hydration
          setTimeout(() => {
            console.log("[DEBUG] Form values after hydration:", getValues());
          }, 200);

          // Add success toast notification
          toast.success("Product data loaded successfully!");
        } catch (error) {
          console.error("[ERROR] Form hydration failed:", error);
          toast.error("Failed to populate form with product data");
        }

        // Clear pending data after processing
        setPendingParsedData(null);
      }, 300); // Increased timeout to ensure form is fully mounted
    }
  }, [showCreateForm, pendingParsedData, setValue, url, getValues]);

  const products: Product[] = productsData?.data?.data?.products || [];
  // Watch form fields for dynamic validation if needed

  const onSubmit = async (data: ProductFormData) => {
    const cleanData = {
      title: data.title,
      description:
        data.description && data.description.trim() !== ""
          ? data.description
          : undefined,
      price: Number(data.price),
      currency: data.currency,
      affiliateUrl: data.affiliateUrl,
      shortCode:
        data.shortCode && data.shortCode.trim() !== ""
          ? data.shortCode
          : undefined,
      tags: data.tags || [],
      image: currentImage || data.image,
    };

    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct._id,
          data: cleanData,
        });
      } else {
        await createProductMutation.mutateAsync(cleanData);
      }
    } catch {
      // Error handled in mutation
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setValue("title", product.title);
    setValue("description", product.description || "");
    setValue("price", product.price);
    setValue("currency", product.currency);
    setValue("affiliateUrl", product.affiliateUrl);
    setValue("shortCode", product.shortCode);
    setValue("tags", product.tags);
    setValue("image", product.image || "");
    setCurrentImage(product.image || null);
    setShowCreateForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProductMutation.mutateAsync(productId);
    }
  };

  const handleToggleActive = async (product: Product) => {
    await toggleProductMutation.mutateAsync({
      id: product._id,
      isActive: !product.isActive,
    });
  };

  const handleCopyLink = (product: Product) => {
    const fullUrl = `${window.location.origin}/p/${product.shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(product._id);
    toast.success("Product link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    uploadImageMutation.mutate(file);
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingProduct(null);
    setCurrentImage(null);
    reset();
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Products
            </h3>
            <p className="text-gray-600">
              {(error as Error)?.message || "Something went wrong"}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Handler for parsing URL
  const handleParseUrl = async () => {
    if (!url) return;

    try {
      setParsing(true);

      // If the form is already showing, reset it before fetching new data
      if (showCreateForm) {
        reset({
          title: "",
          description: "",
          price: 0,
          currency: "USD",
          affiliateUrl: url,
          shortCode: "",
          image: "",
          tags: [],
        });
        setCurrentImage(null);
      }

      // Clear any pending data
      setPendingParsedData(null);

      // Make API call
      const parsed = await apiService.fetchParsedData(url);
      console.log("[DEBUG] API parsed response:", parsed);

      if (parsed?.data?.data) {
        // Store the parsed data
        setPendingParsedData(parsed.data.data);

        // Show the form if not already visible
        if (!showCreateForm) setShowCreateForm(true);

        toast.success("URL parsed successfully, filling form data...");
      } else {
        toast.error("Could not parse product data from the URL.");
      }
    } catch (error) {
      console.error("[ERROR] Failed to parse URL:", error);
      const errorMessage = "Unable to parse product data from the URL.";
      toast.success(errorMessage);
    } finally {
      setParsing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">
            Manage your products and affiliate links
          </p>
        </div>

        {/* Add Product Button */}
        {!showCreateForm && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowCreateForm(true)}
            className="w-full mb-6 p-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center space-x-3 hover:bg-gray-50"
          >
            <PlusIcon className="w-6 h-6" />
            <span className="text-lg font-medium">Add Product</span>
          </motion.button>
        )}

        {/* Create/Edit Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <button
                  onClick={cancelForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* URL Paste Option */}
              {!editingProduct && (
                <div className="flex items-center gap-2 mb-6">
                  <input
                    type="text"
                    className="border rounded px-3 py-2 flex-1"
                    placeholder="Paste product URL to parse..."
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
                      "Parse URL"
                    )}
                  </Button>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Product Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Product Image
                  </label>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                        {currentImage ? (
                          <img
                            src={currentImage}
                            alt="Product preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700 transition-colors">
                        {uploadingImage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <CameraIcon className="w-4 h-4" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">
                        Upload a high-quality image of your product (max 5MB)
                      </p>
                      <p className="text-xs text-gray-500">
                        Recommended: 500x500px or larger, JPG/PNG format
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    {...register("title")}
                    label="Product Title"
                    placeholder="Amazing Product"
                    error={errors.title?.message}
                  />

                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <Input
                        {...register("price", { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        label="Price"
                        placeholder="29.99"
                        error={errors.price?.message}
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        {...register("currency")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="USD">USD</option>
                        <option value="INR">INR</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                        <option value="AUD">AUD</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Input
                  {...register("affiliateUrl")}
                  label="Affiliate URL"
                  placeholder="https://example.com/product"
                  error={errors.affiliateUrl?.message}
                />

                <Input
                  {...register("shortCode")}
                  label="Custom Short Code (Optional)"
                  placeholder="amazing-product"
                  error={errors.shortCode?.message}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe your amazing product..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="flex-1"
                  >
                    {editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelForm}
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
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-700"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <ShoppingBagIcon className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No products yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start showcasing your products to your audience. Add affiliate
              links, pricing, and descriptions to boost your sales.
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              leftIcon={<PlusIcon className="w-5 h-5" />}
              size="lg"
            >
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Product Image */}
                <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                      {product.title}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg font-bold text-primary-600">
                        {product.currency} {product.price}
                      </span>
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center space-x-1">
                      <ChartBarIcon className="w-4 h-4" />
                      <span>{product.clickCount} clicks</span>
                    </span>
                    <span className="font-mono">/{product.shortCode}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyLink(product)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Copy link"
                      >
                        {copiedId === product._id ? (
                          <CheckIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          window.open(
                            `/dashboard/analytics/product/${product._id}`,
                            "_blank"
                          )
                        }
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View analytics"
                      >
                        <ChartBarIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        product.isActive ? "bg-primary-600" : "bg-gray-200"
                      }`}
                      title={
                        product.isActive
                          ? "Deactivate product"
                          : "Activate product"
                      }
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          product.isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProductsPageNew;
