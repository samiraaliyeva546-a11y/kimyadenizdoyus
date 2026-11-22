import { useEffect, useMemo, useRef, useState } from 'react';
import { BattleArena } from './components/BattleArena';
import { GameOverModal } from './components/GameOverModal';
import { PassDeviceOverlay } from './components/PassDeviceOverlay';
import { PlacementPhase } from './components/PlacementPhase';
import { QuestionBankView } from './components/QuestionBankView';
import { QuizModal } from './components/QuizModal';
import { RulesView } from './components/RulesView';
import { SetupScreen } from './components/SetupScreen';
import { TopBar } from './components/TopBar';
import { TopicsView } from './components/TopicsView';
import {
  BUILTIN_QUESTIONS,
  FLEET_TEMPLATES,
  getTopicById,
  loadCustomQuestions,
  saveCustomQuestions,
} from './data/chemistryTopics';
import {
  ActiveTab,
  BattleLogEntry,
  ChemistryQuestion,
  ChemistryTopicId,
  Coordinate,
  GameConfig,
  GamePhase,
  PendingQuizChallenge,
  PlayerBoardState,
} from './types/game';
import {
  allShipsSunk,
  applyHitToDefender,
  autoPlaceFleet,
  createEmptyPlayerState,
  formatCoord,
  markCellShielded,
  pickNextAIShot,
  pickRandomQuestionForTopic,
} from './utils/gameLogic';
import { soundFX } from './utils/sound';

const DEFAULT_SHIP_TOPICS: Record<string, ChemistryTopicId> = FLEET_TEMPLATES.reduce(
  (acc, ship) => {
    acc[ship.id] = ship.defaultTopicId;
    return acc;
  },
  {} as Record<string, ChemistryTopicId>
);

