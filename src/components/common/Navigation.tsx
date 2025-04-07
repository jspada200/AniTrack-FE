import { Link } from "@tanstack/react-router";
import { Flex } from "@radix-ui/themes";

export const Navigation = () => {
  return (
    <Flex gap="3" p="4" justify="center">
      <Link to="/">Home</Link>
      <Link to="/feed">Feed</Link>
    </Flex>
  );
};
