import React, { useState, useEffect, useCallback } from 'react'

const GRID_ROWS = 20
const GRID_COLS = 30
const START_NODE = { row: 0, col: 0 }
const END_NODE = { row: GRID_ROWS - 1, col: GRID_COLS - 1 }

const createNode = (row, col) => ({
  row,
  col,
  isStart: row === START_NODE.row && col === START_NODE.col,
  isEnd: row === END_NODE.row && col === END_NODE.col,
  distance: Infinity,
  isVisited: false,
  isWall: false,
  previousNode: null,
})

const createInitialGrid = () => {
  const grid = []
  for (let row = 0; row < GRID_ROWS; row++) {
    const currentRow = []
    for (let col = 0; col < GRID_COLS; col++) {
      currentRow.push(createNode(row, col))
    }
    grid.push(currentRow)
  }
  return grid
}

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice()
  const node = newGrid[row][col]
  const newNode = {
    ...node,
    isWall: !node.isWall,
  }
  newGrid[row][col] = newNode
  return newGrid
}

const getUnvisitedNeighbors = (node, grid) => {
  const neighbors = []
  const { col, row } = node
  if (row > 0) neighbors.push(grid[row - 1][col])
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col])
  if (col > 0) neighbors.push(grid[row][col - 1])
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1])
  return neighbors.filter(neighbor => !neighbor.isVisited)
}

const dijkstra = (grid) => {
  const startNode = grid[START_NODE.row][START_NODE.col]
  const endNode = grid[END_NODE.row][END_NODE.col]
  const visitedNodesInOrder = []
  startNode.distance = 0
  const unvisitedNodes = getAllNodes(grid)

  while (unvisitedNodes.length) {
    sortNodesByDistance(unvisitedNodes)
    const closestNode = unvisitedNodes.shift()
    if (closestNode.isWall) continue
    if (closestNode.distance === Infinity) return { visitedNodesInOrder, nodesInShortestPathOrder: [] }
    closestNode.isVisited = true
    visitedNodesInOrder.push(closestNode)
    if (closestNode === endNode) return { visitedNodesInOrder, nodesInShortestPathOrder: getNodesInShortestPathOrder(endNode) }
    updateUnvisitedNeighbors(closestNode, grid)
  }
  return { visitedNodesInOrder, nodesInShortestPathOrder: [] }
}

const sortNodesByDistance = (unvisitedNodes) => {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance)
}

const updateUnvisitedNeighbors = (node, grid) => {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid)
  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + 1
    neighbor.previousNode = node
  }
}

const getAllNodes = (grid) => {
  const nodes = []
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node)
    }
  }
  return nodes
}

const getNodesInShortestPathOrder = (finishNode) => {
  const nodesInShortestPathOrder = []
  let currentNode = finishNode
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode)
    currentNode = currentNode.previousNode
  }
  return nodesInShortestPathOrder
}

export default function Algo() {
  const [grid, setGrid] = useState([])
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    setGrid(createInitialGrid())
  }, [])

  const handleMouseDown = (row, col) => {
    const newGrid = getNewGridWithWallToggled(grid, row, col)
    setGrid(newGrid)
  }

  const animateDijkstra = useCallback((visitedNodesInOrder, nodesInShortestPathOrder) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder)
        }, 10 * i)
        return
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i]
        setGrid(prevGrid => {
          const newGrid = prevGrid.slice()
          const newNode = {
            ...node,
            isVisited: true,
          }
          newGrid[node.row][node.col] = newNode
          return newGrid
        })
      }, 10 * i)
    }
  }, [])

  const animateShortestPath = (nodesInShortestPathOrder) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i]
        setGrid(prevGrid => {
          const newGrid = prevGrid.slice()
          const newNode = {
            ...node,
            isInShortestPath: true,
          }
          newGrid[node.row][node.col] = newNode
          return newGrid
        })
      }, 50 * i)
    }
    setTimeout(() => {
      setIsRunning(false)
    }, 50 * nodesInShortestPathOrder.length)
  }

  const visualizeDijkstra = () => {
    if (isRunning) return
    setIsRunning(true)
    const { visitedNodesInOrder, nodesInShortestPathOrder } = dijkstra(grid)
    animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder)
  }

  const resetGrid = () => {
    if (isRunning) return
    setGrid(createInitialGrid())
  }

  return (
    <div className="p-6 w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dijkstra's Algorithm Visualizer</h1>
      <div className="mb-4">
        <button onClick={visualizeDijkstra} disabled={isRunning} className="mr-2 p-2 bg-blue-500 text-white">
          Visualize Dijkstra's Algorithm
        </button>
        <button onClick={resetGrid} disabled={isRunning} className="p-2 bg-gray-500 text-white">
          Reset Grid
        </button>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}>
        {grid.map((row, rowIdx) =>
          row.map((node, nodeIdx) => {
            const { row, col, isStart, isEnd, isWall, isVisited, isInShortestPath } = node
            return (
              <div
                key={`${row}-${col}`}
                className={`w-6 h-6 border border-gray-300 ${
                  isStart
                    ? 'bg-green-500'
                    : isEnd
                    ? 'bg-red-500'
                    : isWall
                    ? 'bg-gray-700'
                    : isInShortestPath
                    ? 'bg-yellow-300'
                    : isVisited
                    ? 'bg-blue-300'
                    : ''
                } transition-colors duration-300 ease-in-out`}
                onMouseDown={() => handleMouseDown(row, col)}
              ></div>
            )
          })
        )}
      </div>
    </div>
  )
}
