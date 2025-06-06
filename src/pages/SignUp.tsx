import { Box } from '@chakra-ui/react';
import { Authenticator } from '@aws-amplify/ui-react';

const SignUp = () => {
  return (
    <Box maxW="md" mx="auto">
      <Authenticator initialState="signUp" />
    </Box>
  );
};

export default SignUp; 