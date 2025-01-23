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
} from '@chakra-ui/react';
import { Project, ProjectPriority, ProjectCategory } from '../../client';
import { useState, useEffect } from 'react';

interface ModifyProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTask: Project | null;
  onSave: (updatedTask: Project) => void;
}

const ModifyProjectDrawer = ({
  isOpen,
  onClose,
  selectedTask,
  onSave,
}: ModifyProjectDrawerProps) => {
  const [task, setTask] = useState<Project | null>(selectedTask);

  useEffect(() => {
    setTask(selectedTask);
  }, [selectedTask]);

  const handleSave = () => {
    if (task) {
      onSave(task); // 저장 작업 호출
      onClose(); // 작업 완료 후 Drawer 닫기
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>프로젝트 수정</DrawerHeader>
        <DrawerBody>
          <VStack spacing={4}>
            <Input
              placeholder="업무명"
              value={task?.title || ''}
              onChange={(e) =>
                setTask({ ...task, title: e.target.value } as Project)
              }
            />
            <Textarea
              placeholder="요약"
              value={task?.summary || ''}
              onChange={(e) =>
                setTask({ ...task, summary: e.target.value } as Project)
              }
            />
            <Select
              value={task?.priority || ''}
              onChange={(e) =>
                setTask({
                  ...task,
                  priority: e.target.value as ProjectPriority,
                } as Project)
              }
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="critical">Critical</option>
            </Select>
            <Select
              value={task?.category || ''}
              onChange={(e) =>
                setTask({
                  ...task,
                  category: e.target.value as ProjectCategory,
                } as Project)
              }
            >
              <option value="short_term">단기</option>
              <option value="mid_term">중기</option>
              <option value="long_term">장기</option>
              <option value="forever">지속</option>
            </Select>
            <Input
              type="date"
              placeholder="시작일"
              value={
                task?.start_date
                  ? new Date(task.start_date * 1000).toISOString().slice(0, 10)
                  : ''
              }
              onChange={(e) =>
                setTask({
                  ...task,
                  start_date: Math.floor(new Date(e.target.value).getTime() / 1000),
                } as Project)
              }
            />
            <Input
              type="date"
              placeholder="종료일"
              value={
                task?.end_date
                  ? new Date(task.end_date * 1000).toISOString().slice(0, 10)
                  : ''
              }
              onChange={(e) =>
                setTask({
                  ...task,
                  end_date: Math.floor(new Date(e.target.value).getTime() / 1000),
                } as Project)
              }
            />
          </VStack>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            취소
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            저장
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ModifyProjectDrawer;