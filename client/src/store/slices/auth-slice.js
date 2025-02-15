export const createAuthSlice = (set)=>(
    {
        userInfo : JSON.parse(localStorage.getItem("user"))||undefined,
        setUserInfo: (userInfo)=> set({userInfo})
    }
)