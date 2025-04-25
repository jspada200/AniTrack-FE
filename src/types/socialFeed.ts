export type PostType = "announcement" | "milestone" | "update";

export interface PostContent {
  type: PostType;
  message: string;
}

export interface Post {
  id: string;
  content: PostContent;
  created_at: string;
  added_by: string;
  project_id: string;
  user?: {
    id: string;
    email: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
    };
  };
  likes?: {
    count: number;
    isLiked: boolean;
  };
}
