import { GoogleAuthButton } from "../../components/auth/GoogleAuthButton";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
  color: #333;
`;

const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const SignupPage = () => {
  return (
    <Container>
      <Title>Create an Account</Title>
      <AuthContainer>
        <GoogleAuthButton type="signup" />
      </AuthContainer>
    </Container>
  );
};
