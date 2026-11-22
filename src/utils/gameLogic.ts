import { FLEET_TEMPLATES } from '../data/chemistryTopics';
import {
  AIDifficulty,
  BoardCell,
  ChemistryQuestion,
  ChemistryTopicId,
  Coordinate,
  Orientation,
  PlacedShip,
  PlayerBoardState,
  PlayerStats,
  ShipTemplate,
} from '../types/game';

export const GRID_SIZE = 10;
export const COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export function formatCoord(coord: Coordinate): string {
  return `${COLUMN_LABELS[coord.col]}${coord.row + 1}`;
}

export function createEmptyGrid(): BoardCell[][] {
  const grid: BoardCell[][] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    const rowCells: BoardCell[] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      rowCells.push({
        row,
        col,
        shipId: null,
        status: 'unshot',
      });
    }
    grid.push(rowCells);
  }
  return grid;
}

export function createInitialStats(): PlayerStats {
  return {
    shotsFired: 0,
    hits: 0,
    misses: 0,
    questionsAnswered: 0,
    questionsCorrect: 0,
    shieldDeflections: 0,
    shipsSunk: 0,
    topicAttempts: {},
  };
}

export function createEmptyPlayerState(id: 1 | 2, label: string): PlayerBoardState {
  return {
    id,
    label,
    grid: createEmptyGrid(),
    ships: [],
    stats: createInitialStats(),
  };
}

export function computeShipCells(
  start: Coordinate,
  size: number,
  orientation: Orientation
): Coordinate[] {
  const cells: Coordinate[] = [];
  for (let i = 0; i < size; i++) {
    cells.push({
      row: orientation === 'V' ? start.row + i : start.row,
      col: orientation === 'H' ? start.col + i : start.col,
    });
  }
  return cells;
}

export function canPlaceShip(
  grid: BoardCell[][],
  start: Coordinate,
  size: number,
  orientation: Orientation
): boolean {
  const cells = computeShipCells(start, size, orientation);
  for (const cell of cells) {
    if (cell.row < 0 || cell.row >= GRID_SIZE || cell.col < 0 || cell.col >= GRID_SIZE) {
      return false;
    }
    if (grid[cell.row][cell.col].shipId !== null) {
      return false;
    }
  }
  return true;
}

export function placeShipOnState(
  state: PlayerBoardState,
  template: ShipTemplate,
  start: Coordinate,
  orientation: Orientation,
  topicId: ChemistryTopicId
): PlayerBoardState {
  const cells = computeShipCells(start, template.size, orientation);
  const newGrid = state.grid.map((row) => row.map((cell) => ({ ...cell })));

  // Remove old placement if same ship existed
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newGrid[r][c].shipId === template.id) {
        newGrid[r][c].shipId = null;
      }
    }
  }

  for (const c of cells) {
    newGrid[c.row][c.col].shipId = template.id;
  }

  const placed: PlacedShip = {
    templateId: template.id,
    name: template.name,
    classLabel: template.classLabel,
    size: template.size,
    topicId,
    cells,
    hits: 0,
    sunk: false,
    orientation,
  };

  const remainingShips = state.ships.filter((s) => s.templateId !== template.id);
  return {
    ...state,
    grid: newGrid,
    ships: [...remainingShips, placed],
  };
}

export function removeShipFromState(
  state: PlayerBoardState,
  templateId: string
): PlayerBoardState {
  const newGrid = state.grid.map((row) =>
    row.map((cell) => (cell.shipId === templateId ? { ...cell, shipId: null } : { ...cell }))
  );
  return {
    ...state,
    grid: newGrid,
    ships: state.ships.filter((s) => s.templateId !== templateId),
  };
}

export function autoPlaceFleet(
  id: 1 | 2,
  label: string,
  shipTopics: Record<string, ChemistryTopicId>
): PlayerBoardState {
  let state = createEmptyPlayerState(id, label);

  for (const template of FLEET_TEMPLATES) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 300) {
      attempts++;
      const orientation: Orientation = Math.random() < 0.5 ? 'H' : 'V';
      const maxRow = orientation === 'V' ? GRID_SIZE - template.size : GRID_SIZE - 1;
      const maxCol = orientation === 'H' ? GRID_SIZE - template.size : GRID_SIZE - 1;
      const row = Math.floor(Math.random() * (maxRow + 1));
      const col = Math.floor(Math.random() * (maxCol + 1));
      if (canPlaceShip(state.grid, { row, col }, template.size, orientation)) {
        state = placeShipOnState(
          state,
          template,
          { row, col },
          orientation,
          shipTopics[template.id] ?? template.defaultTopicId
        );
        placed = true;
      }
    }
  }

  return state;
}

