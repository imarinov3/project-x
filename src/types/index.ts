export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface TrekkingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
  organizer: User;
  participants: User[];
  maxParticipants?: number;
  duration: string;
  requirements?: string[];
  meetingPoint: string;
  createdAt: string;
  updatedAt: string;
} 