import { useQuery } from "@tanstack/react-query";
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
}

export const usePosts = () => {
  const { selectedProject } = useProjects();

  const postsQuery = useQuery({
    queryKey: ["posts", selectedProject?.id],
    queryFn: async () => {
      if (!selectedProject?.id) {
        return [];
      }

      // Get posts with user data in a single query using a join
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles!added_by (
            id,
            email,
            user_metadata
          )
        `
        )
        .eq("project_id", selectedProject.id)
        .order("created_at", { ascending: false });

      if (postsError) {
        throw postsError;
      }

      // Transform the data to match the Post interface
      const transformedPosts = (posts || []).map((post) => ({
        ...post,
        user: post.profiles
          ? {
              id: post.profiles.id,
              email: post.profiles.email,
              user_metadata: post.profiles.user_metadata,
            }
          : undefined,
      }));

      return transformedPosts as Post[];
    },
    enabled: !!selectedProject?.id,
  });

  return {
    postsQuery,
  };
};
