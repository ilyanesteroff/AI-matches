import { v4 } from 'uuid'
import { css, StyleSheet } from 'aphrodite'
import { useState, useEffect, useCallback } from 'react'
import { Level, State } from './types'
import { AppContext } from './context'
import Matches from './Matches'


function App() {
  const [current, setCurrent] = useState<string | null>(null)
  const [subtree, setSubtree] = useState<State[]>([])
  const [level, setLevel] = useState(Level.MIN)
  const [tree, setTree] = useState<State[]>([])
  const [matches, setMatches] = useState(7)

  const getSeries = (n: number) => {
    const output: number[][] = []

    if (n > 2) {
      let start = 1

      while (start < (n / 2)) {
        output.push([n - start, start])

        start += 1
      }
    }

    return output
  }

  const peerAlreadyExists = (peers: State[], peer: State) => {
    const state = peer.state
      .sort((s1, s2) => s1 - s2)

    return (
      peers.some((p) => (
        state.length === p.state.length &&
        p.state
          .sort((s1, s2) => s1 - s2)
          .every((v, i) => v === state[i])
      ))
    )
  }

  const createChildren = useCallback((parent: State) => {
    const output: State[] = []

    parent.state.forEach((s) => {
      const options = getSeries(s)

      options.forEach((o) => {
        const ps = [...parent.state]

        const index = ps.indexOf(s)

        ps.splice(index, 1)

        const state = [...ps, ...o]

        const peer: State = {
          index: 0,
          layer: parent.layer + 1, state,
          children: [], parents: [parent.id],
          level: parent.level === Level.MAX
            ? Level.MIN
            : Level.MAX,
          id: v4(),
        }

        const exists = peerAlreadyExists(output, peer)

        if (!exists) output.push(peer)
      })
    })

    return output
  }, [])

  const getChildren = useCallback((tree: State[], parent: State) => {
    const children = createChildren(parent)

    if (children.length > 0) {
      children.forEach((c) => {
        tree.push(c)

        getChildren(tree, c)
      })
    }
  }, [createChildren])

  const findChildren = useCallback((peer: State, tree: State[]) => {
    const child = createChildren(peer)

    const children = tree.filter((t) =>
      peerAlreadyExists(child, t)
    )

    return children
  }, [createChildren])

  const runMinMax = useCallback((tree: State[], level: Level) => {
    let layer = 0

    tree.forEach((l) => {
      if (l.layer > layer) layer = l.layer
    })

    while (layer > -1) {
      const points = tree.filter((t) => t.layer === layer)

      if (points.length > 0) {
        points.forEach((p) => {
          const index = tree.findIndex((t) => t.id === p.id)

          const children = tree.filter((t) => p.children.includes(t.id))

          tree[index].index = children.length > 0
            ? p.level === Level.MIN
              ? Math.min(...children.map((c) => c.index))
              : Math.max(...children.map((c) => c.index))
            : p.level === level
              ? 1
              : -1
        })
      }

      layer -= 1
    }
  }, [])

  const getTree = useCallback((
    id: string,
    level: Level,
    state: number[]
  ) => {
    const root: State = {
      state, index: 0,
      id, level, layer: 0,
      parents: [], children: []
    }

    let tree = [root]

    getChildren(tree, root)

    tree.sort((t1, t2) => t1.layer - t2.layer)

    tree.forEach((t, i) => {
      const exists = peerAlreadyExists(
        tree.filter((t1) => t.id !== t1.id), t
      )

      if (exists) tree = tree.filter((tr) => tr.id !== t.id)
    })

    tree.forEach((t, i) => {
      const children = findChildren(t, tree)

      tree[i].children = children.map((c) => c.id)

      children.forEach((c) => {
        const index = tree.findIndex((t) => t.id === c.id)

        if (index > -1) {
          const parents = Array.from(
            new Set(
              [...tree[index].parents, t.id],
            )
          )

          tree[index].parents = parents
        }
      })
    })

    runMinMax(tree, level)

    return tree
  }, [findChildren, getChildren, runMinMax])

  useEffect(() => {
    const tree = getTree('key', level, [matches])

    setCurrent('key')
    setSubtree(tree)
    setTree(tree)
  }, [level, matches, getTree])

  const stylesheet = StyleSheet.create({
    container: {
      padding: 30,
      maxWidth: 600,
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    label: {
      fontSize: 25,
      color: '#000',
      marginBottom: 16
    },
    text: {
      fontSize: 15,
      color: '#333',
      marginBottom: 26
    },
    flex: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      marginBottom: 20
    },
    button: {
      width: 40,
      height: 40,
      padding: 8,
      borderRadius: '50%',
      border: 'solid 1px #000',
      backgroundColor: 'transparent',
    },
    number: {
      display: 'inline-flex',
      marginLeft: 20,
      marginRight: 20
    },
    input: {
      width: 200,
      padding: 12,
      borderRadius: 8,
      border: 'solid 1px #000',
    },
    section: {
      fontSize: 18,
      color: '#333',
      marginBottom: 16
    },
    starter: {
      padding: 8,
      color: '#000',
      marginRight: 16,
      borderRadius: 12,
      pointer: 'cursor',
      display: 'inline-flex',
      border: 'solid 1px #000',
      backgroundColor: 'transparent',
      fontWeight: 600, fontSize: 12,
      ':disabled': {
        backgroundColor: '#000',
        color: '#fff'
      }
    }
  })

  const onAdd = () => {
    setMatches((m) => m + 1)
  }

  const onSubtract = () => {
    setMatches((m) => m - 1)
  }

  return (
    <AppContext.Provider value={{
      setCurrent, level, tree,
      current, matches, subtree
    }}>
      <div className={css(stylesheet.container)}>
        <div className={css(stylesheet.label)}>
          Split the matches
        </div>
        <div className={css(stylesheet.text)}>
          During each move players divide sequences of matches in 2 unequal parts, sequence that consists of at least 3 matches can be devided, the winner is the user who had divided the last sequence with 3+ matches
        </div>
        <>
          <div className={css(stylesheet.section)}>
            Matches
          </div>
          <div className={css(stylesheet.flex)}>
            <button
              className={css(stylesheet.button)}
              disabled={matches === 5}
              onClick={onSubtract}
            >
              -
            </button>
            <span className={css(stylesheet.number)}>
              {matches}
            </span>
            <button
              className={css(stylesheet.button)}
              disabled={matches === 12}
              onClick={onAdd}
            >
              +
            </button>
          </div>
          <div className={css(stylesheet.section)}>
            Who starts
          </div>
          <div className={css(stylesheet.flex)}>
            <button
              className={css(stylesheet.starter)}
              onClick={() => setLevel(Level.MIN)}
              disabled={level === Level.MIN}
            >
              Computer
            </button>
            <button
              className={css(stylesheet.starter)}
              onClick={() => setLevel(Level.MAX)}
              disabled={level === Level.MAX}
            >
              Human
            </button>
          </div>
        </>
        {tree.length > 0 && !!current && <Matches />}
      </div>
    </AppContext.Provider>
  )
}


export default App
