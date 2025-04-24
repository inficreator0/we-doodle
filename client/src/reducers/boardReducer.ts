import { BoardState, BoardAction } from '../types'

export const SET_USERNAME = 'SET_USERNAME'
export const SET_JOINED = 'SET_JOINED'
export const SET_USERS = 'SET_USERS'
export const SET_COLOR = 'SET_COLOR'
export const SET_THICKNESS = 'SET_THICKNESS'
export const SET_IS_DRAWING = 'SET_IS_DRAWING'
export const SET_MOUSE_POSITION = 'SET_MOUSE_POSITION'
export const UPDATE_USER_COLOR = 'UPDATE_USER_COLOR'
export const CLEAR_CANVAS = 'CLEAR_CANVAS'

export const initialState: BoardState = {
  username: '',
  isJoined: false,
  users: [],
  userColors: {},
  color: '#000000',
  thickness: 3,
  isDrawing: false,
  mousePosition: { x: 0, y: 0 },
}

export function boardReducer(
  state: BoardState,
  action: BoardAction
): BoardState {
  switch (action.type) {
    case SET_USERNAME:
      return { ...state, username: action.payload }
    case SET_JOINED:
      return { ...state, isJoined: action.payload }
    case SET_USERS:
      return { ...state, users: action.payload }
    case SET_COLOR:
      return { ...state, color: action.payload }
    case SET_THICKNESS:
      return { ...state, thickness: action.payload }
    case SET_IS_DRAWING:
      return { ...state, isDrawing: action.payload }
    case SET_MOUSE_POSITION:
      return { ...state, mousePosition: action.payload }
    case UPDATE_USER_COLOR:
      return {
        ...state,
        userColors: {
          ...state.userColors,
          [action.payload.username]: action.payload.color,
        },
      }
    case CLEAR_CANVAS:
      return { ...state }
    default:
      return state
  }
}
