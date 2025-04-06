import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Theme,
} from "@radix-ui/themes";
import styled from "styled-components";

const StyledContainer = styled(Container)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
`;

const HeroSection = styled(Flex)`
  gap: 2rem;
  margin-bottom: 4rem;
`;

const FeatureGrid = styled(Flex)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
`;

const FeatureCard = styled(Box)`
  padding: 2rem;
  border-radius: 8px;
  background: var(--gray-2);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const EmailInput = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 4px;
  border: 1px solid var(--gray-6);
  background: var(--gray-2);
  color: var(--gray-12);
  width: 100%;
  max-width: 300px;
  margin-right: 1rem;

  &:focus {
    outline: none;
    border-color: var(--accent-9);
  }
`;

export const LandingPage = () => {
  return (
    <Theme appearance="dark" accentColor="violet">
      <StyledContainer size="4">
        <HeroSection direction="column" align="center">
          <Heading size="8" align="center" mb="4">
            AniTrack
          </Heading>
          <Text size="5" align="center" color="gray">
            Professional-grade project management for VFX and animation studios
          </Text>
          <Text size="3" align="center" color="gray" mb="6">
            Affordable, accessible solutions for small-to-medium studios and
            students
          </Text>

          <Flex align="center" justify="center" wrap="wrap" gap="2">
            <EmailInput type="email" placeholder="Enter your email" />
            <Button size="3" variant="solid">
              Join Waitlist
            </Button>
          </Flex>
        </HeroSection>

        <FeatureGrid>
          <FeatureCard>
            <Heading size="4" mb="2">
              Task Management
            </Heading>
            <Text color="gray">
              Track artist tasks, monitor progress, and manage deadlines with
              ease
            </Text>
          </FeatureCard>

          <FeatureCard>
            <Heading size="4" mb="2">
              Production Tools
            </Heading>
            <Text color="gray">
              Timeline tracking, resource allocation, and budget monitoring
            </Text>
          </FeatureCard>

          <FeatureCard>
            <Heading size="4" mb="2">
              Review System
            </Heading>
            <Text color="gray">
              Supervisor feedback, version comparison, and approval workflow
            </Text>
          </FeatureCard>
        </FeatureGrid>

        <Flex direction="column" align="center" gap="4" mt="8">
          <Text size="3" color="gray" align="center">
            Be the first to know when AniTrack launches
          </Text>
          <Button size="3" variant="outline">
            Join Our Mailing List
          </Button>
        </Flex>
      </StyledContainer>
    </Theme>
  );
};
