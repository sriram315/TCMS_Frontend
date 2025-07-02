import React, { useCallback, useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import { User, Users, Shield, Save, Check, Edit, X, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AddUserModal from "../components/AddUserModal";
import { toast, ToastContainer } from "react-toastify";
import { API_URL } from "../config";

// Validation schema for the profile form
const ProfileSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  jobTitle: Yup.string(),
  timezone: Yup.string(),
  language: Yup.string(),
});

const Settings: React.FC = () => {
  const { user, setUser } = useAuth();
  // Use localStorage to persist the active tab
  const [activeTab, setActiveTab] = useState(() => {
    // Get saved tab from localStorage or default to "profile"
    return localStorage.getItem("settingsActiveTab") || "profile";
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [users, setUsers] = useState<any>([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editedUserData, setEditedUserData] = useState<{
    role: string;
    team: string;
  }>({ role: "", team: "" });
  const loggedInUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  const { user: currentUser } = useAuth();

  // Update localStorage when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem("settingsActiveTab", tab);
  };

  // Clear the stored tab state when component unmounts
  useEffect(() => {
    return () => {
      // This cleanup function runs when the component unmounts
      localStorage.removeItem("settingsActiveTab");
    };
  }, []);
  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users`);
      const filteredUsers =
        currentUser?.role?.toLowerCase() === "superadmin"
          ? data.data.users
          : currentUser?.role?.toLowerCase() === "admin"
          ? data.data.users.filter(
              (user: { accountCreatedBy: { _id: any } }) => user?.accountCreatedBy?._id === currentUser?._id
            )
          : data.data.users;
      // Update the state with the fetched users, excluding the superadmin ro
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [API_URL, currentUser]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form submission for profile
  const handleSubmit = useCallback(
    async (values: any, { setSubmitting }: any) => {
      try {
        if (!user) {
          toast.error("User not found. Please log in again.");
          setSubmitting(false);
          return;
        }
        const response = await axios.put(`${API_URL}/users/${user._id}`, values);

        if (response.status === 200) {
          setUser(response.data.updatedUser);
          sessionStorage.setItem("user", JSON.stringify(response.data.updatedUser));
        }

        if (response.status === 200) {
          toast.success("Profile updated successfully", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
          });
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error: any) {
        console.error("Error updating profile:", error);
        toast.error(error.response?.data?.message || "Failed to update profile. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [API_URL, user?._id]
  );

  const handleAddUser = async (userData: any) => {
    let finalData = userData;
    if (String(loggedInUser.role).toLowerCase() == "superadmin") {
      finalData = { ...finalData, isApproved: true };
    }
    try {
      const response = await axios.post(`${API_URL}/auth/register`, finalData);

      if (response.status === 201) {
        fetchUsers();
        setIsAddUserModalOpen(false);
        toast.success("User added successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error(error.response?.data?.message || "Failed to add user. Please try again.");
    }
  };

  // Handle edit button click
  const handleEditClick = (user: any) => {
    setEditingUserId(user._id);
    setEditedUserData({ role: user.role, team: user.team });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditedUserData({ role: "", team: "" });
  };

  // Handle save edit
  const handleSaveEdit = async (userId: any) => {
    try {
      // Prepare data with N/A for empty team
      const dataToUpdate = {
        ...editedUserData,
        team: editedUserData.team.trim() === "" ? "N/A" : editedUserData.team,
      };

      const response = await axios.put(`${API_URL}/users/${userId}`, dataToUpdate);

      if (response.status === 200) {
        toast.success("User updated successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
        fetchUsers();
        setEditingUserId(null);
        setEditedUserData({ role: "", team: "" });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  // Available roles for dropdown
  let roles = ["Admin", "Tester", "Developer"];
  String(loggedInUser.role).toLowerCase() == "admin" && roles.shift();

  const handleUpdateUser = async (userId: any) => {
    const response = await axios.put(`${API_URL}/users/${userId}`, { isApproved: true });

    if (response.status === 200) {
      fetchUsers();
      toast.success("User approved successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
    }
  };

  const handleDeleteUser = async (userId: any) => {
    const response = await axios.delete(`${API_URL}/users/${userId}`);

    if (response.status === 200) {
      fetchUsers();
      toast.success("User deleted successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and application settings" />

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="sm:flex sm:items-start">
          <div className="w-64">
            <nav className="px-4 py-5 space-y-1">
              <button
                onClick={() => handleTabChange("profile")}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                  activeTab === "profile"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <User className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => handleTabChange("users")}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                  activeTab === "users"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>Users & Teams</span>
              </button>
              <button
                onClick={() => handleTabChange("roles")}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                  activeTab === "roles"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Shield className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>Roles & Permissions</span>
              </button>
            </nav>
          </div>

          <div className="p-6 border-l flex-1">
            {activeTab === "profile" && (
              <div>
                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-6">Profile Settings</h3>

                <Formik
                  initialValues={{
                    name: user?.name || "",
                    email: user?.email || "",
                    jobTitle: user?.jobTitle || "",
                    timezone: user?.timezone || "Eastern Time (US & Canada)",
                    language: user?.language || "English",
                  }}
                  validationSchema={ProfileSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-6">
                      <div>
                        <label htmlFor="name" className="label">
                          Name
                        </label>
                        <Field type="text" id="name" name="name" className="input" />
                        <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label htmlFor="email" className="label">
                          Email Address
                        </label>
                        <Field disabled type="email" id="email" name="email" className="input" />
                        <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label htmlFor="jobTitle" className="label">
                          Job Title
                        </label>
                        <Field type="text" id="jobTitle" name="jobTitle" className="input" />
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2"></div>

                      <div className="mt-6 flex justify-end">
                        {saveSuccess && (
                          <div className="mr-4 flex items-center text-success-600">
                            <Check className="h-5 w-5 mr-1" />
                            <span>Changes saved</span>
                          </div>
                        )}

                        <button type="submit" className="btn btn-primary bg-indigo-900" disabled={isSubmitting}>
                          <Save className="h-4 w-4 mr-2" />
                          {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            )}

            {activeTab === "users" && (
              <div>
                <h3 className="text-lg font-semibold leading-6 text-gray-900">Users & Teams</h3>
                <p className="text-gray-500 my-4">Manage users and team access to your projects.</p>
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Email
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Role
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Team
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Approval Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {users
                        ?.filter((user: { role: any }) => {
                          const isNotSuperAdmin = String(user.role).toLowerCase() !== "superadmin";
                          const isAllowedForAdmin =
                            String(loggedInUser.role).toLowerCase() === "admin"
                              ? String(user.role).toLowerCase() !== "admin"
                              : true;
                          return isNotSuperAdmin && isAllowedForAdmin;
                        })
                        .map((user: any) => (
                          <tr key={user._id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                              {user.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {String(user?.role).toLowerCase() === "admin" ? "Manager" : user?.role}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {user.team ? user.team : "N/A"}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {user.isApproved ? (
                                "Approved"
                              ) : String(loggedInUser?.role).toLowerCase() === "superadmin" ? (
                                <div className="flex items-center space-x-4">
                                  <CheckCircle
                                    className="h-5 w-5 cursor-pointer"
                                    onClick={() => handleUpdateUser(user._id)}
                                  />{" "}
                                  <XCircle
                                    className="h-5 w-5 cursor-pointer"
                                    onClick={() => handleDeleteUser(user._id)}
                                  />
                                </div>
                              ) : (
                                "Pending"
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="btn btn-primary bg-indigo-900"
                    onClick={() => setIsAddUserModalOpen(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Add User
                  </button>
                </div>
              </div>
            )}

            {activeTab === "roles" && (
              <div>
                <h3 className="text-lg font-semibold leading-6 text-gray-900">Roles & Permissions</h3>
                <p className="text-gray-500 my-4">Manage roles and permissions of users.</p>

                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Email
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Role
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Team
                        </th>

                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {users
                        ?.filter((user: { role: any }) => {
                          const isNotSuperAdmin = String(user.role).toLowerCase() !== "superadmin";
                          const isAllowedForAdmin =
                            String(loggedInUser.role).toLowerCase() === "admin"
                              ? String(user.role).toLowerCase() !== "admin"
                              : true;
                          return isNotSuperAdmin && isAllowedForAdmin;
                        })
                        .map((user: any) => (
                          <tr key={user._id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                              {user.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {editingUserId === user._id ? (
                                <select
                                  value={editedUserData.role}
                                  onChange={(e) =>
                                    setEditedUserData({
                                      ...editedUserData,
                                      role: e.target.value,
                                    })
                                  }
                                  className="input w-full"
                                >
                                  {roles.map((role) => (
                                    <option key={role} value={role}>
                                      {String(role).toLowerCase() === "admin" ? "Manager" : role}
                                    </option>
                                  ))}
                                </select>
                              ) : String(user.role).toLowerCase() === "admin" ? (
                                "Manager"
                              ) : (
                                user.role
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {editingUserId === user._id ? (
                                <input
                                  type="text"
                                  value={editedUserData.team}
                                  onChange={(e) =>
                                    setEditedUserData({
                                      ...editedUserData,
                                      team: e.target.value,
                                    })
                                  }
                                  className="input w-full"
                                />
                              ) : (
                                user.team
                              )}
                            </td>

                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              {editingUserId === user._id ? (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleSaveEdit(user._id)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <Check className="h-5 w-5" />
                                    <span className="sr-only">Save</span>
                                  </button>
                                  <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-900">
                                    <X className="h-5 w-5" />
                                    <span className="sr-only">Cancel</span>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleEditClick(user)}
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  <Edit className="h-5 w-5" />

                                  <span className="sr-only">Edit</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AddUserModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} onSubmit={handleAddUser} />
      <ToastContainer />
    </div>
  );
};

export default Settings;
