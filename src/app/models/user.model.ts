export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role?: string;
  keycloakUserId?: string;
  // Add other fields as needed based on your backend User entity
} 