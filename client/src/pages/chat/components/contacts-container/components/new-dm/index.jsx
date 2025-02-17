import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Lottie from "react-lottie";
import { animationDefaultOption, getColor } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { HOST, SEARCH_CONTACTS_ROUTES } from "@/utils/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store";

const NewDM = () => {
  const { setSelectedChatData, setSelectedChatType } = useAppStore();
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);

  const selectNewContact = (contact) => {
    setOpenNewContactModal(false);
    setSearchedContacts([]);
    setSelectedChatData(contact);
    setSelectedChatType("contact");
  };

  const searchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length > 0) {
        const res = await apiClient.post(
          SEARCH_CONTACTS_ROUTES,
          { searchTerm },
          { withCredentials: true }
        );
        if (res.status === 200 && res.data.contact) {
          setSearchedContacts(res.data.contact);
        }
      } else {
        setSearchedContacts([]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <FaPlus
        onClick={(e) => setOpenNewContactModal(true)}
        className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
      />
      <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Please select a contact</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              onChange={(e) => searchContacts(e.target.value)}
              placeholder="Search Contacts"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
            />
          </div>
          <ScrollArea className="h-[250px]">
            <div className="flex flex-col gap-5">
              {searchedContacts.map((contact) => (
                <div
                  onClick={() => selectNewContact(contact)}
                  key={contact._id}
                  className="flex gap-3 items-center cursor-pointer"
                >
                  <div className="w-12 h-12 relative">
                    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                      {contact.image ? (
                        <AvatarImage
                          src={contact.image}
                          alt="Profile"
                          className="object-cover w-full h-full bg-black"
                        />
                      ) : (
                        <div
                          className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                            contact.color
                          )}
                   `}
                        >
                          {contact.firstName
                            ? contact.firstName.split("").shift()
                            : contact.email.split("").shift()}
                        </div>
                      )}
                    </Avatar>
                  </div>
                  <div className="flex flex-col">
                    <span>
                      {contact.firstName && contact.lastName
                        ? `${contact.firstName} ${contact.lastName}`
                        : contact.email}
                    </span>
                    <span className="text-xs">{contact.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          {searchedContacts.length <= 0 && (
            <div className=" md:bg-[#181920] md:flex flex-col m-auto justify-center items-center hidden transition-all  duration-1000">
              <Lottie
                isClickToPauseDisabled={true}
                height={200}
                width={200}
                options={animationDefaultOption}
              />
              {/* <div className="text-opactity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center ">
                <h3 className="poppins-medium">
                  Hi <span className="text-purple-500">!</span> Welcome to{" "}
                  <span className="text-purple-500"> Syncrous </span> Chat App.
                </h3>
              </div> */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDM;
