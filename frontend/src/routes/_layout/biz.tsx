import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardBody, CardHeader, Text, Box, Heading, VStack, Divider, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { DefaultService, BizClientDTO } from '../../client';

const BizCard = ({ bizCard }: { bizCard: BizClientDTO }) => {
  const { name, role, phone_number, email, company } = bizCard.biz_card;
  const { name: companyName, address, english_name, website } = company;

  return (
    <Card borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} m={4} shadow="md">
      <CardHeader>
        <Heading size="md">{name}</Heading>
        <Text fontSize="sm" color="gray.500">{role || 'No Role Provided'}</Text>
      </CardHeader>
      <Divider />
      <CardBody>
        <VStack align="start" spacing={2}>
          <Text><strong>Phone:</strong> {phone_number || 'No Phone Number'}</Text>
          <Text><strong>Email:</strong> {email || 'No Email'}</Text>
          <Text><strong>Company:</strong> {companyName}</Text>
          <Text><strong>Address:</strong> {address}</Text>
          {english_name && <Text><strong>English Name:</strong> {english_name}</Text>}
          {website && <Text><strong>Website:</strong> <a href={website} target="_blank" rel="noopener noreferrer">{website}</a></Text>}
        </VStack>
      </CardBody>
    </Card>
  );
};

const fetchBizcards = async () => {
  const response = await DefaultService.getBizcardsApiV1BizGet();
  return response;
};

const BizcardsList = () => {
  const { data, isLoading, isError } = useQuery({ queryKey: ['bizcards'], queryFn: fetchBizcards });

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
      {data && data.bizcards && data.bizcards.map((bizCard) => (
        <BizCard key={bizCard.u_id} bizCard={bizCard} />
      ))}
    </Box>
  );
};

export const Route = createFileRoute('/_layout/biz')({
  component: () => (
    <Box p={6}>
      <Heading as="h1" size="lg" mb={6}>Business Cards</Heading>
      <BizcardsList />
    </Box>
  ),
});
