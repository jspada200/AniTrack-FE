import { usePosts } from "../../api/socialFeed";
import { Box, Text } from "@radix-ui/themes";
import styled from "styled-components";
import { Post } from "./Post";

const PostsContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

export const PostsFeed = () => {
  const { postsQuery } = usePosts();
  const posts = postsQuery.data || [];

  if (postsQuery.isLoading) {
    return <Text>Loading posts...</Text>;
  }

  if (postsQuery.isError) {
    return <Text color="red">Error loading posts</Text>;
  }

  if (!posts.length) {
    return <Text>No posts found for this project</Text>;
  }

  return (
    <PostsContainer>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </PostsContainer>
  );
};
