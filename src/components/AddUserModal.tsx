import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { X, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Validation schema for the add user form
const AddUserSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  role: Yup.string().required("Role is required"),
  team: Yup.string(),
  jobTitle: Yup.string(),
  timeZone: Yup.string(),
  language: Yup.string(),
});

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const role = JSON.stringify(sessionStorage.getItem("user"))?.role || "";
  if (!isOpen) return null;
  const { user } = useAuth();
  // if (!user || user.role !== "Admin") return null; // Only allow admins to add use
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Add User</h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-4">
            <Formik
              initialValues={{
                name: "",
                email: "",
                role: "",
                team: "",
                jobTitle: "",
                accountCreatedBy: user?._id,
                timeZone: "Eastern Time (US & Canada)",
                language: "English",
              }}
              validationSchema={AddUserSchema}
              onSubmit={(values, { setSubmitting }) => {
                onSubmit(values);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="label">
                      Name
                    </label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      className="input"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="label">
                      Email Address
                    </label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className="input"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="label">
                      Role
                    </label>
                    <Field as="select" id="role" name="role" className="input">
                      <option value="">Select Role</option>

                      {user?.role.toLowerCase() === "superadmin" && (
                        <option value="Admin">Manager</option>
                      )}
                      <option value="Tester">Tester</option>
                      <option value="Developer">Developer</option>
                    </Field>
                    <ErrorMessage
                      name="role"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="team" className="label">
                      Team
                    </label>
                    <Field
                      type="text"
                      id="team"
                      name="team"
                      className="input"
                    />
                  </div>

                  <div>
                    <label htmlFor="jobTitle" className="label">
                      Job Title
                    </label>
                    <Field
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      className="input"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* <div>
                      <label htmlFor="timezone" className="label">
                        Timezone
                      </label>
                      <Field
                        as="select"
                        id="timeZone"
                        name="timeZone"
                        className="input"
                      >
                        <option>Eastern Time (US & Canada)</option>
                        <option>Central Time (US & Canada)</option>
                        <option>Pacific Time (US & Canada)</option>
                        <option>UTC</option>
                      </Field>
                    </div> */}
                    {/* <div>
                      <label htmlFor="language" className="label">
                        Language
                      </label>
                      <Field
                        as="select"
                        id="language"
                        name="language"
                        className="input"
                      >
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </Field>
                    </div> */}
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-900 text-base font-medium text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                      disabled={isSubmitting}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Adding..." : "Add User"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
