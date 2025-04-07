import { Dialog, Button, Text, Flex } from "@radix-ui/themes";
import styled from "styled-components";

const StyledDialog = styled(Dialog.Root)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
`;

const DialogContent = styled(Dialog.Content)`
  background: var(--gray-2);
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
`;

export const NoProjectModal = () => {
  return (
    <StyledDialog defaultOpen>
      <DialogContent>
        <Flex direction="column" gap="4" align="center">
          <Text size="5" weight="bold" align="center">
            Welcome to AniTrack!
          </Text>
          <Text size="3" color="gray" align="center">
            To get started, please select a project from the dropdown in the
            sidebar.
          </Text>
          <Button size="3" variant="solid">
            Got it!
          </Button>
        </Flex>
      </DialogContent>
    </StyledDialog>
  );
};
