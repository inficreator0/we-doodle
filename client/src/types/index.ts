export interface User {
  id: string;
  username: string;
  color: string;
}

export interface Board {
  name: string;
  activeUsers: User[];
  userCount: number;
  createdAt: Date;
}

export interface DrawingData {
  points: Point[];
  color: string;
  thickness: number;
  isEraser: boolean;
  username: string;
  timestamp: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface BoardState {
  username: string;
  isJoined: boolean;
  users: string[];
  userColors: Record<string, string>;
  color: string;
  thickness: number;
  isDrawing: boolean;
  mousePosition: Point;
}

export type BoardAction =
  | { type: 'SET_USERNAME'; payload: string }
  | { type: 'SET_JOINED'; payload: boolean }
  | { type: 'SET_USERS'; payload: string[] }
  | { type: 'SET_COLOR'; payload: string }
  | { type: 'SET_THICKNESS'; payload: number }
  | { type: 'SET_IS_DRAWING'; payload: boolean }
  | { type: 'SET_MOUSE_POSITION'; payload: Point }
  | { type: 'UPDATE_USER_COLOR'; payload: { username: string; color: string } }
  | { type: 'CLEAR_CANVAS' }; 