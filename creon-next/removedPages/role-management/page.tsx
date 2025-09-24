/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  TrashIcon,
  PencilIcon,
  UserIcon,
  ChartBarIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/button";
import { roleService } from "@/services/roles";
import toast from "react-hot-toast";

interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "manager";
  isEmailVerified: boolean;
  createdAt: string;
  profileImage?: string;
}

const RoleManagementPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", "all"],
    queryFn: () => roleService.getAllUsers(),
    enabled: user?.role === "admin",
  });

  const { data: roleStatsData } = useQuery({
    queryKey: ["roleStats"],
    queryFn: () => roleService.getRoleStats(),
    enabled: user?.role === "admin",
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      roleService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["roleStats"] });
      toast.success("User role updated successfully!");
      setEditingUser(null);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Failed to update user role"
      );
      console.error("Role update error:", error);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => roleService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["roleStats"] });
      toast.success("User deleted successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
      console.error("User deletion error:", error);
    },
  });

  const users = usersData?.data?.data?.users || [];
  const roleStats = roleStatsData?.data?.data?.roleStats || [];

  const roleLabels = {
    admin: "Admin",
    manager: "Manager",
  };

  const roleColors = {
    admin: "bg-green-100 text-green-800 border-green-200",
    manager: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteUser = (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      deleteUserMutation.mutate(userId);
    }
  };

  const filteredUsers =
    selectedRole === "all"
      ? users
      : users.filter((u: User) => u.role === selectedRole);

  // Only admin can access this page
  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          Access Denied
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {"You don't have permission to access role management."}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Role Management
        </h1>
        <p className="text-gray-600">Manage user roles and permissions</p>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {roleStats.map((stat: { _id: string; count: number }) => (
          <div
            key={stat._id}
            className="bg-white rounded-lg shadow-sm border p-4"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {roleLabels[stat._id as keyof typeof roleLabels] || stat._id}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((userData: User) => (
                <motion.tr
                  key={userData._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {userData.profileImage ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={userData.profileImage}
                            alt={userData.username}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {userData.firstName || userData.lastName
                            ? `${userData.firstName || ""} ${
                                userData.lastName || ""
                              }`.trim()
                            : userData.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {userData.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                        roleColors[userData.role] ||
                        "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      {roleLabels[userData.role] || userData.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userData.isEmailVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {userData.isEmailVerified ? "Verified" : "Unverified"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {user?.role === "admin" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(userData)}
                        >
                          <PencilIcon className="w-4 h-4" />
                          Edit Role
                        </Button>
                      ) : null}
                      {user?.role === "admin" &&
                      userData._id !== user.id ? (
                        <Button
                          variant="outline"
                          size="sm"
                        
                          onClick={() => handleDeleteUser(userData._id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Role for {editingUser.username}
              </h3>
              <div className="space-y-4">
                {Object.entries(roleLabels).map(([roleValue, roleLabel]) => (
                  <label key={roleValue} className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value={roleValue}
                      checked={editingUser.role === roleValue}
                      onChange={() =>
                        setEditingUser({
                          ...editingUser,
                          role: roleValue as User["role"],
                        })
                      }
                      className="mr-3"
                      disabled={editingUser._id === user?.id}
                    />
                    <span
                      className={`${
                        editingUser._id === user?.id
                          ? "text-gray-400"
                          : "text-gray-700"
                      }`}
                    >
                      {roleLabel}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleRoleChange(editingUser._id, editingUser.role)
                  }
                  disabled={updateRoleMutation.isPending}
                >
                  Update Role
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagementPage;