export function applyHitToDefender(
  defender: PlayerBoardState,
  coord: Coordinate
): {
  nextDefender: PlayerBoardState;
  hitShip: PlacedShip | null;
  wasSunk: boolean;
} {
  const newGrid = defender.grid.map((row) => row.map((cell) => ({ ...cell })));
  const cell = newGrid[coord.row][coord.col];

  if (!cell.shipId) {
    cell.status = 'miss';
    return {
      nextDefender: { ...defender, grid: newGrid },
      hitShip: null,
      wasSunk: false,
    };
  }

  cell.status = 'hit';
  let hitShip: PlacedShip | null = null;
  let wasSunk = false;

  const newShips = defender.ships.map((ship) => {
    if (ship.templateId !== cell.shipId) return ship;
    const nextHits = ship.cells.filter((sc) => newGrid[sc.row][sc.col].status === 'hit').length;
    const sunk = nextHits >= ship.size;
    wasSunk = sunk && !ship.sunk;
    const updated: PlacedShip = {
      ...ship,
      hits: nextHits,
      sunk,
    };
    hitShip = updated;
    return updated;
  });

  return {
    nextDefender: {
      ...defender,
      grid: newGrid,
      ships: newShips,
    },
    hitShip,
    wasSunk,
  };
}

export function markCellShielded(defender: PlayerBoardState, coord: Coordinate): PlayerBoardState {
  const newGrid = defender.grid.map((row) => row.map((cell) => ({ ...cell })));
  newGrid[coord.row][coord.col].status = 'shielded';
  return {
    ...defender,
    grid: newGrid,
  };
}

export function allShipsSunk(state: PlayerBoardState): boolean {
  return state.ships.length > 0 && state.ships.every((s) => s.sunk);
}

export function pickNextAIShot(
  targetGrid: BoardCell[][],
  ships: PlacedShip[],
  difficulty: AIDifficulty
): Coordinate {
  const available: Coordinate[] = [];
  const shieldedCells: Coordinate[] = [];
  const activeHitCells: Coordinate[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = targetGrid[r][c];
      if (cell.status === 'unshot') {
        available.push({ row: r, col: c });
      } else if (cell.status === 'shielded') {
        shieldedCells.push({ row: r, col: c });
      } else if (cell.status === 'hit') {
        const ship = ships.find((s) => s.templateId === cell.shipId);
        if (ship && !ship.sunk) {
          activeHitCells.push({ row: r, col: c });
        }
      }
    }
  }

  // On medium/hard, if a ship cell was previously shielded (known ship location), target it!
  if (difficulty !== 'easy' && shieldedCells.length > 0 && Math.random() < (difficulty === 'hard' ? 0.9 : 0.65)) {
    return shieldedCells[Math.floor(Math.random() * shieldedCells.length)];
  }

  // Target neighbors around unsunk hits
  if (difficulty !== 'easy' && activeHitCells.length > 0) {
    const candidateTargets: Coordinate[] = [];

    // On hard, look for aligned hits first
    if (difficulty === 'hard' && activeHitCells.length >= 2) {
      for (const h of activeHitCells) {
        const hasHorizontalNeighbor = activeHitCells.some(
          (other) => other.row === h.row && Math.abs(other.col - h.col) === 1
        );
        const hasVerticalNeighbor = activeHitCells.some(
          (other) => other.col === h.col && Math.abs(other.row - h.row) === 1
        );
        if (hasHorizontalNeighbor) {
          for (const dc of [-1, 1]) {
            const nr = h.row;
            const nc = h.col + dc;
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
              const st = targetGrid[nr][nc].status;
              if (st === 'unshot' || st === 'shielded') candidateTargets.push({ row: nr, col: nc });
            }
          }
        }
        if (hasVerticalNeighbor) {
          for (const dr of [-1, 1]) {
            const nr = h.row + dr;
            const nc = h.col;
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
              const st = targetGrid[nr][nc].status;
              if (st === 'unshot' || st === 'shielded') candidateTargets.push({ row: nr, col: nc });
            }
          }
        }
      }
    }

    if (candidateTargets.length === 0) {
      const dirs = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
      ];
      for (const h of activeHitCells) {
        for (const d of dirs) {
          const nr = h.row + d.dr;
          const nc = h.col + d.dc;
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            const st = targetGrid[nr][nc].status;
            if (st === 'unshot' || st === 'shielded') {
              candidateTargets.push({ row: nr, col: nc });
            }
          }
        }
      }
    }

    if (candidateTargets.length > 0) {
      return candidateTargets[Math.floor(Math.random() * candidateTargets.length)];
    }
  }

  // On hard, prefer checkerboard parity when hunting
  if (difficulty === 'hard' && available.length > 0) {
    const parityCells = available.filter((c) => (c.row + c.col) % 2 === 0);
    if (parityCells.length > 0) {
      return parityCells[Math.floor(Math.random() * parityCells.length)];
    }
  }

  const pool = [...available, ...shieldedCells];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickRandomQuestionForTopic(
  allQuestions: ChemistryQuestion[],
  topicId: ChemistryTopicId,
  usedQuestionIds: Set<string>
): ChemistryQuestion {
  const topicQuestions = allQuestions.filter((q) => q.topicId === topicId);
  const unused = topicQuestions.filter((q) => !usedQuestionIds.has(q.id));
  const pool = unused.length > 0 ? unused : topicQuestions;
  return pool[Math.floor(Math.random() * pool.length)];
}
