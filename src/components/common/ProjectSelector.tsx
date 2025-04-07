import { useProjects } from "../../api/useProjectData";
import { Box, Select, Text } from "@radix-ui/themes";
import styled from "styled-components";

const StyledSelect = styled(Select.Root)`
  width: 100%;
`;

const SelectTrigger = styled(Select.Trigger)`
  width: 100%;
  background: var(--gray-3);
  border: 1px solid var(--gray-6);
  color: var(--gray-11);
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: var(--gray-4);
  }
`;

const SelectContent = styled(Select.Content)`
  background: var(--gray-2);
  border: 1px solid var(--gray-6);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
`;

const SelectItem = styled(Select.Item)`
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: var(--gray-11);
  transition: background-color 0.2s;

  &:hover {
    background: var(--gray-4);
  }
`;

export const ProjectSelector = () => {
  const { data: projects, selectedProject, setSelectedProject } = useProjects();

  if (!projects?.length) {
    return (
      <Box p="2">
        <Text size="2" color="gray">
          No projects available
        </Text>
      </Box>
    );
  }

  return (
    <Box p="2">
      <StyledSelect
        value={selectedProject?.id || ""}
        onValueChange={(value) => {
          const project = projects.find((p) => p.id === value);
          setSelectedProject(project || null);
        }}
      >
        <SelectTrigger>
          {selectedProject?.short_name || "Select a project"}
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.short_name}
            </SelectItem>
          ))}
        </SelectContent>
      </StyledSelect>
    </Box>
  );
};
