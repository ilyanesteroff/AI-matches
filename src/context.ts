import { createContext } from 'react'
import { Level, State } from './types'


export interface AppCtx {
  setCurrent: React.Dispatch<React.SetStateAction<string | null>>
  current: string | null
  subtree: State[]
  matches: number
  tree: State[]
  level: Level
}


export const AppContext = createContext<AppCtx>({
  setCurrent: () => { },
  level: Level.MIN,
  current: null,
  subtree: [],
  matches: 7,
  tree: []
})