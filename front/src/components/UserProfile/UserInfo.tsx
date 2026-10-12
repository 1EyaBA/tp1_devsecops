import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import StarRating from "./StarRating";
import { User } from "../../types";
import Input from "../form/input/InputField";
import { useEffect, useState } from "react";
import { getCurrentUser, getCurrentUserId } from "../../services/authService.ts";
import { useNavigate } from "react-router-dom";

interface UserMetaCardProps {
  user: User | null;
  rating: number | null;
}

export function UserInfo({ user, rating }: UserMetaCardProps) {
  const reportModal = useModal();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getCurrentUserId();
      console.log("Current User ID:", id);
      setCurrentUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getCurrentUser().then((user) => user.role);
      console.log("Current User Role:", role);
      setCurrentUserRole(role);
    };
    fetchUserRole();
  }, []);

  const handleReportUser = async (userId: number) => {
    console.log(userId);

    if (userId === currentUserId) {
      alert("You can not report yourself !! ");
      return;
    }

    navigate("/report", { state: { reportedUserId: userId } });
  };

  return (
      <>
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                <img
                    src={user?.imageUrl}
                    alt="User profile"
                    width={100}
                    height={100}
                />
              </div>
              <div className="order-3 xl:order-2">
                <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                  {user?.name} {user?.lastName}
                </h4>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 xl:justify-start">
                  <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                    {rating == null ? (
                        <p className="text-gray-500 text-sm">No reviews yet</p>
                    ) : (
                        <StarRating rating={rating} />
                    )}
                  </div>
                  <div style={{ borderLeft: "1px solid ", height: "20px" }}></div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {currentUserRole !== "admin" && (
                <button
                    onClick={() => handleReportUser(user?.id || 0)}
                    className="dark:bg-error-500 dark:text-white bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500
              flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-theme-xs dark:border-gray-700 lg:inline-flex lg:w-auto"
                >
                  Report
                </button>
            )}
          </div>
        </div>

        <Modal
            isOpen={reportModal.isOpen}
            onClose={reportModal.closeModal}
            className="max-w-[700px] m-4"
        >
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Edit Personal Information
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Update your details to keep your profile up-to-date.
              </p>
            </div>
            <form className="flex flex-col">
              <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                <div>
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Social Links
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Facebook</Label>
                      <Input type="text" value="https://www.facebook.com/PimjoHQ" />
                    </div>

                    <div>
                      <Label>X.com</Label>
                      <Input type="text" value="https://x.com/PimjoHQ" />
                    </div>

                    <div>
                      <Label>Linkedin</Label>
                      <Input
                          type="text"
                          value="https://www.linkedin.com/company/pimjo"
                      />
                    </div>

                    <div>
                      <Label>Instagram</Label>
                      <Input type="text" value="https://instagram.com/PimjoHQ" />
                    </div>
                  </div>
                </div>
                <div className="mt-7">
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Personal Information
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="col-span-2 lg:col-span-1">
                      <Label>First Name</Label>
                      <Input type="text" value="Musharof" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Last Name</Label>
                      <Input type="text" value="Chowdhury" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Email Address</Label>
                      <Input type="text" value="randomuser@pimjo.com" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Phone</Label>
                      <Input type="text" value="+09 363 398 46" />
                    </div>

                    <div className="col-span-2">
                      <Label>Bio</Label>
                      <Input type="text" value="Team Manager" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={reportModal.closeModal}>
                  Close
                </Button>
                <Button size="sm" onClick={reportModal.closeModal}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </>
  );
}

export default UserInfo;
