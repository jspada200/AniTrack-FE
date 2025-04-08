import { Avatar, Box, Text, Card, Flex, Button } from "@radix-ui/themes";
import styled from "styled-components";
import { formatDistanceToNow } from "date-fns";

const PostCard = styled(Card)`
  padding: 1rem;
  background: var(--gray-2);
  border: 1px solid var(--gray-6);
  margin-bottom: 1rem;
`;

const PostHeader = styled(Flex)`
  margin-bottom: 1rem;
`;

const PostContent = styled(Box)`
  margin-bottom: 1rem;
`;

const PostActions = styled(Flex)`
  border-top: 1px solid var(--gray-6);
  border-bottom: 1px solid var(--gray-6);
  padding: 0.5rem 0;
  margin-bottom: 1rem;
`;

const CommentSection = styled(Box)`
  margin-top: 1rem;
`;

const Comment = styled(Flex)`
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: var(--gray-3);
  border-radius: 4px;
`;

interface User {
  id: string;
  email: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
}

interface Comment {
  id: string;
  content: {
    type: string;
    message: string;
  };
  created_at: string;
  user: User;
}

interface Post {
  id: string;
  content: {
    type: string;
    message: string;
  };
  created_at: string;
  user: User;
  comments?: Comment[];
}

interface PostProps {
  post: Post;
}

export const Post = ({ post }: PostProps) => {
  const user = post.user;
  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Anonymous";
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <PostCard>
      <PostHeader gap="3" align="center">
        <Avatar
          size="2"
          src={userAvatar}
          fallback={userName?.[0]?.toUpperCase() || "A"}
          radius="full"
        />
        <Box>
          <Text size="2" weight="bold">
            {userName}
          </Text>
          <Text size="1" color="gray">
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
            })}
          </Text>
        </Box>
      </PostHeader>

      <PostContent>
        <Text size="2">{post.content.message}</Text>
      </PostContent>

      <PostActions gap="3" justify="center">
        <Button variant="ghost" size="1">
          Like
        </Button>
        <Button variant="ghost" size="1">
          Comment
        </Button>
        <Button variant="ghost" size="1">
          Share
        </Button>
      </PostActions>

      {post.comments && post.comments.length > 0 && (
        <CommentSection>
          {post.comments.map((comment) => {
            const commentUserName =
              comment.user?.user_metadata?.full_name ||
              comment.user?.email?.split("@")[0] ||
              "Anonymous";
            return (
              <Comment key={comment.id} gap="2" align="center">
                <Avatar
                  size="1"
                  src={comment.user?.user_metadata?.avatar_url}
                  fallback={commentUserName?.[0]?.toUpperCase() || "A"}
                  radius="full"
                />
                <Box>
                  <Text size="1" weight="bold">
                    {commentUserName}
                  </Text>
                  <Text size="1">{comment.content.message}</Text>
                  <Text size="1" color="gray">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                    })}
                  </Text>
                </Box>
              </Comment>
            );
          })}
        </CommentSection>
      )}
    </PostCard>
  );
};
