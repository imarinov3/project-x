import { Box, Container, Flex, Link as ChakraLink, LinkProps, Button } from '@chakra-ui/react';
import { Link as RouterLink, LinkProps as RouterLinkProps, useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

interface LayoutProps {
  children: ReactNode;
}

const ChakraRouterLink = ({ to, ...props }: LinkProps & { to: string }) => (
  <ChakraLink as={RouterLink} to={to} {...props} />
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { authStatus, signOut } = useAuthenticator((context) => [context.authStatus]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <Box minH="100vh">
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding="1.5rem"
        bg="teal.500"
        color="white"
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <ChakraRouterLink to="/" fontSize="xl" fontWeight="bold">
              Mountain Trekking
            </ChakraRouterLink>
            <Flex gap={4} align="center">
              {authStatus === 'authenticated' && (
                <>
                  <ChakraRouterLink to="/create-event">
                    Create Event
                  </ChakraRouterLink>
                  <ChakraRouterLink to="/profile">
                    Profile
                  </ChakraRouterLink>
                  <Button
                    variant="outline"
                    colorScheme="white"
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              )}
              {authStatus !== 'authenticated' && (
                <ChakraRouterLink to="/signin">
                  Sign In
                </ChakraRouterLink>
              )}
            </Flex>
          </Flex>
        </Container>
      </Flex>
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout; 