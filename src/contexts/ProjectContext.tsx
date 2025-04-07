import { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface Project {
  id: string;
  long_name: string;
  short_name: string;
  thumb?: string;
  created_at: string;
  updated_at: string;
  added_by: string;
  modified_by: string;
}

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = "anitrack_selected_project";

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProject, setSelectedProject] = useLocalStorage<Project | null>(
    STORAGE_KEY,
    null
  );

  return (
    <ProjectContext.Provider value={{ selectedProject, setSelectedProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
