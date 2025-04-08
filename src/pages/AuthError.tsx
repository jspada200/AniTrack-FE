import { useSearchParams } from "react-router-dom";
import { Dialog, Flex, Text, Button } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";

export const AuthError = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (!error) {
    return null;
  }

  return (
    <Dialog.Root open={true}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Authentication Error</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          There was an error during authentication:
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <Text size="2" color="red">
            Error: {error}
          </Text>
          {errorDescription && (
            <Text size="2" color="gray">
              Details: {decodeURIComponent(errorDescription)}
            </Text>
          )}

          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" color="gray" onClick={() => navigate("/")}>
              Go Home
            </Button>
            <Button variant="solid" onClick={() => navigate("/login")}>
              Try Again
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
