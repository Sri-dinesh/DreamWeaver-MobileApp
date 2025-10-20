export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

export interface DreamEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  emotions: string[];
  lucid: boolean;
  date: string;
  userId: string;
}

export interface AudioFile {
  id: string;
  title: string;
  description: string;
  duration: number;
  url: string;
  category: 'meditation' | 'binaural' | 'nature' | 'guidance';
}

export interface SleepPlan {
  id: string;
  name: string;
  bedtime: string;
  wakeup: string;
  techniques: string[];
  active: boolean;
}

export interface Tag {
  id: string;
  name: string;
}

export interface SharedDream {
  id: string;
  title?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  comments: number;
  visibility: 'private' | 'public' | 'friends';
  emotion?: string;
  lucid: boolean;
  tags?: Tag[];
  author?: User;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<User>;
  checkAuthStatus: () => Promise<void>;
}

export interface SpiritChatMessage {
  id: number;
  user_id: string;
  user_message: string;
  ai_response: string;
  timestamp: string;
}

export interface SpiritChatResponse {
  id: number;
  user_message: string;
  ai_response: string;
  timestamp: string;
}
