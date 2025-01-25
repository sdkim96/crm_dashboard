import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Textarea,
  Spinner,
  Box,
  Text
} from '@chakra-ui/react';
import { KeyboardEvent, useState } from 'react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  isSubmitted: boolean;
  setIsSubmitted: (isSubmitted: boolean) => void;
  onQueryChange: (query: string) => void;
  onSubmit: () => Promise<boolean>; // 프로젝트 생성 성공 여부 반환
}

const CreateProjectModal = ({
  isOpen,
  onClose,
  query,
  isSubmitted,
  setIsSubmitted,
  onQueryChange,
  onSubmit,
}: CreateProjectModalProps) => {
  const [isLoading, setIsLoading] = useState(false); // 요청 진행 상태

  const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.metaKey) {
      e.preventDefault(); // 기본 줄바꿈 동작 방지
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true); // 로딩 시작
    const success = await onSubmit(); // onSubmit 호출
    setIsLoading(false); // 로딩 종료
    setIsSubmitted(success); // 요청 성공 여부 저장

    if (success) {
      // 요청 성공 시 짧은 지연 후 모달 닫기
      setTimeout(() => {
        onClose();
      }, 1000); // 1초 후 모달 닫기
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        maxW="800px"
        borderRadius="md"
        p={4}
        boxShadow="lg"
      >
        <ModalBody>
          {isSubmitted ? (
            // 요청 성공 시 피드백 표시
            <Box textAlign="center">
              <Text fontSize="xl" fontWeight="bold">AI가 곧 답변을 생성합니다.</Text>
            </Box>
          ) : (
            <>
              <Textarea
                placeholder="새로운 프로젝트에 대한 아이디어를 입력하세요..."
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                resize="none"
                fontSize="lg"
                h="50px"
                isDisabled={isLoading} // 로딩 중에는 입력 불가
              />
              {isLoading && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Spinner size="lg" />
                </Box>
              )}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateProjectModal;