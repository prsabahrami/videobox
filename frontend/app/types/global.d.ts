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
    createdAt: string;
    user: User;
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
    starts: string | null;
    expires: string | null;
    createdAt: string;
  }

  interface NewVideoShare {
    videoId: ID;
    sharedBy: ID;
    sharedWith: string | null;
    shareToken: string;
    starts: string | null;
    expires: string | null;
  }

  interface ShareVideoRequest {
    videoId: ID;
    sharedWith: string | null;
    starts: string | null;
    expires: string | null;
  }

  interface AccessTokenClaims {
    sub: ID;
    role: Role;
    exp: number;
  }
}

export {};
