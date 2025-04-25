export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    byProject: (projectId: string) =>
      [...queryKeys.posts.all, projectId] as const,
  },
  projects: {
    all: ["projects"] as const,
    current: ["projects", "current"] as const,
  },
} as const;
