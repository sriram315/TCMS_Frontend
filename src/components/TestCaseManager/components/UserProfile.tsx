import React, { useEffect, useState } from "react";
import { API_URL } from "../../../config";

const UserProfile: React.FC<UserProfileProps> = () => {
  const userData = JSON.parse(sessionStorage.getItem("user"));
  const [userDetails, setUserDetails] = useState(userData);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/users`);
        const data = await response.json();

        setUserDetails(data.data.users.filter((user) => user.name === userData.name)?.[0]);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-xl font-semibold mb-4">User Profile</h2>
      <div className="space-y-3">
        <ProfileField label="Name" value={userDetails.name} />
        <ProfileField label="Email" value={userDetails.email} />
        <ProfileField
          label="Role"
          value={String(userDetails.role).toLowerCase() === "admin" ? "Manager" : userDetails.role}
        />
        <ProfileField label="Job Title" value={userDetails.jobTitle} />
      </div>
    </div>
  );
};

type ProfileFieldProps = {
  label: string;
  value: string;
};

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value }) => (
  <div className="flex justify-between border-b py-2">
    <span className="font-medium">{label}:</span>
    <span>{value || "—"}</span>
  </div>
);

export default UserProfile;
