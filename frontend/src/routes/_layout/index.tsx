import {
  Box,
  Container,
  Text,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Flex,
  Badge,
  CircularProgress,
  CircularProgressLabel,
  SimpleGrid,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UsersService, ProjectProgressResponse, DashboardService } from "../../client";

// (우선순위별로 배지 색상 등을 분기하기 위한 예시)
function getPriorityColorScheme(priority: string) {
  switch (priority) {
    case "critical":
      return "red";
    case "high":
      return "orange";
    case "medium":
      return "green";
    default:
      return "gray";
  }
}

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
});

function Dashboard() {
  const [user, setUser] = useState<{
    id?: string;
    name?: string;
    user_type?: string;
  } | null>(null);

  const [project, setProject] = useState<ProjectProgressResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 사용자 정보 로드
  useEffect(() => {
    UsersService.getMeApiV1UsersMeGet()
      .then((response) => {
        setUser(response);
      })
      .catch((err) => {
        console.error(err);
        setError("사용자 정보를 불러오는 데 실패했습니다.");
      });
  }, []);

  // 프로젝트 목록 로드
  useEffect(() => {
    DashboardService.getProjectProgressApiV1DashboardProgressGet()
      .then((response) => {
        setProject(response);
      })
      .catch((err) => {
        console.error(err);
        setError("프로젝트 정보를 불러오는 데 실패했습니다.");
      });
  }, [user]);

  // 사용자 유형 한글 라벨
  const getUserTypeLabel = (userType?: string) => {
    switch (userType) {
      case "student":
        return "학생";
      case "teacher":
        return "선생님";
      case "admin":
        return "관리자";
      case "guest":
        return "게스트";
      default:
        return "알 수 없는 사용자 유형";
    }
  };

  // UNIX 타임스탬프(초 단위) -> 날짜 포맷
  const formatUnixTime = (unixTime: number) => {
    if (!unixTime) return "";
    const date = new Date(unixTime * 1000);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <Container maxW="container.lg" py={6}>
      {/* 사용자 정보 영역 */}
      <Box mb={8}>
        {error ? (
          <Text color="red.500" fontSize="lg">
            {error}
          </Text>
        ) : user ? (
          <>
            <Text fontSize="2xl">
              안녕하세요, {user.name || user.id}님 👋🏼
            </Text>
            <Text fontSize="lg">
              현재 사용자 유형: {getUserTypeLabel(user.user_type)}
            </Text>
            <Text mt={2}>프로젝트에 오신 것을 환영합니다!</Text>
          </>
        ) : (
          <Text>사용자 정보를 불러오는 중...</Text>
        )}
      </Box>

      {/* 프로젝트 목록 시각화 영역 */}
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          프로젝트 현황
        </Text>

        {project && project.projects ? (
          <SimpleGrid columns={[1, 1, 2]} spacing={4}>
            {project.projects.map((p) => (
              <Card key={p.u_id} variant="outline">
                <CardHeader>
                  <Flex align="center" justify="space-between">
                    <Heading as="h3" size="sm" noOfLines={1}>
                      {p.title}
                    </Heading>
                    <Badge colorScheme={getPriorityColorScheme(p.priority || "")}>
                      {p.priority}
                    </Badge>
                  </Flex>
                </CardHeader>
                <CardBody>
                  {/* 날짜 구간 */}
                  <Text fontSize="sm" color="gray.600">
                    {formatUnixTime(p.start_date)} ~ {formatUnixTime(p.end_date)}
                  </Text>

                  {/* 도넛 형태 진행도 */}
                  <Flex mt={4} align="center" justify="center">
                    {/* thickness를 크게 해서 '도넛' 느낌을 줌 */}
                    <CircularProgress
                      size="80px"
                      thickness="10px"
                      value={p.progress}
                      color="blue.400"
                      trackColor="gray.100"
                    >
                      <CircularProgressLabel fontSize="xs">
                        {p.progress.toFixed(0)}%
                      </CircularProgressLabel>
                    </CircularProgress>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Text>프로젝트 정보를 불러오는 중...</Text>
        )}
      </Box>
    </Container>
  );
}