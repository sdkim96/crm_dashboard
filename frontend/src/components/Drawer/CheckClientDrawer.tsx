import React, { useEffect, useState } from 'react';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BizService, BizClientDTO_Input } from '../../client';

type CheckClientDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  bizCardId: string | null; // 수정할 명함의 uId
};

export const CheckClientDrawer: React.FC<CheckClientDrawerProps> = ({
  isOpen,
  onClose,
  bizCardId
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [localBizCard, setLocalBizCard] = useState<BizClientDTO_Input | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const { isLoading } = useQuery({
    queryKey: ['bizCardDetail', bizCardId],
    queryFn: async () => {
      const response = await BizService.getBizcardDetailApiV1BizDetailGet({
        uId: bizCardId!
      });
      setLocalBizCard(response.biz_card);
      return response;
    },
    enabled: isOpen && !!bizCardId, // Drawer가 열려 있고 bizCardId가 있을 때만 실행
  });

  const updateBizCardMutation = useMutation({
    mutationFn: async (payload: BizClientDTO_Input) => {
      return BizService.putBizcardApiV1BizPut({
        requestBody: {
          u_id: payload.u_id,
          biz_card: payload
        }
      });
    },
    onSuccess: () => {
      toast({
        title: '수정되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      setIsMutating(false);
      // 명함 목록 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ['bizcards'] });
      onClose();
    },
    onError: () => {
      toast({
        title: '수정 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    },
    onMutate: () => {
      setIsMutating(true);
    }
  });

  useEffect(() => {
    // 모달이 닫힐 때 폼 상태 초기화
    if (!isOpen) {
      setLocalBizCard(null);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string,
    type: 'biz_card' | 'company'
  ) => {
    if (!localBizCard) return;

    // biz_card 내부 필드를 수정할 경우
    if (type === 'biz_card') {
      setLocalBizCard({
        ...localBizCard,
        biz_card: {
          ...localBizCard.biz_card,
          [field]: e.target.value
        }
      });
    }

    // company 내부 필드를 수정할 경우
    if (type === 'company') {
      setLocalBizCard({
        ...localBizCard,
        biz_card: {
          ...localBizCard.biz_card,
          company: {
            ...localBizCard.biz_card.company,
            [field]: e.target.value
          }
        }
      });
    }
  };

  const handleSave = () => {
    if (!localBizCard) return;
    updateBizCardMutation.mutate(localBizCard);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>명함 수정하기</DrawerHeader>
        <DrawerBody>
          {isLoading && <div>Loading...</div>}
          {!isLoading && localBizCard && (
            <>
              <FormControl mb={3}>
                <FormLabel>이름</FormLabel>
                <Input
                  value={localBizCard.biz_card.name}
                  onChange={(e) => handleChange(e, 'name', 'biz_card')}
                />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>직책/직함</FormLabel>
                <Input
                  value={localBizCard.biz_card.role || ''}
                  onChange={(e) => handleChange(e, 'role', 'biz_card')}
                />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>전화번호</FormLabel>
                <Input
                  value={localBizCard.biz_card.phone_number || ''}
                  onChange={(e) => handleChange(e, 'phone_number', 'biz_card')}
                />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>이메일</FormLabel>
                <Input
                  value={localBizCard.biz_card.email || ''}
                  onChange={(e) => handleChange(e, 'email', 'biz_card')}
                />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>회사명</FormLabel>
                <Input
                  value={localBizCard.biz_card.company.name}
                  onChange={(e) => handleChange(e, 'name', 'company')}
                />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>회사 주소</FormLabel>
                <Input
                  value={localBizCard.biz_card.company.address}
                  onChange={(e) => handleChange(e, 'address', 'company')}
                />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>영문 회사명</FormLabel>
                <Input
                  value={localBizCard.biz_card.company.english_name || ''}
                  onChange={(e) => handleChange(e, 'english_name', 'company')}
                />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>웹사이트</FormLabel>
                <Input
                  value={localBizCard.biz_card.company.website || ''}
                  onChange={(e) => handleChange(e, 'website', 'company')}
                />
              </FormControl>
            </>
          )}
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            취소
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={isMutating}
          >
            저장
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};