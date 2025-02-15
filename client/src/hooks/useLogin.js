import { useAppStore } from "@/store";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const useLogin = () => {
    const navigate = useNavigate();
    const { setUserInfo } = useAppStore();
    const [loading, setLoading] = useState(false);

    const login = async (formData) => {
        setLoading(true);
        const { email, password } = formData;

        try {
            const res = await fetch(import.meta.env.VITE_SERVER_URL + "/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Login failed");
            }

            toast.success("Login successful! 🎉");
            localStorage.setItem("user", JSON.stringify(data.user));
            setUserInfo(data.user)

            if (data.user.profileSetup) navigate("/chat");
            else navigate("/profile");


        } catch (err) {
            toast.error(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return { login, loading };
};

export default useLogin;
