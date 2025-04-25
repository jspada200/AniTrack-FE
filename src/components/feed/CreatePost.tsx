import { useState } from "react";
import { Dialog, Flex, Text, Button, TextArea, Select } from "@radix-ui/themes";
import { useAuth } from "../../contexts/AuthContext";
import { useCreatePost } from "../../api/socialFeed";
import { PostType } from "../../types/socialFeed";

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
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-4">
        <img
          src={user.user_metadata.avatar_url}
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 text-left bg-gray-700 hover:bg-gray-600 rounded-full px-4 py-2.5 text-gray-400 transition-colors"
        >
          What's on your mind, {user.user_metadata.name}?
        </button>
      </div>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Content style={{ maxWidth: 500 }}>
          <Dialog.Title>Create Post</Dialog.Title>

          <Flex direction="column" gap="3" my="4">
            <Flex align="center" gap="2">
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <Text weight="bold">{user.user_metadata.name}</Text>
            </Flex>

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
  );
};
