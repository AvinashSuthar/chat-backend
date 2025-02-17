import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import React from "react";
import { CiMenuKebab } from "react-icons/ci";
import { FaEdit } from "react-icons/fa";
import { FiEdit, FiEdit2, FiEdit3 } from "react-icons/fi";
import { RiCloseFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
const ChatHeader = () => {
  const navigate = useNavigate();
  const { closeChat, selectedChatData, selectedChatType } = useAppStore();
  const editChannel = () => {
    navigate("/channel/edit");
  };
  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
      <div className="flex gap-5 items-center w-full justify-between">
        <div className="flex gap-3 items-center justify-center">
          <div className="w-12 h-12 relative">
            {selectedChatType === "contact" ? (
              <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                {selectedChatData.image ? (
                  <AvatarImage
                    src={selectedChatData.image}
                    alt="Profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                      selectedChatData.color
                    )}
                   `}
                  >
                    {selectedChatData.firstName
                      ? selectedChatData.firstName.split("").shift()
                      : selectedChatData.email.split("").shift()}
                  </div>
                )}
              </Avatar>
            ) : selectedChatData.channelImage ? (
              <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                <AvatarImage
                  src={selectedChatData.channelImage}
                  alt="Profile"
                  className="object-cover w-full h-full bg-black"
                />
              </Avatar>
            ) : (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}
          </div>
          <div>
            {selectedChatType === "channel" && selectedChatData.name}
            {selectedChatType === "contact" && selectedChatData.firstName
              ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
              : selectedChatData.email}
          </div>
        </div>
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={closeChat}
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white hover:text-white duration-300 transition-all"
          >
            <RiCloseFill className="text-4xl" />
          </button>
          {selectedChatType === "channel" && (
            <button
              onClick={editChannel}
              className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
            >
              <CiMenuKebab className="text-3xl size-6 hover:text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