const INITIAL_CONFIG: GameConfig = {
  mode: 'quiz',
  opponent: 'ai',
  aiDifficulty: 'medium',
  bonusTurnOnHit: true,
  quizTimerSeconds: 0,
  shipTopics: DEFAULT_SHIP_TOPICS,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('play');
  const [bankTopicFilter, setBankTopicFilter] = useState<ChemistryTopicId | 'all'>('all');
  const [customQuestions, setCustomQuestions] = useState<ChemistryQuestion[]>(() =>
    loadCustomQuestions()
  );

  const allQuestions = useMemo(
    () => [...BUILTIN_QUESTIONS, ...customQuestions],
    [customQuestions]
  );

  const [config, setConfig] = useState<GameConfig>(INITIAL_CONFIG);
  const [phase, setPhase] = useState<GamePhase>('MENU');

  const [player1, setPlayer1] = useState<PlayerBoardState>(() =>
    createEmptyPlayerState(1, 'Oyunçu 1')
  );
  const [player2, setPlayer2] = useState<PlayerBoardState>(() =>
    createEmptyPlayerState(2, 'Kompüter')
  );

  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [turnCounter, setTurnCounter] = useState(1);
  const [pendingQuiz, setPendingQuiz] = useState<PendingQuizChallenge | null>(null);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [lastShotOnP1, setLastShotOnP1] = useState<Coordinate | null>(null);
  const [lastShotOnP2, setLastShotOnP2] = useState<Coordinate | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [winnerId, setWinnerId] = useState<1 | 2 | null>(null);
  const [muted, setMuted] = useState(false);

  const usedQuestionIdsRef = useRef<Set<string>>(new Set());
  const aiTimerRef = useRef<number | null>(null);

  const clearAITimer = () => {
    if (aiTimerRef.current !== null) {
      window.clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearAITimer();
  }, []);

  const handleToggleMute = () => {
    soundFX.muted = !muted;
    setMuted(!muted);
  };

  const resetMatchState = (nextPhase: GamePhase) => {
    clearAITimer();
    usedQuestionIdsRef.current = new Set();
    const p1Label = config.opponent === 'ai' ? 'Sənin Donanman' : 'Oyunçu 1';
    const p2Label = config.opponent === 'ai' ? 'Kompüter' : 'Oyunçu 2';
    setPlayer1(createEmptyPlayerState(1, p1Label));
    setPlayer2(createEmptyPlayerState(2, p2Label));
    setCurrentTurn(1);
    setTurnCounter(1);
    setPendingQuiz(null);
    setBattleLog([]);
    setLastShotOnP1(null);
    setLastShotOnP2(null);
    setIsAIThinking(false);
    setWinnerId(null);
    setPhase(nextPhase);
  };

  const handleStartPlacement = () => {
    setActiveTab('play');
    resetMatchState('PLACEMENT_P1');
  };

  const handleNewGame = () => {
    setActiveTab('play');
    resetMatchState('MENU');
  };

  const handleConfirmP1Fleet = () => {
    if (config.opponent === 'ai') {
      const aiFleet = autoPlaceFleet(2, 'Kompüter', config.shipTopics);
      setPlayer2(aiFleet);
      setCurrentTurn(1);
      setPhase('BATTLE');
    } else {
      setPhase('PASS_TO_P2_PLACEMENT');
    }
  };

  const handleConfirmP2Fleet = () => {
    setCurrentTurn(1);
    setPhase('PASS_TO_P1_TURN');
  };

  const appendLog = (entry: Omit<BattleLogEntry, 'id' | 'turnNumber'>) => {
    setBattleLog((prev) => [
      {
        ...entry,
        id: `${Date.now()}-${Math.random()}`,
        turnNumber: turnCounter,
      },
      ...prev,
    ]);
  };

  const finalizeTurnProgression = (
    attackerId: 1 | 2,
    nextDefender: PlayerBoardState,
    keepTurn: boolean
  ) => {
    if (allShipsSunk(nextDefender)) {
      soundFX.playVictory();
      setWinnerId(attackerId);
      setPhase('GAME_OVER');
      return;
    }

    setTurnCounter((prev) => prev + 1);

    if (keepTurn) {
      setCurrentTurn(attackerId);
      return;
    }

    const nextTurn: 1 | 2 = attackerId === 1 ? 2 : 1;
    setCurrentTurn(nextTurn);

    if (config.opponent === 'pvp') {
      setPhase(nextTurn === 1 ? 'PASS_TO_P1_TURN' : 'PASS_TO_P2_TURN');
    }
  };

  const executeShot = (attackerId: 1 | 2, coord: Coordinate) => {
    const attacker = attackerId === 1 ? player1 : player2;
    const defender = attackerId === 1 ? player2 : player1;
    const cell = defender.grid[coord.row][coord.col];

    if (cell.status === 'miss' || cell.status === 'hit') return;

    if (attackerId === 1) setLastShotOnP2(coord);
    else setLastShotOnP1(coord);

    // Miss on open water
    if (!cell.shipId) {
      soundFX.playSplash();
      const { nextDefender } = applyHitToDefender(defender, coord);
      const nextAttacker: PlayerBoardState = {
        ...attacker,
        stats: {
          ...attacker.stats,
          shotsFired: attacker.stats.shotsFired + 1,
          misses: attacker.stats.misses + 1,
        },
      };

      if (attackerId === 1) {
        setPlayer1(nextAttacker);
        setPlayer2(nextDefender);
      } else {
        setPlayer2(nextAttacker);
        setPlayer1(nextDefender);
      }

      appendLog({
        actorLabel: attacker.label,
        coordLabel: formatCoord(coord),
        outcome: 'miss',
        message: 'Boş suya atəş açdı',
      });

      finalizeTurnProgression(attackerId, nextDefender, false);
      return;
    }

    // Ship hit! Check Classic vs Chemistry Quiz mode
    const targetShip = defender.ships.find((s) => s.templateId === cell.shipId);
    if (!targetShip) return;

    if (config.mode === 'classic') {
      const { nextDefender, wasSunk } = applyHitToDefender(defender, coord);
      if (wasSunk) soundFX.playSunk();
      else soundFX.playHit();

      const nextAttacker: PlayerBoardState = {
        ...attacker,
        stats: {
          ...attacker.stats,
          shotsFired: attacker.stats.shotsFired + 1,
          hits: attacker.stats.hits + 1,
          shipsSunk: attacker.stats.shipsSunk + (wasSunk ? 1 : 0),
        },
      };

      if (attackerId === 1) {
        setPlayer1(nextAttacker);
        setPlayer2(nextDefender);
      } else {
        setPlayer2(nextAttacker);
        setPlayer1(nextDefender);
      }

      appendLog({
        actorLabel: attacker.label,
        coordLabel: formatCoord(coord),
        outcome: wasSunk ? 'sunk' : 'hit',
        shipName: targetShip.name,
        message: wasSunk ? `${targetShip.name} batırıldı` : 'Dəqiq zərbə endirdi',
      });

      finalizeTurnProgression(attackerId, nextDefender, config.bonusTurnOnHit);
      return;
    }

    // Quiz Mode: Human player gets Chemistry Quiz Modal; AI simulates answering
    if (config.opponent === 'ai' && attackerId === 2) {
      const aiAccuracy =
        config.aiDifficulty === 'easy' ? 0.5 : config.aiDifficulty === 'medium' ? 0.72 : 0.88;
      const aiCorrect = Math.random() < aiAccuracy;
      const topic = getTopicById(targetShip.topicId);
      const prevTopicStats = attacker.stats.topicAttempts[topic.id] ?? { asked: 0, correct: 0 };

      if (aiCorrect) {
        const { nextDefender, wasSunk } = applyHitToDefender(defender, coord);
        if (wasSunk) soundFX.playSunk();
        else soundFX.playHit();

        const nextAttacker: PlayerBoardState = {
          ...attacker,
          stats: {
            ...attacker.stats,
            shotsFired: attacker.stats.shotsFired + 1,
            hits: attacker.stats.hits + 1,
            questionsAnswered: attacker.stats.questionsAnswered + 1,
            questionsCorrect: attacker.stats.questionsCorrect + 1,
            shipsSunk: attacker.stats.shipsSunk + (wasSunk ? 1 : 0),
            topicAttempts: {
              ...attacker.stats.topicAttempts,
              [topic.id]: {
                asked: prevTopicStats.asked + 1,
                correct: prevTopicStats.correct + 1,
              },
            },
          },
        };

        setPlayer2(nextAttacker);
        setPlayer1(nextDefender);

        appendLog({
          actorLabel: attacker.label,
          coordLabel: formatCoord(coord),
          outcome: wasSunk ? 'quiz_sunk' : 'quiz_hit',
          shipName: targetShip.name,
          topicTitle: topic.shortTitle,
          message: wasSunk
            ? `${topic.shortTitle} sualını bilib ${targetShip.name} gəmisini batırdı`
            : `${topic.shortTitle} qalxanını dəldi`,
        });

        finalizeTurnProgression(2, nextDefender, config.bonusTurnOnHit);
      } else {
        soundFX.playShieldDeflect();
        const nextDefender = markCellShielded(defender, coord);
        const nextAttacker: PlayerBoardState = {
          ...attacker,
          stats: {
            ...attacker.stats,
            shotsFired: attacker.stats.shotsFired + 1,
            questionsAnswered: attacker.stats.questionsAnswered + 1,
            shieldDeflections: attacker.stats.shieldDeflections + 1,
            topicAttempts: {
              ...attacker.stats.topicAttempts,
              [topic.id]: {
                asked: prevTopicStats.asked + 1,
                correct: prevTopicStats.correct,
              },
            },
          },
        };

        setPlayer2(nextAttacker);
        setPlayer1(nextDefender);

        appendLog({
          actorLabel: attacker.label,
          coordLabel: formatCoord(coord),
          outcome: 'shielded',
          topicTitle: topic.shortTitle,
          message: `${topic.shortTitle} qalxanı atışı dəf etdi`,
        });

        finalizeTurnProgression(2, nextDefender, false);
      }
      return;
    }

    // Open Quiz Modal for Human player
    soundFX.playSonarPing();
    const topic = getTopicById(targetShip.topicId);
    const question = pickRandomQuestionForTopic(
      allQuestions,
      topic.id,
      usedQuestionIdsRef.current
    );
    usedQuestionIdsRef.current.add(question.id);

    setPendingQuiz({
      attacker: attackerId,
      defender: attackerId === 1 ? 2 : 1,
      coord,
      targetShip,
      topic,
      question,
    });
  };

  const handleResolveQuiz = (isCorrect: boolean) => {
    if (!pendingQuiz) return;

    const { attacker: attackerId, coord, targetShip, topic } = pendingQuiz;
    const attacker = attackerId === 1 ? player1 : player2;
    const defender = attackerId === 1 ? player2 : player1;
    const prevTopicStats = attacker.stats.topicAttempts[topic.id] ?? { asked: 0, correct: 0 };

    setPendingQuiz(null);

    if (isCorrect) {
      const { nextDefender, wasSunk } = applyHitToDefender(defender, coord);
      if (wasSunk) soundFX.playSunk();
      else soundFX.playHit();

      const nextAttacker: PlayerBoardState = {
        ...attacker,
        stats: {
          ...attacker.stats,
          shotsFired: attacker.stats.shotsFired + 1,
          hits: attacker.stats.hits + 1,
          questionsAnswered: attacker.stats.questionsAnswered + 1,
          questionsCorrect: attacker.stats.questionsCorrect + 1,
          shipsSunk: attacker.stats.shipsSunk + (wasSunk ? 1 : 0),
          topicAttempts: {
            ...attacker.stats.topicAttempts,
            [topic.id]: {
              asked: prevTopicStats.asked + 1,
              correct: prevTopicStats.correct + 1,
            },
          },
        },
      };

      if (attackerId === 1) {
        setPlayer1(nextAttacker);
        setPlayer2(nextDefender);
      } else {
        setPlayer2(nextAttacker);
        setPlayer1(nextDefender);
      }

      appendLog({
        actorLabel: attacker.label,
        coordLabel: formatCoord(coord),
        outcome: wasSunk ? 'quiz_sunk' : 'quiz_hit',
        shipName: targetShip.name,
        topicTitle: topic.shortTitle,
        message: wasSunk
          ? `${topic.shortTitle} sualını bilib ${targetShip.name} gəmisini batırdı`
          : `${topic.shortTitle} qalxanını dəldi`,
      });

      finalizeTurnProgression(attackerId, nextDefender, config.bonusTurnOnHit);
    } else {
      const nextDefender = markCellShielded(defender, coord);
      const nextAttacker: PlayerBoardState = {
        ...attacker,
        stats: {
          ...attacker.stats,
          shotsFired: attacker.stats.shotsFired + 1,
          questionsAnswered: attacker.stats.questionsAnswered + 1,
          shieldDeflections: attacker.stats.shieldDeflections + 1,
          topicAttempts: {
            ...attacker.stats.topicAttempts,
            [topic.id]: {
              asked: prevTopicStats.asked + 1,
              correct: prevTopicStats.correct,
            },
          },
        },
      };

      if (attackerId === 1) {
        setPlayer1(nextAttacker);
        setPlayer2(nextDefender);
      } else {
        setPlayer2(nextAttacker);
        setPlayer1(nextDefender);
      }

      appendLog({
        actorLabel: attacker.label,
        coordLabel: formatCoord(coord),
        outcome: 'shielded',
        topicTitle: topic.shortTitle,
        message: `${topic.shortTitle} qalxanı atışı dəf etdi`,
      });

      finalizeTurnProgression(attackerId, nextDefender, false);
    }
  };

  // Trigger AI turn cleanly
  useEffect(() => {
    if (
      phase !== 'BATTLE' ||
      config.opponent !== 'ai' ||
      currentTurn !== 2 ||
      pendingQuiz !== null ||
      winnerId !== null
    ) {
      return;
    }

    setIsAIThinking(true);
    clearAITimer();

    aiTimerRef.current = window.setTimeout(() => {
      setIsAIThinking(false);
      const targetCoord = pickNextAIShot(player1.grid, player1.ships, config.aiDifficulty);
      executeShot(2, targetCoord);
    }, 680);

    return () => clearAITimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, config.opponent, currentTurn, turnCounter, pendingQuiz, winnerId]);

  const handleAddCustomQuestion = (q: ChemistryQuestion) => {
    const next = [q, ...customQuestions];
    setCustomQuestions(next);
    saveCustomQuestions(next);
  };

  const handleDeleteCustomQuestion = (id: string) => {
    const next = customQuestions.filter((q) => q.id !== id);
    setCustomQuestions(next);
    saveCustomQuestions(next);
  };

  const winnerState = winnerId === 1 ? player1 : player2;
  const loserState = winnerId === 1 ? player2 : player1;

  return (
    <div className="min-h-screen flex flex-col bg-[#091426] text-slate-100">
      <TopBar activeTab={activeTab} onSelectTab={setActiveTab} onNewGame={handleNewGame} />

      <main className="flex-1">
        {activeTab === 'topics' && (
          <TopicsView
            allQuestions={allQuestions}
            shipTopics={config.shipTopics}
            onOpenTopicInBank={(topicId) => {
              setBankTopicFilter(topicId);
              setActiveTab('bank');
            }}
            onGoToPlay={() => setActiveTab('play')}
          />
        )}

        {activeTab === 'bank' && (
          <QuestionBankView
            key={bankTopicFilter}
            allQuestions={allQuestions}
            initialTopicFilter={bankTopicFilter}
            onAddCustomQuestion={handleAddCustomQuestion}
            onDeleteCustomQuestion={handleDeleteCustomQuestion}
          />
        )}

        {activeTab === 'rules' && <RulesView onGoToPlay={() => setActiveTab('play')} />}

        {activeTab === 'play' && (
          <>
            {phase === 'MENU' && (
              <SetupScreen
                config={config}
                onChangeConfig={setConfig}
                onStartPlacement={handleStartPlacement}
                totalQuestionsCount={allQuestions.length}
              />
            )}

            {phase === 'PLACEMENT_P1' && (
              <PlacementPhase
                playerState={player1}
                mode={config.mode}
                shipTopics={config.shipTopics}
                onUpdateState={setPlayer1}
                onConfirmFleet={handleConfirmP1Fleet}
                onBackToMenu={handleNewGame}
              />
            )}

            {phase === 'PASS_TO_P2_PLACEMENT' && (
              <PassDeviceOverlay
                nextPlayerLabel={player2.label}
                subtitle="Oyunçu 1 donanmasını yerləşdirdi. İndi Oyunçu 2 gizli şəkildə öz gəmilərini xəritəyə düzməlidir."
                buttonLabel="Oyunçu 2 Yerləşdirməsinə Başla"
                onContinue={() => setPhase('PLACEMENT_P2')}
              />
            )}

            {phase === 'PLACEMENT_P2' && (
              <PlacementPhase
                playerState={player2}
                mode={config.mode}
                shipTopics={config.shipTopics}
                onUpdateState={setPlayer2}
                onConfirmFleet={handleConfirmP2Fleet}
                onBackToMenu={handleNewGame}
              />
            )}

            {phase === 'PASS_TO_P1_TURN' && (
              <PassDeviceOverlay
                nextPlayerLabel={player1.label}
                subtitle="Oyunçu 2 ekranı görməməlidir. Atış növbəsi Oyunçu 1-ə keçir."
                buttonLabel="Oyunçu 1 Növbəsini Aç"
                onContinue={() => {
                  setCurrentTurn(1);
                  setPhase('BATTLE');
                }}
              />
            )}

            {phase === 'PASS_TO_P2_TURN' && (
              <PassDeviceOverlay
                nextPlayerLabel={player2.label}
                subtitle="Oyunçu 1 ekranı görməməlidir. Atış növbəsi Oyunçu 2-yə keçir."
                buttonLabel="Oyunçu 2 Növbəsini Aç"
                onContinue={() => {
                  setCurrentTurn(2);
                  setPhase('BATTLE');
                }}
              />
            )}

            {(phase === 'BATTLE' || phase === 'GAME_OVER') && (
              <BattleArena
                config={config}
                currentTurn={currentTurn}
                activeViewer={config.opponent === 'ai' ? 1 : currentTurn}
                player1={player1}
                player2={player2}
                isAIThinking={isAIThinking}
                lastShotOnP1={lastShotOnP1}
                lastShotOnP2={lastShotOnP2}
                battleLog={battleLog}
                muted={muted}
                onToggleMute={handleToggleMute}
                onFireShot={(coord) => executeShot(currentTurn, coord)}
                onRestart={handleStartPlacement}
              />
            )}
          </>
        )}
      </main>

      {pendingQuiz && (
        <QuizModal
          challenge={pendingQuiz}
          timerSeconds={config.quizTimerSeconds}
          onResolve={handleResolveQuiz}
        />
      )}

      {phase === 'GAME_OVER' && winnerId !== null && (
        <GameOverModal
          winner={winnerState}
          loser={loserState}
          mode={config.mode}
          onPlayAgain={handleStartPlacement}
          onBackToMenu={handleNewGame}
        />
      )}
    </div>
  );
}
