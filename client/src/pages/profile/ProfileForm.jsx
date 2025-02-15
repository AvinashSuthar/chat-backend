import React from 'react'
import { Input } from "@/components/ui/input";
import { colors } from "@/lib/utils"

function ProfileForm({user, setUser}) {

      const handleChange = (target) => (e) => {
        setUser((prev) => ({
          ...prev,
          [target]: e.target.value,
        }));
      };

      const handelcolor = (index) => {
        setUser((prev)=> ({
            ...prev, color: index
        }))
      } 
      

  return (
    <>
    <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
            <div className="w-full">
              <Input
                placeholder="Email"
                type="email"
                readOnly
                value={user.email}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              ></Input>
            </div>
            <div className="w-full">
              <Input
                placeholder="Firstname"
                type="text"
                onChange={handleChange("firstName")}
                value={user.firstName}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="Lastname"
                type="text"
                onChange={handleChange("lastName")}
                value={user.lastName}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="flex w-full gap-5">
              {colors.map((color, index) => (
                <div
                  className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${
                    user.color === index
                      ? "outline outline-white outline-1"
                      : ""
                  }`}
                  key={index}
                  onClick={() => handelcolor(index)}
                ></div>
              ))}
            </div>
          </div>
    </>
  )
}

export default ProfileForm