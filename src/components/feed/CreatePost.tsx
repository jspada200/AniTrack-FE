import { useState } from "react";
import {
  Dialog,
  Flex,
  Text,
  Button,
  TextArea,
  Select,
  Avatar,
} from "@radix-ui/themes";
import { useAuth } from "../../contexts/AuthContext";
import { useCreatePost } from "../../api/socialFeed";
import { PostType } from "../../types/socialFeed";
import styled from "styled-components";

const CenteredContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const PostTrigger = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background-color: var(--gray-1);

  padding: 1rem;
  border-radius: 0.5rem;
`;

const PostButton = styled.button`
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  background: var(--gray-3);
  border-radius: 16px;
  width: 100%;
  text-align: left;
  transition: background-color 0.2s;

  &:hover {
    background: var(--gray-4);
  }
`;

export const CreatePost = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState<PostType>("update");
  const { user } = useAuth();
  const createPost = useCreatePost();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await createPost.mutateAsync({ content, type });
      setContent("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  if (!user) return null;

  return (
    <CenteredContainer>
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <PostTrigger>
          <Avatar
            src={user.user_metadata.avatar_url}
            alt="Profile"
            className="w-10 h-10 rounded-full"
            fallback={user?.user_metadata?.full_name?.[0]?.toUpperCase() || "A"}
          />
          <PostButton onClick={() => setIsOpen(true)}>
            What's on your mind, {user.user_metadata.name}?
          </PostButton>
        </PostTrigger>

        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
          <Dialog.Content style={{ maxWidth: 500 }}>
            <Dialog.Title>Create Post</Dialog.Title>

            <Flex direction="column" gap="3" my="4">
              {/* <Flex align="center" gap="2">
                <Avatar
                  size="2"
                  src={user.user_metadata.avatar_url}
                  fallback={user.user_metadata.name?.[0]?.toUpperCase() || "A"}
                  radius="full"
                />
                <Text weight="bold">{user.user_metadata.name}</Text>
              </Flex> */}

              <Select.Root
                value={type}
                onValueChange={(value) => setType(value as PostType)}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="update">Update</Select.Item>
                  <Select.Item value="announcement">Announcement</Select.Item>
                  <Select.Item value="milestone">Milestone</Select.Item>
                </Select.Content>
              </Select.Root>

              <TextArea
                placeholder={`What's on your mind, ${user.user_metadata.name}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
              />
            </Flex>

            <Flex gap="3" justify="end">
              <Button
                variant="soft"
                color="gray"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || createPost.isPending}
              >
                {createPost.isPending ? "Posting..." : "Post"}
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </div>
    </CenteredContainer>
  );
};
