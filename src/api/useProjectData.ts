import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useProject } from "../contexts/ProjectContext";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";

export const useProjects = () => {
  const { user } = useAuth();
  const { selectedProject, setSelectedProject } = useProject();

  const query = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: () => getProjects(),
    enabled: !!user, // Only run the query if we have a user
  });

  // Auto-select first project when projects are loaded and no project is selected
  useEffect(() => {
    if (query.data?.length && !selectedProject) {
      setSelectedProject(query.data[0]);
    }
  }, [query.data, selectedProject, setSelectedProject]);

  const getProjects = async () => {
    if (!user) {
      return [];
    }

    const { data, error } = await supabase.from("projects").select("*");

    if (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }

    return data || [];
  };

  return {
    ...query,
    selectedProject,
    setSelectedProject,
  };
};
