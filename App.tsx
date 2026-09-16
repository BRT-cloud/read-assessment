import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle, ChevronRight, Play, RefreshCw } from 'lucide-react';
import { questions, Question } from './data/questions';

type GameState = 'welcome' | 'quiz' | 'result';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const startQuiz = () => {
    setGameState('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers({});
    setResults({});
    setCurrentAttempts(0);
    setWrongAnswer(null);
  };

  const moveToNext = () => {
    setCurrentAttempts(0);
    setWrongAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setGameState('result');
    }
  };

  const handleAnswer = (answer: string) => {
    if (wrongAnswer) return; // Prevent clicking while showing feedback

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.answer;
    
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    
    if (isCorrect) {
      setResults(prev => ({ ...prev, [currentQuestion.id]: true }));
      setScore(prev => prev + 1);
      moveToNext();
    } else {
      if (currentAttempts === 0) {
        setCurrentAttempts(1);
        setWrongAnswer(answer);
        setTimeout(() => {
          setWrongAnswer(null);
        }, 1500);
      } else {
        setResults(prev => ({ ...prev, [currentQuestion.id]: false }));
        moveToNext();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#171717] font-sans selection:bg-[#171717]/10">
      <header className="bg-[#f7f7f5]/90 backdrop-blur-xl border-b border-black/10 py-4 px-6 sticky top-0 z-50">
        <div className="flex items-center justify-between mb-3 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-[#171717]">
            <BookOpen className="w-6 h-6" />
            <h1 className="text-xl font-semibold tracking-tight">한국어 읽기 진단평가</h1>
          </div>
          {gameState === 'quiz' && (
            <div className="text-[15px] font-medium text-[#666]">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          )}
        </div>
        {gameState === 'quiz' && (
          <div className="w-full max-w-3xl mx-auto bg-[#deded9] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#171717] h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-6 pt-8">
        <AnimatePresence mode="wait">
          {gameState === 'welcome' && (
            <WelcomeScreen key="welcome" onStart={startQuiz} />
          )}
          {gameState === 'quiz' && (
            <QuizScreen 
              key="quiz" 
              question={questions[currentQuestionIndex]} 
              onAnswer={handleAnswer}
              wrongAnswer={wrongAnswer}
              currentAttempts={currentAttempts}
            />
          )}
          {gameState === 'result' && (
            <ResultScreen 
              key="result" 
              score={score} 
              total={questions.length}
              results={results}
              onRestart={startQuiz} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function WelcomeScreen({ onStart }: { onStart: () => void; key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 text-center"
    >
      <div className="w-20 h-20 bg-[#007AFF]/10 text-[#007AFF] rounded-full flex items-center justify-center mx-auto mb-6">
        <BookOpen className="w-10 h-10" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-black">읽기 실력을 알아볼까요?</h2>
      <p className="text-[#8E8E93] text-[17px] mb-10 max-w-lg mx-auto leading-relaxed">
        자음과 모음부터 긴 글 읽기까지, 단계별 문항으로 읽기 실력을 진단해 보세요.
      </p>
      
      <div className="flex flex-wrap justify-center gap-3 mb-12 text-left">
        {[
          { title: '1단계', desc: '자모음 읽기' },
          { title: '2단계', desc: '단어 읽기' },
          { title: '3단계', desc: '문장 읽기' },
          { title: '4단계', desc: '글 이해하기' },
          { title: '5단계', desc: '문단 이해하기' },
        ].map((step, i) => (
          <div key={i} className="flex-1 min-w-[130px] max-w-[200px] bg-[#F2F2F7] p-4 rounded-[20px]">
            <div className="text-[#007AFF] font-semibold text-[13px] mb-1 tracking-wide">{step.title}</div>
            <div className="font-medium text-black text-[15px]">{step.desc}</div>
          </div>
        ))}
      </div>

      <button 
        onClick={onStart}
        className="inline-flex items-center justify-center gap-2 bg-[#007AFF] hover:bg-[#0056b3] text-white px-8 py-4 rounded-full text-[17px] font-semibold transition-all active:scale-95 w-full sm:w-auto"
      >
        <Play className="w-5 h-5 fill-current" />
        평가 시작하기
      </button>
    </motion.div>
  );
}

function QuizScreen({ 
  question, 
  onAnswer,
  wrongAnswer,
  currentAttempts
}: { 
  key?: string;
  question: Question; 
  onAnswer: (ans: string) => void;
  wrongAnswer: string | null;
  currentAttempts: number;
}) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
    >
      <div className="px-6 py-5 flex items-center justify-between border-b border-black/5">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-semibold bg-[#007AFF]/10 text-[#007AFF]">
          {question.level} 단계
        </span>
        {currentAttempts > 0 && wrongAnswer && (
          <span className="text-[13px] font-semibold text-[#FF3B30] animate-pulse">
            다시 한번 생각해 보세요! (기회 1번 남음)
          </span>
        )}
      </div>
      
      <div className="p-6 md:p-10">
        {question.passage && (
          <div className="mb-8 bg-[#f4f4f1] border-l-2 border-[#171717] p-6 rounded-r-[8px]">
            <p className="text-[17px] md:text-[19px] leading-relaxed text-black font-medium">
              {question.passage}
            </p>
          </div>
        )}

        <h3 className="text-2xl md:text-[28px] font-bold mb-8 text-black tracking-tight leading-snug">
          {question.question}
        </h3>

        <div className="flex flex-col md:flex-row gap-8 mb-4">
          {question.emoji && !question.passage && (
            <div className="shrink-0 w-full md:w-64 aspect-square bg-[#F2F2F7] rounded-[28px] flex items-center justify-center overflow-hidden">
              <span 
                className="text-8xl transition-transform duration-300"
                style={{ transform: `scale(${question.imageScale || 1})` }}
              >
                {question.emoji}
              </span>
            </div>
          )}
          
          <div className="flex-1 flex flex-col gap-3 justify-center">
            {question.options.map((option, idx) => {
              const isWrong = wrongAnswer === option;
              return (
                <button
                  key={idx}
                  onClick={() => onAnswer(option)}
                  disabled={wrongAnswer !== null}
                  className={`text-left px-6 py-4 rounded-[20px] transition-all text-[17px] font-medium group relative overflow-hidden
                    ${isWrong 
                      ? 'bg-[#FF3B30]/10 text-[#FF3B30]' 
                      : 'bg-[#F2F2F7] hover:bg-[#E5E5EA] text-black active:scale-[0.98]'
                    }
                    ${wrongAnswer !== null && !isWrong ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    <ChevronRight className={`w-5 h-5 transition-colors ${isWrong ? 'text-[#FF3B30]' : 'text-[#C7C7CC] group-hover:text-[#8E8E93]'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ResultScreen({ 
  score, 
  total, 
  results,
  onRestart 
}: { 
  key?: string;
  score: number; 
  total: number; 
  results: Record<string, boolean>;
  onRestart: () => void;
}) {
  const percentage = Math.round((score / total) * 100);
  
  let feedback = '';
  if (percentage === 100) feedback = '완벽해요! 읽기 실력이 아주 훌륭합니다.';
  else if (percentage >= 75) feedback = '참 잘했어요! 조금만 더 연습하면 완벽해질 거예요.';
  else if (percentage >= 50) feedback = '잘하고 있어요! 꾸준히 책을 읽어보아요.';
  else feedback = '괜찮아요! 천천히 자음과 모음부터 다시 연습해 볼까요?';

  const levelStats = questions.reduce((acc, q) => {
    if (!acc[q.level]) acc[q.level] = { total: 0, correct: 0 };
    acc[q.level].total += 1;
    if (results[q.id]) acc[q.level].correct += 1;
    return acc;
  }, {} as Record<string, { total: number, correct: number }>);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
      className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 text-center"
    >
      <div className="w-24 h-24 bg-[#34C759]/10 text-[#34C759] rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12" />
      </div>
      
      <h2 className="text-[32px] font-bold mb-2 tracking-tight text-black">진단평가 완료!</h2>
      <p className="text-[#8E8E93] mb-10 text-[17px]">{feedback}</p>
      
      <div className="bg-[#F2F2F7] rounded-[28px] p-8 mb-10 max-w-sm mx-auto">
        <div className="text-[#8E8E93] font-semibold mb-2 text-[15px] uppercase tracking-wider">나의 점수</div>
        <div className="text-[72px] font-bold text-black mb-1 leading-none tracking-tighter">
          {score} <span className="text-[32px] text-[#C7C7CC] font-semibold">/ {total}</span>
        </div>
        <div className="text-[#8E8E93] font-medium text-[17px]">({percentage}점)</div>
      </div>

      <div className="bg-white rounded-[28px] border border-black/5 shadow-sm p-6 mb-10 text-left max-w-md mx-auto">
        <h3 className="text-[19px] font-bold mb-6 text-black text-center tracking-tight">단계별 분석 결과</h3>
        <div className="space-y-5">
          {Object.entries(levelStats).map(([level, stats], idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="font-semibold text-black w-20 text-[15px]">{level}</span>
              <div className="flex-1 mx-4">
                <div className="w-full h-2 bg-[#E5E5EA] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#007AFF] rounded-full transition-all duration-1000"
                    style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-[15px] font-semibold text-[#8E8E93] w-8 text-right">
                {stats.correct}/{stats.total}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-8 p-4 bg-[#007AFF]/10 rounded-[20px] text-[#007AFF] text-[15px] font-medium text-center leading-relaxed">
          {percentage >= 80 
            ? '모든 단계를 골고루 잘 이해하고 있어요. 앞으로도 다양한 책을 읽어보세요!' 
            : '틀린 문제가 있는 단계를 중심으로 복습해보면 더욱 좋아질 거예요!'}
        </div>
      </div>

      <button 
        onClick={onRestart}
        className="inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-full text-[17px] font-semibold transition-all active:scale-95 w-full sm:w-auto"
      >
        <RefreshCw className="w-5 h-5" />
        다시 평가하기
      </button>
    </motion.div>
  );
}
