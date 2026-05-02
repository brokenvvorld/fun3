import { useEffect, useRef } from 'react'
import { createGame } from '../../game/phaser/adapters/createGame'

export function PhaserStage() {
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!hostRef.current) {
      return
    }

    const game = createGame(hostRef.current)
    return () => {
      game.destroy(true)
    }
  }, [])

  return <div ref={hostRef} className="phaser-stage" aria-label="九号枢纽区背景场景" />
}
