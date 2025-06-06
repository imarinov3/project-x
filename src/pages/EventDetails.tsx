import { Box, Button, Heading, Text, VStack, Badge, Flex } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

interface Event {
  title: string;
  description: string;
  date: string;
  location: string;
  difficulty: string;
  duration: string;
  maxParticipants: number;
  meetingPoint: string;
  participants: string[];
}

const EventDetails = () => {
  const { id } = useParams();
  // TODO: Fetch event details from AWS Amplify

  // Placeholder data
  const event: Event = {
    title: 'Mountain Trek Example',
    description: 'Join us for an exciting mountain trek!',
    date: '2024-07-01T09:00',
    location: 'Mount Example',
    difficulty: 'moderate',
    duration: '6 hours',
    maxParticipants: 20,
    meetingPoint: 'Example Parking Lot',
    participants: [],
  };

  const handleJoin = () => {
    // TODO: Implement join event functionality
    console.log('Joining event:', id);
  };

  return (
    <Box>
      <Heading as="h1" mb={6}>
        {event.title}
      </Heading>
      <VStack align="start" gap={4}>
        <Flex gap={2}>
          <Badge colorScheme="purple">{event.difficulty}</Badge>
          <Badge colorScheme="blue">{event.duration}</Badge>
          <Badge colorScheme="green">
            {event.participants.length}/{event.maxParticipants} participants
          </Badge>
        </Flex>

        <Text fontSize="lg">{event.description}</Text>

        <Text>
          <strong>Date:</strong> {new Date(event.date).toLocaleString()}
        </Text>
        <Text>
          <strong>Location:</strong> {event.location}
        </Text>
        <Text>
          <strong>Meeting Point:</strong> {event.meetingPoint}
        </Text>

        <Button colorScheme="teal" size="lg" onClick={handleJoin}>
          Join Event
        </Button>
      </VStack>
    </Box>
  );
};

export default EventDetails; 