import { createContext } from 'react'
import { Level, State } from './types'


export interface AppCtx {
  setCurrent: React.Dispatch<React.SetStateAction<string | null>>
  current: string | null
  matches: number
  tree: State[]
  level: Level
}


export const AppContext = createContext<AppCtx>({
  setCurrent: () => { },
  level: Level.MIN,
  current: null,
  matches: 7,
  tree: []
})
