import { useState } from 'react';
import {
  Box,
  Heading,
  Select,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  useDisclosure,
  useToast,
  IconButton,
  Button,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DefaultService,
  ProjectCategory,
  ProjectPriority,
  Project,
  GetDashboardApiV1DashboardGetResponse,
  PutModifyProjectResponse,
  PutModifyProjectRequest,
  PostCreateProjectResponse,
  PostCreateProjectRequest,
} from '../../client';
import { createFileRoute } from '@tanstack/react-router';

import { AddIcon } from '@chakra-ui/icons';
import ModifyProjectDrawer from '../../components/Drawer/ModifyProjectDrawer';
import CreateProjectModal from '../../components/Modal/CreateProjectModal';

export const Route = createFileRoute('/_layout/dashboard')({
  component: ProjectDashboard,
});

function ProjectDashboard() {
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | null>(null);
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<Project | null>(null);
  const [newProjectQuery, setNewProjectQuery] = useState<string>('');
  const toast = useToast();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
  const [isLastPage, setIsLastPage] = useState(false); // 마지막 페이지 여부
  const limit = 10; // 페이지당 데이터 개수

  const { data, isLoading, isError } = useQuery<GetDashboardApiV1DashboardGetResponse>({
    queryKey: ['dashboard', categoryFilter, priorityFilter, currentPage],
    queryFn: async () => {
      const response = await DefaultService.getDashboardApiV1DashboardGet({
        category: categoryFilter?.length ? categoryFilter: null,
        priority: priorityFilter?.length ? priorityFilter: null,
        limit,
        offset: (currentPage - 1) *  limit,
      });
      setIsLastPage(response.projects.length < limit);
      return response;
    },
  });

  const modifyProjectMutation = useMutation<PutModifyProjectResponse, unknown, PutModifyProjectRequest>({
    mutationFn: (updatedTask) =>
      DefaultService.modifyProjectApiV1DashboardModifyPut({
        requestBody: updatedTask,
      }),
    onSuccess: () => {
      toast({ title: '프로젝트 수정 완료!', status: 'success' });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onDrawerClose();
    },
    onError: () => {
      toast({ title: '수정 중 오류가 발생했습니다.', status: 'error' });
    },
  });

  const createProjectMutation = useMutation<PostCreateProjectResponse, unknown, PostCreateProjectRequest>({
    mutationFn: (newProject) =>
      DefaultService.createProjectApiV1DashboardCreatePost({
        requestBody: newProject,
      }),
    onSuccess: () => {
      toast({ title: '프로젝트 생성 완료!', status: 'success' });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setNewProjectQuery('');
      onModalClose();
    },
    onError: () => {
      toast({ title: '생성 중 오류가 발생했습니다.', status: 'error' });
    },
  });

  const handleRowClick = (task: Project) => {
    setSelectedTask(task); // 상태 업데이트
    onDrawerOpen();
  };

  const handleNextPage = () => {
    if (!isLastPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const tasks = data?.projects || [];

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case 'high':
        return 'yellow';
      case 'medium':
        return 'green';
      case 'low':
        return 'blue';
      case 'critical':
        return 'red';
    }
  };

  const getCategoryColor = (category: ProjectCategory) => {
    switch (category) {
      case 'short_term':
        return 'red';
      case 'mid_term':
        return 'yellow';
      case 'long_term':
        return 'green';
      case 'forever':
        return 'blue';
      default:
        return 'gray';
    }
  };

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (isError) {
    return <Box>Error loading data</Box>;
  }

  return (
    <Box p={6}>
      <Heading mb={4}>업무 일정 대시보드</Heading>
      <HStack spacing={4} mb={6}>
        <Select
          placeholder="카테고리"
          value={categoryFilter ?? ''}
          onChange={(e) => setCategoryFilter(e.target.value as ProjectCategory)}
        >
          <option value="short_term">단기</option>
          <option value="mid_term">중기</option>
          <option value="long_term">장기</option>
          <option value="forever">지속</option>
        </Select>
        <Select
          placeholder="우선순위"
          value={priorityFilter ?? ''}
          onChange={(e) => setPriorityFilter(e.target.value as ProjectPriority)}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="critical">Critical</option>
        </Select>
        <IconButton
          aria-label="Create new Project"
          colorScheme="green"
          icon={<AddIcon />} // + 아이콘 추가
          onClick={onModalOpen}
        />
      </HStack>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>우선순위</Th>
            <Th>업무명</Th>
            <Th>세부내용</Th>
            <Th>시작일</Th>
            <Th>종료일</Th>
            <Th>카테고리</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tasks.map((task) => (
            <Tr
              key={task.u_id}
              onClick={() => handleRowClick(task)}
              cursor="pointer"
              _hover={{ bg: 'gray.100' }}
            >
              <Td>
                <Tag colorScheme={getPriorityColor(task.priority!)}>
                  {task.priority}
                </Tag>
              </Td>
              <Td>{task.title}</Td>
              <Td>{task.summary ? '📝 상세보기' : '-'}</Td>
              <Td>{new Date(task.start_date * 1000).toLocaleDateString()}</Td>
              <Td>{new Date(task.end_date * 1000).toLocaleDateString()}</Td>
              <Td>
                <Tag colorScheme={getCategoryColor(task.category!)}>{task.category}</Tag>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <HStack spacing={2} mt={4} justifyContent="center">
        <Button onClick={handlePreviousPage} isDisabled={currentPage === 1}>
          이전
        </Button>
        <Button onClick={handleNextPage} isDisabled={isLastPage}>
          다음
        </Button>
      </HStack>

      <ModifyProjectDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        selectedTask={selectedTask}
        onSave={(updatedTask) => {
          modifyProjectMutation.mutate({
            u_id: updatedTask.u_id!,
            title: updatedTask.title!,
            summary: updatedTask.summary!,
            priority: updatedTask.priority!,
            category: updatedTask.category!,
            start_date: updatedTask.start_date,
            end_date: updatedTask.end_date,
          });
        }}
      />
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        query={newProjectQuery}
        onQueryChange={setNewProjectQuery}
        onSubmit={async () => {
          createProjectMutation.mutateAsync({
            query: newProjectQuery,
            thread_id: '1b21b011-edce-41d7-b2ae-8f418e043a93',
          });
          return true;
        }}
      />
    </Box>
  );
}

export default ProjectDashboard;