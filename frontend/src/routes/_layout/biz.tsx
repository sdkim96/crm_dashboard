import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
  Card,
  CardBody,
  CardHeader,
  Text,
  Box,
  Heading,
  VStack,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  Button,
  Flex,
  Select,
  IconButton,
  useDisclosure, // useDisclosure import
} from '@chakra-ui/react';
import { Search2Icon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { BizService, BizClientDTO_Input, OrderBy } from '../../client';
import { CheckClientDrawer } from '../../components/Drawer/CheckClientDrawer';

/**
 * 개별 명함 카드를 보여주는 컴포넌트
 */
const BizCard = ({
  bizCard,
  onCardClick
}: {
  bizCard: BizClientDTO_Input;
  onCardClick: (uId: string) => void;
}) => {
  const { name, role, phone_number, email, company } = bizCard.biz_card;
  const { name: companyName, address, english_name, website } = company;

  return (
    <Card
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      m={4}
      shadow="md"
      cursor="pointer"
      onClick={() => onCardClick(bizCard.u_id)} // 카드 클릭 시
    >
      <CardHeader>
        <Heading size="md">{name}</Heading>
        <Text fontSize="sm" color="gray.500">
          {role || 'No Role Provided'}
        </Text>
      </CardHeader>
      <Divider />
      <CardBody>
        <VStack align="start" spacing={2}>
          <Text>
            <strong>Phone:</strong> {phone_number || 'No Phone Number'}
          </Text>
          <Text>
            <strong>Email:</strong> {email || 'No Email'}
          </Text>
          <Text>
            <strong>Company:</strong> {companyName}
          </Text>
          <Text>
            <strong>Address:</strong> {address}
          </Text>
          {english_name && (
            <Text>
              <strong>English Name:</strong> {english_name}
            </Text>
          )}
          {website && (
            <Text>
              <strong>Website:</strong>{' '}
              <a href={website} target="_blank" rel="noopener noreferrer">
                {website}
              </a>
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * 명함 목록을 서버에서 불러오는 함수
 */
const fetchBizcards = async (params: {
  query: string;
  offset: number;
  limit: number;
  orderBy: OrderBy;
}) => {
  const response = await BizService.getBizcardsApiV1BizGet({
    query: params.query,
    orderBy: params.orderBy,
    offset: params.offset,
    limit: params.limit
  });
  return response;
};

const BizcardsList = ({
  searchParams,
  onCardClick
}: {
  searchParams: {
    query: string;
    orderBy: OrderBy;
    offset: number;
    limit: number;
  };
  onCardClick: (uId: string) => void;
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['bizcards', searchParams],
    queryFn: () => fetchBizcards(searchParams)
  });

  if (isLoading) {
    return <Spinner size="xl" />;
  }

  if (isError) {
    return (
      <Alert status="error">
        <AlertIcon />
        Failed to load business cards.
      </Alert>
    );
  }

  return (
    <Box>
      {data?.bizcards && data.bizcards.length > 0 ? (
        data.bizcards.map((bizCard) => (
          <BizCard key={bizCard.u_id} bizCard={bizCard} onCardClick={onCardClick} />
        ))
      ) : (
        <Text mt={4}>검색 결과가 없습니다.</Text>
      )}
    </Box>
  );
};

export const Route = createFileRoute('/_layout/biz')({
  component: () => {
    // 사용자가 입력한 검색 정보(즉시 쿼리X)
    const [localQuery, setLocalQuery] = useState('');
    const [localOrderBy, setLocalOrderBy] = useState<OrderBy>('updated_at');

    // 실제 쿼리에 사용될 검색 파라미터
    // limit/offset 변경 시 즉시 반영(페이지네이션, 콤보박스)
    // query/orderBy는 검색 버튼 누를 때만 반영
    const [searchParams, setSearchParams] = useState({
      query: '',
      orderBy: 'updated_at' as OrderBy,
      limit: 10,
      offset: 0
    });

    // Drawer 열림/닫힘 관리: useDisclosure
    const { isOpen, onOpen, onClose } = useDisclosure();

    // 선택된 명함 ID
    const [selectedBizCardId, setSelectedBizCardId] = useState<string | null>(null);

    // 카드 클릭 -> 드로어 열기
    const handleCardClick = (uId: string) => {
      setSelectedBizCardId(uId);
      onOpen(); // 열기
    };

    // [검색] 버튼 or 엔터 -> query/orderBy 반영
    const handleSearch = () => {
      setSearchParams((prev) => ({
        ...prev,
        query: localQuery,
        orderBy: localOrderBy,
        offset: 0 // 새로운 검색이면 offset은 0
      }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    };

    // limit 콤보박스 변경 시 즉시 적용, offset은 0
    const handleChangeLimit = (newLimit: number) => {
      setSearchParams((prev) => ({
        ...prev,
        limit: newLimit,
        offset: 0
      }));
    };

    // 이전페이지
    const handlePrevPage = () => {
      setSearchParams((prev) => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit)
      }));
    };

    // 다음페이지
    const handleNextPage = () => {
      setSearchParams((prev) => ({
        ...prev,
        offset: prev.offset + prev.limit
      }));
    };

    // 초기화
    const handleReset = () => {
      setLocalQuery('');
      setLocalOrderBy('updated_at');
      setSearchParams({
        query: '',
        orderBy: 'updated_at',
        limit: 10,
        offset: 0
      });
    };

    return (
      <Box p={6}>
        <Heading as="h1" size="lg" mb={6}>
          Business Cards
        </Heading>

        {/* 검색 영역 */}
        <Flex mb={4} gap={2} flexWrap="wrap" align="center">
          {/* query */}
          <Input
            placeholder="검색어"
            w="180px"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* orderBy → 사용자친화적 라벨 */}
          <Select
            w="120px"
            value={localOrderBy}
            onChange={(e) => setLocalOrderBy(e.target.value as OrderBy)}
          >
            <option value="created_at">생성 순</option>
            <option value="updated_at">수정 순</option>
          </Select>

          {/* 검색 버튼 */}
          <IconButton
            aria-label="Search"
            icon={<Search2Icon />}
            onClick={handleSearch}
            colorScheme="blue"
          />

          {/* limit 콤보박스 (10 or 20) */}
          <Select
            w="120px"
            value={searchParams.limit}
            onChange={(e) => handleChangeLimit(parseInt(e.target.value, 10))}
          >
            <option value={10}>10개씩 보기</option>
            <option value={20}>20개씩 보기</option>
          </Select>

          {/* 페이지네이션 (이전/다음) */}
          <IconButton
            aria-label="Previous page"
            icon={<ChevronLeftIcon />}
            onClick={handlePrevPage}
            variant="outline"
            isDisabled={searchParams.offset === 0}
          />
          <IconButton
            aria-label="Next page"
            icon={<ChevronRightIcon />}
            onClick={handleNextPage}
            variant="outline"
          />

          {/* 초기화 버튼 */}
          <Button onClick={handleReset} variant="outline" colorScheme="gray">
            초기화
          </Button>
        </Flex>

        {/* 명함 리스트 */}
        <BizcardsList searchParams={searchParams} onCardClick={handleCardClick} />

        {/* 명함 수정 드로어 (useDisclosure로 관리) */}
        <CheckClientDrawer
          isOpen={isOpen}
          onClose={onClose}          // Drawer 닫기
          bizCardId={selectedBizCardId}
        />
      </Box>
    );
  }
});