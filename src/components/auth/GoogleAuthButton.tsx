import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  img {
    width: 18px;
    height: 18px;
  }
`;

interface GoogleAuthButtonProps {
  type: "login" | "signup";
}

export const GoogleAuthButton = ({ type }: GoogleAuthButtonProps) => {
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <Button onClick={handleGoogleLogin}>
      <img src="https://www.google.com/favicon.ico" alt="Google" />
      {type === "login" ? "Sign in with Google" : "Sign up with Google"}
    </Button>
  );
};
