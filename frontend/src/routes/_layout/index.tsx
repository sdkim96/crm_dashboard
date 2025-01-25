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
  Progress,
  SimpleGrid
} from "@chakra-ui/react";
import { WarningTwoIcon, CheckCircleIcon, TimeIcon } from "@chakra-ui/icons";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DefaultService, ProjectProgressResponse } from "../../client";

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

  // 사용자 정보
  useEffect(() => {
    DefaultService.getMeApiV1UsersMeGet()
      .then((response) => {
        setUser(response);
      })
      .catch((err) => {
        console.error(err);
        setError("사용자 정보를 불러오는 데 실패했습니다.");
      });
  }, []);

  // 프로젝트 목록 정보
  useEffect(() => {
    DefaultService.getProjectProgressApiV1DashboardProgressGet()
      .then((response) => {
        setProject(response);
      })
      .catch((err) => {
        console.error(err);
        setError("프로젝트 정보를 불러오는 데 실패했습니다.");
      });
  }, [user]);

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

  // 우선순위별 아이콘/색상 예시
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <WarningTwoIcon color="red.400" boxSize={5} />;
      case "high":
        return <CheckCircleIcon color="orange.400" boxSize={5} />;
      case "medium":
        return <TimeIcon color="green.400" boxSize={5} />;
      default:
        return <TimeIcon color="gray.400" boxSize={5} />;
    }
  };

  // 배지 색상 예시
  const getPriorityColorScheme = (priority: string) => {
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
  };

  // UNIX 타임스탬프(초 단위) -> YYYY.MM.DD
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

        {/* projects 배열을 카드 형태로 나열 (반응형 grid) */}
        {project && project.projects ? (
          <SimpleGrid columns={[1, 1, 2]} spacing={4}>
            {project.projects.map((p) => {
              return (
                <Card key={p.u_id} variant="outline">
                  <CardHeader pb={0}>
                    <Flex align="center" justify="space-between">
                      <Flex align="center" gap={2}>
                        {getPriorityIcon(p.priority || "")}
                        <Heading as="h3" size="sm">
                          {p.title}
                        </Heading>
                      </Flex>
                      <Badge colorScheme={getPriorityColorScheme(p.priority || "")}>
                        {p.priority}
                      </Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody pt={1}>
                    <Text fontSize="sm" color="gray.600">
                      {formatUnixTime(p.start_date)} ~ {formatUnixTime(p.end_date)}
                    </Text>

                    {/* 진행도 Progress 바 */}
                    <Box mt={2}>
                      <Progress
                        value={p.progress}
                        colorScheme="blue"
                        size="sm"
                        borderRadius="md"
                        mb={1}
                      />
                      <Text fontSize="xs" textAlign="right" color="gray.500">
                        {p.progress.toFixed(2)}%
                      </Text>
                    </Box>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
        ) : (
          <Text>프로젝트 정보를 불러오는 중...</Text>
        )}
      </Box>
    </Container>
  );
}