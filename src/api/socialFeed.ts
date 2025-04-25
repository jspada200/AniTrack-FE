import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProjects } from "./useProjectData";
import { supabase } from "../lib/supabase";
import { useProject } from "../contexts/ProjectContext";
import { Post, PostContent, PostType } from "../types/socialFeed";
import { queryKeys } from "./queryKeys";

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
    queryKey: queryKeys.posts.byProject(selectedProject?.id || ""),
    queryFn: async () => {
      if (!selectedProject?.id) {
        return [];
      }

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

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      const transformedPosts = (posts || []).map((post) => {
        const likes = post.post_likes || [];
        return {
          ...post,
          content: post.content as PostContent,
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

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { selectedProject } = useProject();

  return useMutation({
    mutationFn: async ({
      content,
      type,
    }: {
      content: string;
      type: PostType;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      if (!selectedProject) throw new Error("No project selected");

      const postContent: PostContent = {
        type,
        message: content,
      };

      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          content: postContent,
          added_by: user.id,
          project_id: selectedProject.id,
        })
        .select(
          `
          *,
          profiles (
            id,
            email,
            user_metadata
          ),
          post_likes (
            user_id
          )
        `
        )
        .single();

      if (error) throw error;
      return post;
    },
    onMutate: async (newPost) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.byProject(selectedProject?.id || ""),
      });

      // Snapshot the previous value
      const previousPosts =
        queryClient.getQueryData<Post[]>(
          queryKeys.posts.byProject(selectedProject?.id || "")
        ) || [];

      // Optimistically update to the new value
      const optimisticPost: Post = {
        id: "temp-id",
        content: {
          type: newPost.type,
          message: newPost.content,
        },
        created_at: new Date().toISOString(),
        added_by: (await supabase.auth.getUser()).data.user?.id || "",
        project_id: selectedProject?.id || "",
        user: {
          id: (await supabase.auth.getUser()).data.user?.id || "",
          email: (await supabase.auth.getUser()).data.user?.email || "",
          user_metadata: (await supabase.auth.getUser()).data.user
            ?.user_metadata,
        },
        likes: {
          count: 0,
          isLiked: false,
        },
      };

      queryClient.setQueryData<Post[]>(
        queryKeys.posts.byProject(selectedProject?.id || ""),
        [optimisticPost, ...previousPosts]
      );

      return { previousPosts };
    },
    onError: (err, newPost, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPosts) {
        queryClient.setQueryData(
          queryKeys.posts.byProject(selectedProject?.id || ""),
          context.previousPosts
        );
      }
    },
    onSuccess: (newPost) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.byProject(selectedProject?.id || ""),
      });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { selectedProject } = useProject();

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
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.byProject(selectedProject?.id || ""),
      });

      // Snapshot the previous value
      const previousPosts =
        queryClient.getQueryData<Post[]>(
          queryKeys.posts.byProject(selectedProject?.id || "")
        ) || [];

      // Optimistically update to the new value
      queryClient.setQueryData<Post[]>(
        queryKeys.posts.byProject(selectedProject?.id || ""),
        (old) => {
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
        }
      );

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPosts) {
        queryClient.setQueryData(
          queryKeys.posts.byProject(selectedProject?.id || ""),
          context.previousPosts
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.byProject(selectedProject?.id || ""),
      });
    },
  });
};
