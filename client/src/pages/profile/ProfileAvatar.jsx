import React, { useRef, useState, useEffect } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { FaTrash, FaPlus } from "react-icons/fa";
import {
  ADD_PROFILE_IMAGE_ROUTE,
  REMOVE_PROFILE_IMAGE_ROUTE,
} from "@/utils/constants";
import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { toast } from "sonner";

function ProfileAvatar({ firstName = "", selectedColor }) {
  const { setUserInfo, userInfo } = useAppStore();
  const fileInputRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [image, setImage] = useState(null);
  console.log(userInfo);

  // Sync image state with userInfo.image
  useEffect(() => {
    if (userInfo.image) {
      setImage(userInfo.image);
    }
  }, [userInfo.image]);

  const handleFileInput = () => {
    fileInputRef.current.click();
  };

  const handleDeleteImage = async () => {
    try {
      const res = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setUserInfo({ ...userInfo, image: null });
        setImage(null);
        toast.success("Image Removed Successfully");
      }
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profile-image", file);
      try {
        const res = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE, formData, {
          withCredentials: true,
        });
        if (res.status === 200 && res.data.image) {
          setUserInfo({ ...userInfo, image: res.data.image });
          setImage(res.data.image);
          toast.success("Image Updated Successfully");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image");
      }
    }
  };

  return (
    <div
      className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
        {image ? (
          <AvatarImage
            src={image}
            alt="Profile"
            className="object-cover w-full h-full bg-black"
          />
        ) : (
          <div
            className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(
              selectedColor
            )}`}
          >
            {firstName?.charAt(0) ?? "?"}
          </div>
        )}
      </Avatar>
      {hovered && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full"
          onClick={image ? handleDeleteImage : handleFileInput}
        >
          {image ? (
            <FaTrash className="text-white text-3xl cursor-pointer" />
          ) : (
            <FaPlus className="text-white text-3xl cursor-pointer" />
          )}
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImageChange}
        name="profile-image"
        accept=".png, .jpg, .jpeg, .svg, .webp"
      />
    </div>
  );
}

export default ProfileAvatar;
