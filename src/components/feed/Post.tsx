import { Avatar, Box, Text, Card, Flex, Button } from "@radix-ui/themes";
import {
  HeartIcon,
  HeartFilledIcon,
  ChatBubbleIcon,
  Share1Icon,
} from "@radix-ui/react-icons";
import styled from "styled-components";
import { formatDistanceToNow } from "date-fns";
import { useLikePost } from "../../api/socialFeed";

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
  gap: 1rem;
`;

const ActionButton = styled(Button)<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props) => (props.$isActive ? "var(--red-11)" : "var(--gray-11)")};

  &:hover {
    color: ${(props) => (props.$isActive ? "var(--red-12)" : "var(--gray-12)")};
  }
`;

const CommentSection = styled(Box)`
  margin-top: 1rem;
`;

const Comment = styled(Flex)`
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
  likes?: {
    count: number;
    isLiked: boolean;
  };
}

interface PostProps {
  post: Post;
}

export const Post = ({ post }: PostProps) => {
  const user = post.user;
  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Anonymous";
  const userAvatar = user?.user_metadata?.avatar_url;
  const likeMutation = useLikePost();

  const handleLike = () => {
    if (!post.likes) return;
    likeMutation.mutate({ postId: post.id, isLiked: post.likes.isLiked });
  };

  return (
    <PostCard>
      <PostHeader gap="3" align="center">
        <Avatar
          size="2"
          src={userAvatar}
          fallback={userName?.[0]?.toUpperCase() || "A"}
          radius="full"
        />
        <Flex direction="column">
          <Text size="2" weight="bold">
            {userName}
          </Text>
          <Text size="1" color="gray">
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
            })}
          </Text>
        </Flex>
      </PostHeader>

      <PostContent>
        <Text size="2">{post.content.message}</Text>
      </PostContent>

      <PostActions gap="3" justify="start">
        <ActionButton
          variant="ghost"
          size="1"
          $isActive={post.likes?.isLiked}
          onClick={handleLike}
          disabled={likeMutation.isPending}
        >
          {post.likes?.isLiked ? (
            <HeartFilledIcon width="16" height="16" />
          ) : (
            <HeartIcon width="16" height="16" />
          )}
          <Text size="1">
            {post.likes?.count || 0} Like{post.likes?.count !== 1 ? "s" : ""}
          </Text>
        </ActionButton>
        <ActionButton variant="ghost" size="1">
          <ChatBubbleIcon width="16" height="16" />
          <Text size="1">Comment</Text>
        </ActionButton>
        <ActionButton variant="ghost" size="1">
          <Share1Icon width="16" height="16" />
          <Text size="1">Share</Text>
        </ActionButton>
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
                </Box>
              </Comment>
            );
          })}
        </CommentSection>
      )}
    </PostCard>
  );
};
