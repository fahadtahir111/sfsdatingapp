export interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  age: number | null;
  occupation: string | null;
  bio: string;
  photos: string[];
  matchesCount: number;
  reelsCount: number;
  storiesCount: number;
  reels: {
    id: string;
    videoUrl: string;
    caption: string | null;
    likesCount: number;
    createdAt: Date | string;
  }[];
  membership: string;
  verificationStatus: string;
  networkingGoals: string[];
  tokens: number;
  professionalVerified: boolean;
  incognito: boolean;
  presence?: string;
}

export interface FriendData {
  id: string;
  friendId: string;
  name: string | null;
  image: string;
}

export interface PendingRequestData {
  id: string;
  senderUser: {
    id: string;
    name: string | null;
    profile?: { photos: string } | null;
  };
}
