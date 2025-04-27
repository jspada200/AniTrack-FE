import {
  Box,
  Flex,
  Text,
  Avatar,
  Container,
  DropdownMenu,
} from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import styled from "styled-components";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../../contexts/AuthContext";
import { useEffect } from "react";
import { ProjectSelector } from "../ProjectSelector";
import { NoProjectModal } from "../NoProjectModal";
import { useProject } from "../../../contexts/ProjectContext";

const StyledWrapper = styled(Flex)`
  min-height: 100vh;
  width: 100%;
`;

const Sidebar = styled(Flex)`
  width: 250px;
  background: var(--gray-2);
  padding: 1rem;
  border-right: 1px solid var(--gray-6);
`;

const Header = styled(Flex)`
  height: 60px;
  background: var(--gray-2);
  border-bottom: 1px solid var(--gray-6);
  padding: 0 1rem;
`;

const MainContent = styled(Box)`
  flex: 1;
  padding: 1rem;
  background: var(--gray-1);
`;

const NavItem = styled(Link)`
  padding: 0.75rem 1rem;
  border-radius: 4px;
  color: var(--gray-11);
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background: var(--gray-4);
  }

  &.active {
    background: var(--gray-4);
    color: var(--accent-11);
  }
`;

const StyledAvatar = styled(Avatar)`
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
`;

interface PageWrapperProps {
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const { user, signOut, isAuthenticated, isLoading } = useAuth();
  const { selectedProject } = useProject();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate({ to: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <Text size="4">Loading...</Text>
      </LoadingContainer>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <StyledWrapper>
      <Sidebar direction="column" gap="3">
        <Text size="5" weight="bold" mb="4">
          AniTrack
        </Text>
        <ProjectSelector />
        <NavItem to="/dashboard">Dashboard</NavItem>
        <NavItem to="/projects">Projects</NavItem>
        <NavItem to="/tasks">Tasks</NavItem>
        <NavItem to="/team">Team</NavItem>
        <NavItem to="/settings">Settings</NavItem>
      </Sidebar>

      <Flex direction="column" style={{ flex: 1 }}>
        <Header align="center" justify="between">
          <Text size="4" weight="bold">
            AniTrack
          </Text>
          <Flex align="center" gap="3">
            <Text>{user?.email}</Text>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <StyledAvatar
                  size="2"
                  src={user?.user_metadata?.avatar_url}
                  fallback={user?.email?.[0]?.toUpperCase() || "U"}
                />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" sideOffset={5}>
                <DropdownMenu.Item onClick={handleLogout}>
                  Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Flex>
        </Header>

        <MainContent>
          <Container size="3">{children}</Container>
        </MainContent>
      </Flex>

      {!selectedProject && <NoProjectModal />}
    </StyledWrapper>
  );
};
