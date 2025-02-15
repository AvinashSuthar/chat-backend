import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppStore } from "@/store";

const useSignup = () => {
    const navigate = useNavigate();
    const { setUserInfo } = useAppStore();
    const [loading, setLoading] = useState(false);

    const signup = async (formData) => {
        setLoading(true);

        const { email, password, confirmPassword } = formData;

        try {
            const res = await fetch(import.meta.env.VITE_SERVER_URL + "/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password, confirmPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Signup failed");
            }

            toast.success("Signup successful! 🎉");
            localStorage.setItem("user", JSON.stringify(data.user));
            setUserInfo(data.user);

            navigate("/profile")
        } catch (err) {
            toast.error(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return { signup, loading };
};

export default useSignup;
