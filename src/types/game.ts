export type GameMode = 'classic' | 'quiz';
export type OpponentType = 'ai' | 'pvp';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type Orientation = 'H' | 'V';
export type ActiveTab = 'play' | 'topics' | 'bank' | 'rules';

export type GamePhase =
  | 'MENU'
  | 'PLACEMENT_P1'
  | 'PASS_TO_P2_PLACEMENT'
  | 'PLACEMENT_P2'
  | 'PASS_TO_P1_TURN'
  | 'BATTLE'
  | 'PASS_TO_P2_TURN'
  | 'GAME_OVER';

export type ChemistryTopicId =
  | 'periodic_atomic'
  | 'chemical_bonds'
  | 'reactions_stoich'
  | 'solutions_acids'
  | 'organic_hydrocarbons'
  | 'redox_electro'
  | 'metals_nonmetals';

export type QuestionDifficulty = 'Asan' | 'Orta' | 'Çətin';

export interface ChemistryTopic {
  id: ChemistryTopicId;
  title: string;
  shortTitle: string;
  formulaSymbol: string;
  description: string;
  keyConcepts: string[];
  accentColor: 'sky' | 'amber' | 'emerald' | 'rose' | 'indigo' | 'teal' | 'orange';
}

export interface ChemistryQuestion {
  id: string;
  topicId: ChemistryTopicId;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  difficulty: QuestionDifficulty;
  explanation: string;
  isCustom?: boolean;
}

export interface ShipTemplate {
  id: string;
  name: string;
  classLabel: string;
  size: number;
  defaultTopicId: ChemistryTopicId;
}

export interface Coordinate {
  row: number; // 0..9
  col: number; // 0..9
}

export interface PlacedShip {
  templateId: string;
  name: string;
  classLabel: string;
  size: number;
  topicId: ChemistryTopicId;
  cells: Coordinate[];
  hits: number;
  sunk: boolean;
  orientation: Orientation;
}

export type CellState = 'empty' | 'ship' | 'miss' | 'hit' | 'shielded';

export interface BoardCell {
  row: number;
  col: number;
  shipId: string | null;
  status: 'unshot' | 'miss' | 'hit' | 'shielded';
}

export interface PlayerStats {
  shotsFired: number;
  hits: number;
  misses: number;
  questionsAnswered: number;
  questionsCorrect: number;
  shieldDeflections: number;
  shipsSunk: number;
  topicAttempts: Partial<Record<ChemistryTopicId, { asked: number; correct: number }>>;
}

export interface PlayerBoardState {
  id: 1 | 2;
  label: string;
  grid: BoardCell[][];
  ships: PlacedShip[];
  stats: PlayerStats;
}

export interface PendingQuizChallenge {
  attacker: 1 | 2;
  defender: 1 | 2;
  coord: Coordinate;
  targetShip: PlacedShip;
  topic: ChemistryTopic;
  question: ChemistryQuestion;
}

export interface BattleLogEntry {
  id: string;
  turnNumber: number;
  actorLabel: string;
  coordLabel: string;
  outcome: 'miss' | 'hit' | 'sunk' | 'shielded' | 'quiz_hit' | 'quiz_sunk';
  shipName?: string;
  topicTitle?: string;
  message: string;
}

export interface GameConfig {
  mode: GameMode;
  opponent: OpponentType;
  aiDifficulty: AIDifficulty;
  bonusTurnOnHit: boolean;
  quizTimerSeconds: number; // 0 = unlimited, 30 = 30s
  shipTopics: Record<string, ChemistryTopicId>; // shipTemplateId -> topicId
}
