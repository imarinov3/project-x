import { Box } from '@chakra-ui/react';
import { Authenticator } from '@aws-amplify/ui-react';

const SignIn = () => {
  return (
    <Box maxW="md" mx="auto">
      <Authenticator initialState="signIn" />
    </Box>
  );
};

export default SignIn; 