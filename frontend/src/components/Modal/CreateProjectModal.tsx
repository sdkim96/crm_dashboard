import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Textarea,
  Spinner,
  Box,
  Text,
  Button,
  HStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { KeyboardEvent, useState } from 'react';
import { FaMicrophone, FaPaperPlane } from 'react-icons/fa';

// 타입 선언
type SpeechRecognition = {
  new (): {
    lang: string;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    onstart: () => void;
    onend: () => void;
    onerror: (event: { error: string }) => void;
    onresult: (event: {
      results: SpeechRecognitionResultList;
    }) => void;
  };
};

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognition;
    webkitSpeechRecognition: SpeechRecognition;
  }
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  isSubmitted: boolean;
  setIsSubmitted: (isSubmitted: boolean) => void;
  onQueryChange: (query: string) => void;
  onSubmit: () => Promise<boolean>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const success = await onSubmit();
    setIsLoading(false);
    setIsSubmitted(success);

    if (success) {
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleStartListening = () => {
    if (!SpeechRecognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: { error: string }) => {
      console.error('STT 오류:', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: { results: SpeechRecognitionResultList }) => {
      console.log('인식 결과:', event.results);
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      onQueryChange(query + transcript);
    };

    recognition.start();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered >
      <ModalOverlay />
      <ModalContent maxW="800px" borderRadius="20" p={4} boxShadow="lg">
        <ModalBody>
          {isSubmitted ? (
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
                borderRadius="20"
                fontSize="lg"
                h="100px"
                isDisabled={isLoading || isListening}
              />
              <HStack mt={4} justifyContent="space-between">
                <Tooltip label={isListening ? '녹음 중...' : '음성 입력 시작'} aria-label="Speech Tooltip">
                  <IconButton
                    aria-label="Start Speech"
                    icon={<FaMicrophone />}
                    colorScheme={isListening ? 'orange' : 'blue'}
                    onClick={handleStartListening}
                    isDisabled={isListening}
                    borderRadius="12"
                  />
                </Tooltip>
                <Button
                  rightIcon={<FaPaperPlane />}
                  colorScheme="teal"
                  onClick={handleSubmit}
                  isDisabled={isLoading}
                  borderRadius="12"
                >
                  보내기
                </Button>
              </HStack>
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