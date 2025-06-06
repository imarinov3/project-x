import { Box, Heading, Text } from '@chakra-ui/react';

const Home = () => {
  return (
    <Box>
      <Heading as="h1" mb={4}>
        Welcome to Mountain Trekking
      </Heading>
      <Text fontSize="lg">
        Join exciting trekking events or create your own adventure!
      </Text>
    </Box>
  );
};

export default Home; 