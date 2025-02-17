import { useAppStore } from "@/store";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { UPDATE_PROFILE_ROUTE } from "@/utils/constants";
import ProfileForm from "./ProfileForm";
import ProfileAvatar from "./ProfileAvatar";
function Profile() {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    color: 0,
    email: "",
    image: "",
  });
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();

  useEffect(() => {
    if (userInfo.profileSetup) {
      setUser({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        color: userInfo.color,
        image: userInfo.image,
      });
    } else {
      setUser({
        email: userInfo.email,
        color: userInfo.color,
      });
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!user.firstName) {
      toast.error("FirstName is required");
      return false;
    }
    if (!user.lastName) {
      toast.error("LastName is required");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const res = await apiClient.post(
          UPDATE_PROFILE_ROUTE,
          {
            firstName: user.firstName,
            lastName: user.lastName,
            colors: user.color,
          },
          { withCredentials: true }
        );
        if (res.status === 200 && res.data) {
          setUserInfo({ ...res.data });
          toast.success("Profile Updated Successfully");
          navigate("/chat");
        }
      } catch (error) {
        console.log({ error });
      }
    }
  };

  const handleNavigate = () => {
    if (userInfo.profileSetup) {
      navigate("/chat");
    } else {
      toast.error("Please setup Profile");
    }
  };

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div onClick={handleNavigate}>
          <IoArrowBack className="text-4xl lg:text-6xl text-white/90 cursor-pointer" />
        </div>
        <div className="grid grid-cols-2">
          <ProfileAvatar
            firstName={user.firstName || user.email}
            selectedColor={user.color}
          />
          <ProfileForm user={user} setUser={setUser} />
        </div>
        <div className="w-full">
          <Button
            className="h-16 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
            onClick={saveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
