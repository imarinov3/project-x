import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';

interface FormData {
  title: string;
  description: string;
  date: string;
  location: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
  duration: string;
  maxParticipants: string;
  meetingPoint: string;
}

interface EventResponse {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
  duration: string;
  maxParticipants?: number;
  meetingPoint: string;
  organizerId: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const CreateEvent = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: '',
    location: '',
    difficulty: 'moderate',
    duration: '',
    maxParticipants: '',
    meetingPoint: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuthenticator((context) => [context.user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      const requiredFields: (keyof FormData)[] = ['title', 'description', 'date', 'location', 'difficulty', 'duration', 'meetingPoint'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const { tokens } = await fetchAuthSession();
      console.log('Auth session:', { 
        hasAccessToken: !!tokens?.accessToken,
        tokenExpiration: tokens?.accessToken?.payload?.exp
      });
      
      if (!tokens?.accessToken) {
        throw new Error('No access token available - please sign in again');
      }

      const eventData = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants, 10) : undefined,
      };

      console.log('Sending event data:', eventData);

      // Get the JWT token string
      const jwtToken = tokens.accessToken.toString();
      console.log('Authorization header:', `Bearer ${jwtToken}`);

      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
          'Origin': 'http://localhost:3000'
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          headers: Array.from(response.headers.entries()),
          url: response.url,
          type: response.type,
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as EventResponse;
      
      toast({
        title: 'Event created',
        description: 'Your trekking event has been created successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate(`/event/${data.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      
      // Check if error is an authentication error
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const isAuthError = errorMessage.toLowerCase().includes('token') || 
                         errorMessage.toLowerCase().includes('auth') ||
                         errorMessage.toLowerCase().includes('sign in');
      
      toast({
        title: 'Error',
        description: isAuthError ? 'Please sign in again to continue.' : 'Failed to create the event. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      if (isAuthError) {
        navigate('/signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box maxW="2xl" mx="auto">
      <Heading as="h1" mb={6}>
        Create New Trekking Event
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Event title"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Event description"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Date</FormLabel>
            <Input
              name="date"
              type="datetime-local"
              value={formData.date}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Location</FormLabel>
            <Input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Event location"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Difficulty</FormLabel>
            <Select name="difficulty" value={formData.difficulty} onChange={handleChange}>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
              <option value="extreme">Extreme</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Duration</FormLabel>
            <Input
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 4 hours, 2 days"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Maximum Participants</FormLabel>
            <Input
              name="maxParticipants"
              type="number"
              value={formData.maxParticipants}
              onChange={handleChange}
              placeholder="Leave empty for unlimited"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Meeting Point</FormLabel>
            <Input
              name="meetingPoint"
              value={formData.meetingPoint}
              onChange={handleChange}
              placeholder="Detailed meeting location"
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            size="lg"
            isLoading={isLoading}
            loadingText="Creating..."
          >
            Create Event
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CreateEvent; 