import { v4 } from 'uuid'
import { StyleSheet, css } from 'aphrodite'
import { useState, useContext, useEffect } from 'react'
import { AppContext } from './context'
import { Level } from './types'


const Matches = () => {
  const { tree, current, setCurrent } = useContext(AppContext)

  const [winner, setWinner] = useState<'c' | 'h' | null>(null)

  const [state, setState] = useState<number[]>([])

  const [cmove, setCmove] = useState(false)

  useEffect(() => {
    const node = tree.find((r) => r.id === current)!

    setCmove(node.level === Level.MIN)
    setState(node.state)

    if (current === 'key') setWinner(null)
  }, [current, tree])

  useEffect(() => {
    const move = () => {
      const children = tree.filter((c) => c.parents.includes(current!))

      if (children.length === 0) setWinner('h')
      else {
        const max = children.find((c) => c.index === 1) || children[0]

        const current = max.id

        const _children = tree.filter((c) => c.parents.includes(current))

        setCmove(false)
        setCurrent(max.id)
        if (_children.length === 0) setWinner('c')
      }
    }

    if (cmove) move()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree, cmove, current])

  const stylesheet = StyleSheet.create({
    container: {
      height: 80,
      display: 'flex',
      alignItems: 'center',
      marginBottom: 25
    },
    match: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column'
    },
    head: {
      borderRadius: '50%',
      width: 20, height: 20,
      backgroundColor: '#ff0000'
    },
    stick: {
      width: 10, height: 60,
      backgroundColor: '#ffdd00'
    },
    separator: {
      border: 'none',
      width: 15, height: '100%',
      backgroundColor: 'transparent'
    },
    space: {
      width: 40,
      height: '100%',
      flexShrink: 0
    },
    res: {
      fontSize: 16,
      color: '#000',
      fontWeight: 600,
      marginBottom: 16
    },
    btn: {
      padding: 12,
      border: 'none',
      color: '#fff',
      marginRight: 16,
      borderRadius: 8,
      pointer: 'cursor',
      display: 'inline-flex',
      backgroundColor: '#000',
      fontWeight: 600, fontSize: 12,
    }
  })

  const getContent = () => {
    const output: JSX.Element[] = []

    state.forEach((s) => {
      if (s > 2) {
        for (let i = 1; i <= s; i++) {
          output.push(
            <div
              key={v4()}
              className={css(stylesheet.match)}
            >
              <div className={css(stylesheet.head)} />
              <div className={css(stylesheet.stick)} />
            </div>
          )

          if (i < s) {
            const onClick = () => {
              const st = [...state]

              st.splice(st.indexOf(s))

              const ns = [...st, i, (s - i)].sort((s1, s2) => s1 - s2)

              const step = tree.find((p) => (
                ns.length === p.state.length &&
                p.state.every((v, i) => v === ns[i])
              ))

              if (step) {
                setCurrent(step.id)
              }
            }

            output.push(
              <button
                key={v4()}
                {...{ onClick }}
                disabled={cmove}
                className={css(stylesheet.separator)}
              />
            )
          }
        }

        output.push(
          <div
            key={v4()}
            className={css(stylesheet.space)}
          />
        )
      } else {
        for (let i = 1; i <= s; i++) {
          output.push(
            <div
              key={v4()}
              className={css(stylesheet.match)}
            >
              <div className={css(stylesheet.head)} />
              <div className={css(stylesheet.stick)} />
            </div>
          )

          if (i < s) {
            output.push(
              <div
                key={v4()}
                className={css(stylesheet.separator)}
              />
            )
          }
        }

        output.push(
          <div
            key={v4()}
            className={css(stylesheet.space)}
          />
        )
      }
    })

    return output
  }

  return (
    <>
      <div className={css(stylesheet.container)}>
        {getContent()}
      </div>
      <div className={css(stylesheet.res)}>
        {
          winner === 'c'
            ? 'Computer won'
            : winner === 'h'
              ? 'Human won'
              : `It's ${cmove ? "Computer's" : 'Your'} turn`
        }
      </div>
      {
        winner && (
          <button
            className={css(stylesheet.btn)}
            onClick={() => setCurrent('key')}
          >
            Replay!
          </button>
        )
      }
    </>
  )
}


export default Matches