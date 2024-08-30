declare global {

    type Role = 'Student' | 'Coach' | 'Any';
    type ID = number;

  interface User {
    id: ID;
    email: string;
    activated: boolean;
    createdAt: string;
    updatedAt: string;
    role: Role;
  }

  interface Video {
    id: ID;
    userId: ID;
    fileName: string;
    courseId: ID;
    streamURL: string;
    createdAt: string;
    user: User;
  }
  

  interface VideoWithSignedUrl {
    id: ID;
    fileName: string;
    courseName: string;
    playbackId: string;
    createdAt: string;
    duration: number;
  }

  interface Course {
    id: ID;
    name: string;
    description: string;
    userId: ID;
    createdAt: string;
    user: User;
  }

  interface VideoShare {
    videoId: ID;
    sharedBy: ID;
    sharedWith: string | null;
    shareToken: string;
    courseName: string;
    starts: string | null;
    expires: string | null;
    createdAt: string;
  }

  interface NewVideoShare {
    videoId: ID;
    sharedBy: ID;
    sharedWith: string | null;
    shareToken: string;
    courseName: string;
    starts: string | null;
    expires: string | null;
  }

  interface ShareVideoRequest {
    videoId: ID;
    sharedWith: string | null;
    courseName: string;
    starts: string | null;
    expires: string | null;
  }

  interface AccessTokenClaims {
    sub: ID;
    role: Role;
    exp: number;
  }

  interface Session {
    id: ID;
    userId: ID;
    refreshToken: string;
    createdAt: string;
    updatedAt: string;
  }
}

export {};
