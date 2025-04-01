import { useEffect } from "react";
import { useAuth } from "@trimble-oss/trimble-id-react";
import { useNavigate } from "react-router-dom";

const CallbackPage = () => {
    const { isAuthenticated, isLoading, loginWithRedirect } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthentication = async () => {
            if (!isAuthenticated && !isLoading) {
                try {
                    await loginWithRedirect();
                } catch (error) {
                    console.error("Error during login redirect:", error);
                }
            } else if (isAuthenticated) {
                navigate("/");
            }
        };

        handleAuthentication();
    }, [isAuthenticated, isLoading, loginWithRedirect, navigate]);

    return <div>Processing authentication...</div>;
};

export default CallbackPage;