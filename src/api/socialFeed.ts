import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProjects } from "./useProjectData";
import { supabase } from "../lib/supabase";

interface User {
  id: string;
  email: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
}

interface Post {
  id: string;
  content: {
    type: string;
    message: string;
  };
  created_at: string;
  added_by: string;
  user?: User;
  likes?: {
    count: number;
    isLiked: boolean;
  };
}

interface PostLike {
  user_id: string;
}

export const usePosts = () => {
  const { selectedProject } = useProjects();

  const postsQuery = useQuery({
    queryKey: ["posts", selectedProject?.id],
    queryFn: async () => {
      if (!selectedProject?.id) {
        return [];
      }

      // Get posts with user data and likes in a single query using joins
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles!added_by (
            id,
            email,
            user_metadata
          ),
          post_likes (
            user_id
          )
        `
        )
        .eq("project_id", selectedProject.id)
        .order("created_at", { ascending: false });

      if (postsError) {
        throw postsError;
      }

      // Get current user's ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      // Transform the data to match the Post interface
      const transformedPosts = (posts || []).map((post) => {
        const likes = post.post_likes || [];
        return {
          ...post,
          user: post.profiles
            ? {
                id: post.profiles.id,
                email: post.profiles.email,
                user_metadata: post.profiles.user_metadata,
              }
            : undefined,
          likes: {
            count: likes.length,
            isLiked: currentUserId
              ? likes.some((like: PostLike) => like.user_id === currentUserId)
              : false,
          },
        };
      });

      return transformedPosts as Post[];
    },
    enabled: !!selectedProject?.id,
  });

  return {
    postsQuery,
  };
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      isLiked,
    }: {
      postId: string;
      isLiked: boolean;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;
      }
    },
    onMutate: async ({ postId, isLiked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(["posts"]) as Post[];

      // Optimistically update to the new value
      queryClient.setQueryData(["posts"], (old: Post[] | undefined) => {
        if (!old) return old;
        return old.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes: {
                count: (post.likes?.count || 0) + (isLiked ? -1 : 1),
                isLiked: !isLiked,
              },
            };
          }
          return post;
        });
      });

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
