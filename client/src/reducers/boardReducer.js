// Action Types
export const SET_USERNAME = 'SET_USERNAME';
export const SET_JOINED = 'SET_JOINED';
export const SET_USERS = 'SET_USERS';
export const SET_USER_COLORS = 'SET_USER_COLORS';
export const SET_COLOR = 'SET_COLOR';
export const SET_THICKNESS = 'SET_THICKNESS';
export const SET_ERASER_SIZE = 'SET_ERASER_SIZE';
export const SET_IS_DRAWING = 'SET_IS_DRAWING';
export const SET_IS_ERASER = 'SET_IS_ERASER';
export const SET_MOUSE_POSITION = 'SET_MOUSE_POSITION';
export const UPDATE_USER_COLOR = 'UPDATE_USER_COLOR';
export const CLEAR_CANVAS = 'CLEAR_CANVAS';

// Initial State
const initialState = {
  username: '',
  isJoined: false,
  users: [],
  userColors: {},
  color: '#000000',
  thickness: 3,
  eraserSize: 20,
  isDrawing: false,
  isEraser: false,
  mousePosition: { x: 0, y: 0 }
};

// Reducer
export function boardReducer(state, action) {
  switch (action.type) {
    case SET_USERNAME:
      return { ...state, username: action.payload };
    case SET_JOINED:
      return { ...state, isJoined: action.payload };
    case SET_USERS:
      return { ...state, users: action.payload };
    case SET_USER_COLORS:
      return { ...state, userColors: action.payload };
    case SET_COLOR:
      return { ...state, color: action.payload };
    case SET_THICKNESS:
      return { ...state, thickness: action.payload };
    case SET_ERASER_SIZE:
      return { ...state, eraserSize: action.payload };
    case SET_IS_DRAWING:
      return { ...state, isDrawing: action.payload };
    case SET_IS_ERASER:
      return { ...state, isEraser: action.payload };
    case SET_MOUSE_POSITION:
      return { ...state, mousePosition: action.payload };
    case UPDATE_USER_COLOR:
      return {
        ...state,
        userColors: {
          ...state.userColors,
          [action.payload.username]: action.payload.color
        }
      };
    case CLEAR_CANVAS:
      return state;
    default:
      return state;
  }
} 