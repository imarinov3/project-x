import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useAuthenticator } from '@aws-amplify/ui-react';

const Profile = () => {
  const { user } = useAuthenticator((context) => [context.user]);

  const loginId = user?.signInDetails?.loginId;
  const isEmail = loginId?.includes('@') ?? false;

  return (
    <Box>
      <Heading as="h1" mb={6}>
        Profile
      </Heading>
      <VStack align="start" gap={4}>
        <Text>
          <strong>Email:</strong> {user?.username}
        </Text>
        <Text>
          <strong>Name:</strong> {loginId || 'Not set'}
        </Text>
        <Text>
          <strong>Phone:</strong> {isEmail ? 'Not set' : loginId || 'Not set'}
        </Text>
      </VStack>
    </Box>
  );
};

export default Profile; 