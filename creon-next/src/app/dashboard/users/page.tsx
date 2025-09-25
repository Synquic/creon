"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import {
  subUserService,
  type SubUser,
  type CreateSubUserRequest,
  type UpdateSubUserRequest,
} from "@/services/subUser";

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function UsersPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<SubUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    firstName: "",
    lastName: "",
    role: "admin",
  });
  const queryClient = useQueryClient();

  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sub-users"],
    queryFn: () => subUserService.getSubUsers(),
  });

  const createUserMutation = useMutation({
    mutationFn: (data: CreateSubUserRequest) =>
      subUserService.createSubUser(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["sub-users"] });
      toast.success("User created successfully!");
      setShowCreateForm(false);
      resetForm();

      // Show the temporary password
      toast.success(`Temporary password: ${response.data.tempPassword}`, {
        duration: 10000,
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create user";
      toast.error(errorMessage);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubUserRequest }) =>
      subUserService.updateSubUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-users"] });
      toast.success("User updated successfully!");
      setEditingUser(null);
      setShowCreateForm(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update user";
      toast.error(errorMessage);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => subUserService.deleteSubUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-users"] });
      toast.success("User deleted successfully!");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete user";
      toast.error(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => subUserService.resetPassword(id),
    onSuccess: (response) => {
      navigator.clipboard.writeText(
        `New Password: ${response.data.newPassword}`
      );
      toast.success(
        `Password reset successfully! New password: ${response.data.newPassword} \n (📋copied to clipboard)`,
        {
          duration: 10000,
        }
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reset password";
      toast.error(errorMessage);
    },
  });

  const users = usersData?.data?.users || [];

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      role: "admin",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      email: formData.email,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      role: formData.role,
    };

    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser._id,
        data: {
          firstName: submitData.firstName,
          lastName: submitData.lastName,
          role: submitData.role,
        },
      });
    } else {
      createUserMutation.mutate(submitData);
    }
  };

  const handleEdit = (user: SubUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role,
    });
    setShowCreateForm(true);
  };

  const handleDelete = (user: SubUser) => {
    if (confirm(`Are you sure you want to delete ${user.email}?`)) {
      deleteUserMutation.mutate(user._id);
    }
  };

  const handleResetPassword = (user: SubUser) => {
    if (confirm(`Are you sure you want to reset password for ${user.email}?`)) {
      resetPasswordMutation.mutate(user._id);
    }
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingUser(null);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Users
          </h3>
          <p className="text-gray-600">
            {(error as Error)?.message || "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600">
            Manage your team members and their access
          </p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Add User
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingUser ? "Edit User" : "Add New User"}
            </h3>
            <button
              onClick={cancelForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  createUserMutation.isPending || updateUserMutation.isPending
                }
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {createUserMutation.isPending || updateUserMutation.isPending
                  ? "Saving..."
                  : editingUser
                  ? "Update User"
                  : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      {users.length === 0 ? (
        <div className="text-center py-12">
          <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No team members
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first team member.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Team Members ({users.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div
                key={user._id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-green-100 text-green-800"
                            : user.role === "manager"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Edit user"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleResetPassword(user)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Reset password"
                    disabled={resetPasswordMutation.isPending}
                  >
                    <KeyIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(user)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Delete user"
                    disabled={deleteUserMutation.isPending}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
