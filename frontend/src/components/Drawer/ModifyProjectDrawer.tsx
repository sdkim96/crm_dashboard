import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  VStack,
  Input,
  Textarea,
  Select,
  Button,
  HStack,
  Box,
  Text,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { ProjectDTO, ProjectPriority, ProjectCategory } from '../../client';
import { useState, useEffect } from 'react';
import { DefaultService } from '../../client';
import { useToast } from '@chakra-ui/react';

interface ModifyProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTask: ProjectDTO | null;
  onSave: (updatedTask: ProjectDTO) => void;
}

const ModifyProjectDrawer = ({
  isOpen,
  onClose,
  selectedTask,
  onSave,
}: ModifyProjectDrawerProps) => {
  const [task, setTask] = useState<ProjectDTO | null>(selectedTask);
  const toast = useToast();

  useEffect(() => {
    setTask(selectedTask);
  }, [selectedTask]);

  const handleSave = () => {
    if (task) {
      onSave(task);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (task?.u_id) {
      try {
        const response = await DefaultService.deleteProjectApiV1DashboardDeleteDelete({
          uId: task.u_id,
        });
        if (response.status) {
          toast({ title: '프로젝트가 삭제되었습니다.', status: 'success' });
          onClose();
        } else {
          toast({ title: '프로젝트 삭제 실패', status: 'error' });
        }
      } catch (error) {
        toast({ title: '프로젝트 삭제 중 오류가 발생했습니다.', status: 'error' });
        console.error(error);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const response = await DefaultService.uploadFileApiV1DashboardUploadFilePost({
          formData: {
            u_id: task?.u_id || '',
            file,
          },
        });
        if (response.status) {
          setTask({
            ...task,
            file_id: response.request_id,
            file_name: file.name,
            original_file_name: file.name,
          } as ProjectDTO);
          toast({ title: '파일이 업로드되었습니다.', status: 'success' });
        }
      } catch (error) {
        toast({ title: '파일 업로드 실패', status: 'error' });
        console.error(error);
      }
    }
  };

  const handleFileDelete = async () => {
    if (task?.u_id && task.file_id) {
      try {
        const response = await DefaultService.deleteFileApiV1DashboardDeleteFileDelete({
          uId: task.u_id,
        });
        if (response.status) {
          setTask({
            ...task,
            file_id: null,
            file_name: null,
            original_file_name: null,
          } as ProjectDTO);
          toast({ title: '파일이 삭제되었습니다.', status: 'success' });
        }
      } catch (error) {
        toast({ title: '파일 삭제 실패', status: 'error' });
        console.error(error);
      }
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader
          bg="blue.500"
          color="white"
          fontSize="lg"
          fontWeight="bold"
          textAlign="center"
        >
          프로젝트 수정
        </DrawerHeader>
        <DrawerBody p={6} bg="gray.50">
          <VStack spacing={6}>
            <Box w="100%" p={4} bg="white" shadow="sm" borderRadius="md">
              <Text fontSize="sm" fontWeight="bold" mb={2}>
                업무명
              </Text>
              <Input
                placeholder="업무명"
                value={task?.title || ''}
                onChange={(e) =>
                  setTask({ ...task, title: e.target.value } as ProjectDTO)
                }
              />
            </Box>

            <Box w="100%" p={4} bg="white" shadow="sm" borderRadius="md">
              <Text fontSize="sm" fontWeight="bold" mb={2}>
                요약
              </Text>
              <Textarea
                placeholder="요약"
                value={task?.summary || ''}
                onChange={(e) =>
                  setTask({ ...task, summary: e.target.value } as ProjectDTO)
                }
              />
            </Box>

            <HStack spacing={4} w="100%">
              <Box flex="1" p={4} bg="white" shadow="sm" borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  우선순위
                </Text>
                <Select
                  value={task?.priority || ''}
                  onChange={(e) =>
                    setTask({
                      ...task,
                      priority: e.target.value as ProjectPriority,
                    } as ProjectDTO)
                  }
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="critical">Critical</option>
                </Select>
              </Box>

              <Box flex="1" p={4} bg="white" shadow="sm" borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  카테고리
                </Text>
                <Select
                  value={task?.category || ''}
                  onChange={(e) =>
                    setTask({
                      ...task,
                      category: e.target.value as ProjectCategory,
                    } as ProjectDTO)
                  }
                >
                  <option value="short_term">단기</option>
                  <option value="mid_term">중기</option>
                  <option value="long_term">장기</option>
                  <option value="forever">지속</option>
                </Select>
              </Box>
            </HStack>

            <HStack spacing={4} w="100%">
              <Box flex="1" p={4} bg="white" shadow="sm" borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  시작일
                </Text>
                <Input
                  type="date"
                  value={
                    task?.start_date
                      ? new Date(task.start_date * 1000).toISOString().slice(0, 10)
                      : ''
                  }
                  onChange={(e) =>
                    setTask({
                      ...task,
                      start_date: Math.floor(new Date(e.target.value).getTime() / 1000),
                    } as ProjectDTO)
                  }
                />
              </Box>

              <Box flex="1" p={4} bg="white" shadow="sm" borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  종료일
                </Text>
                <Input
                  type="date"
                  value={
                    task?.end_date
                      ? new Date(task.end_date * 1000).toISOString().slice(0, 10)
                      : ''
                  }
                  onChange={(e) =>
                    setTask({
                      ...task,
                      end_date: Math.floor(new Date(e.target.value).getTime() / 1000),
                    } as ProjectDTO)
                  }
                />
              </Box>
            </HStack>

            <Box w="100%" p={4} bg="white" shadow="sm" borderRadius="md">
              <Text fontSize="sm" fontWeight="bold" mb={2}>
                파일 업로드
              </Text>
              {task?.original_file_name ? (
                <HStack spacing={2}>
                  <Text isTruncated maxW="200px" title={task.original_file_name}>
                    {task.original_file_name}
                  </Text>
                  <IconButton
                    aria-label="파일 삭제"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    size="sm"
                    onClick={handleFileDelete}
                  />
                </HStack>
              ) : (
                <Input type="file" onChange={handleFileUpload} />
              )}
            </Box>
          </VStack>
        </DrawerBody>
        <Divider />
        <DrawerFooter justifyContent="space-between" bg="gray.100">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <HStack spacing={3}>
            <Button colorScheme="red" onClick={handleDelete}>
              삭제
            </Button>
            <Button colorScheme="blue" onClick={handleSave}>
              저장
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ModifyProjectDrawer;