import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle, ChevronRight, Play, RefreshCw } from 'lucide-react';
import { questions, Question, QuestionLevel } from './data/questions';

type GameState = 'welcome' | 'quiz' | 'result';
type AnswerFeedback = 'correct' | 'retry' | 'incorrect' | null;

const questionLevels: QuestionLevel[] = ['자모음', '단어', '문장', '이해', '문단'];
const QUESTIONS_PER_LEVEL: Record<QuestionLevel, number> = {
  자모음: 4,
  단어: 4,
  문장: 4,
  이해: 14,
  문단: 4,
};

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }
  return shuffled;
}

function selectQuizQuestions(): Question[] {
  return questionLevels.flatMap(level => {
    const levelQuestions = questions.filter(question => question.level === level);
    const questionCount = QUESTIONS_PER_LEVEL[level];
    if (levelQuestions.length < questionCount) {
      throw new Error(`${level} 문항이 ${questionCount}개보다 적습니다.`);
    }
    return shuffle(levelQuestions).slice(0, questionCount);
  });
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState<string | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const startQuiz = () => {
    const selectedQuestions = selectQuizQuestions();
    setCurrentQuizQuestions(selectedQuestions);
    setGameState('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers({});
    setResults({});
    setCurrentAttempts(0);
    setWrongAnswer(null);
    setAnswerFeedback(null);
  };

  const moveToNext = () => {
    setCurrentAttempts(0);
    setWrongAnswer(null);
    setAnswerFeedback(null);
    if (currentQuestionIndex < currentQuizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setGameState('result');
    }
  };

  const handleAnswer = (answer: string) => {
    if (wrongAnswer) return; // Prevent clicking while showing feedback

    const currentQuestion = currentQuizQuestions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.answer;
    
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    
    if (isCorrect) {
      setResults(prev => ({ ...prev, [currentQuestion.id]: true }));
      setScore(prev => prev + 1);
      setAnswerFeedback('correct');
      setTimeout(() => moveToNext(), 700);
    } else {
      if (currentAttempts === 0) {
        setCurrentAttempts(1);
        setWrongAnswer(answer);
        setAnswerFeedback('retry');
        setTimeout(() => {
          setWrongAnswer(null);
          setAnswerFeedback(null);
        }, 1500);
      } else {
        setResults(prev => ({ ...prev, [currentQuestion.id]: false }));
        setAnswerFeedback('incorrect');
        setTimeout(() => moveToNext(), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#29251f] font-sans selection:bg-[#f0d9c7]">
      <header className="bg-[#fbfaf7] border-b border-[#e8e0d7] py-5 px-5 sticky top-0 z-50">
        <div className="flex items-center justify-between mb-3 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 text-[#29251f]">
            <BookOpen className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">한국어 읽기 진단평가</h1>
          </div>
          {gameState === 'quiz' && (
            <div className="text-[16px] font-bold text-[#776e64]">
              {currentQuestionIndex + 1} / {currentQuizQuestions.length}
            </div>
          )}
        </div>
        {gameState === 'quiz' && (
          <div className="w-full max-w-3xl mx-auto bg-[#ebe4dc] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#d7835b] h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${((currentQuestionIndex + 1) / currentQuizQuestions.length) * 100}%` }}
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
              question={currentQuizQuestions[currentQuestionIndex]} 
              onAnswer={handleAnswer}
              wrongAnswer={wrongAnswer}
              currentAttempts={currentAttempts}
              answerFeedback={answerFeedback}
            />
          )}
          {gameState === 'result' && (
            <ResultScreen 
              key="result" 
              score={score} 
              quizQuestions={currentQuizQuestions}
              total={currentQuizQuestions.length}
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
      className="bg-white border border-[#e8e0d7] rounded-[24px] shadow-[0_8px_30px_rgba(67,48,32,0.05)] p-7 md:p-11 text-center"
    >
      <div className="w-20 h-20 bg-[#f8e4d7] text-[#c76842] rounded-[22px] flex items-center justify-center mx-auto mb-6">
        <BookOpen className="w-10 h-10" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-[#29251f]">읽기 실력을 알아볼까요?</h2>
      <p className="text-[#776e64] text-[18px] mb-10 max-w-lg mx-auto leading-relaxed">
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
          <div key={i} className="flex-1 min-w-[130px] max-w-[200px] bg-[#fbf7f2] border border-[#eee4da] p-4 rounded-[16px]">
            <div className="text-[#c76842] font-bold text-[14px] mb-1 tracking-wide">{step.title}</div>
            <div className="font-bold text-[#29251f] text-[16px]">{step.desc}</div>
          </div>
        ))}
      </div>

      <button 
        onClick={onStart}
        className="inline-flex items-center justify-center gap-2 bg-[#29251f] hover:bg-[#4a4037] text-white px-8 py-4 rounded-[14px] text-[18px] font-bold transition-all active:scale-95 w-full sm:w-auto"
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
  currentAttempts,
  answerFeedback
}: { 
  key?: string;
  question: Question; 
  onAnswer: (ans: string) => void;
  wrongAnswer: string | null;
  currentAttempts: number;
  answerFeedback: AnswerFeedback;
}) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="bg-white border border-[#e8e0d7] rounded-[24px] shadow-[0_8px_30px_rgba(67,48,32,0.05)] overflow-hidden"
    >
      <div className="px-6 py-5 flex items-center justify-between border-b border-black/5">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[14px] font-bold bg-[#f8e4d7] text-[#b85e3c]">
          {question.level} 단계
        </span>
        {currentAttempts > 0 && wrongAnswer && (
          <span className="text-[13px] font-semibold text-[#FF3B30] animate-pulse">
            다시 한번 생각해 보세요! (기회 1번 남음)
          </span>
        )}
        {answerFeedback === 'correct' && (
          <span className="text-[13px] font-semibold text-[#2f7d4a]">정답이에요! 잘 읽었어요.</span>
        )}
        {answerFeedback === 'retry' && (
          <span className="text-[13px] font-semibold text-[#b35b2c]">좋아요. 지문을 한 번 더 살펴보세요.</span>
        )}
        {answerFeedback === 'incorrect' && (
          <span className="text-[13px] font-semibold text-[#b35b2c]">이번 문항은 오답으로 기록했어요.</span>
        )}
      </div>
      
      <div className="p-6 md:p-10">
        {question.passage && (
          <div className="mb-8 bg-[#fbf7f2] border-l-2 border-[#d7835b] p-6 rounded-r-[8px]">
            <p className="text-[19px] md:text-[21px] leading-[1.8] text-[#29251f] font-bold">
              {question.passage}
            </p>
          </div>
        )}

        <h3 className="text-2xl md:text-[30px] font-bold mb-8 text-[#29251f] tracking-tight leading-snug">
          {question.question}
        </h3>

        <div className="flex flex-col md:flex-row gap-8 mb-4">
          {question.emoji && !question.passage && (
            <div className="shrink-0 w-full md:w-64 aspect-square bg-[#fbf7f2] border border-[#eee4da] rounded-[20px] flex items-center justify-center overflow-hidden">
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
                  disabled={wrongAnswer !== null || answerFeedback === 'correct' || answerFeedback === 'incorrect'}
                  className={`text-left px-6 py-4 rounded-[14px] transition-all text-[18px] font-bold group relative overflow-hidden border border-[#eee4da]
                    ${isWrong 
                      ? 'bg-[#fbe8e4] text-[#b54e43] border-[#edc2bb]' 
                      : 'bg-white hover:bg-[#fbf7f2] text-[#29251f] active:scale-[0.98]'
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
  quizQuestions,
  results,
  onRestart 
}: { 
  key?: string;
  score: number; 
  total: number; 
  quizQuestions: Question[];
  results: Record<string, boolean>;
  onRestart: () => void;
}) {
  const percentage = Math.round((score / total) * 100);
  
  let feedback = '';
  if (percentage === 100) feedback = '완벽해요! 읽기 실력이 아주 훌륭합니다.';
  else if (percentage >= 75) feedback = '참 잘했어요! 조금만 더 연습하면 완벽해질 거예요.';
  else if (percentage >= 50) feedback = '잘하고 있어요! 꾸준히 책을 읽어보아요.';
  else feedback = '괜찮아요! 천천히 자음과 모음부터 다시 연습해 볼까요?';

  const levelStats = quizQuestions.reduce((acc, q) => {
    if (!acc[q.level]) acc[q.level] = { total: 0, correct: 0 };
    acc[q.level].total += 1;
    if (results[q.id]) acc[q.level].correct += 1;
    return acc;
  }, {} as Record<string, { total: number, correct: number }>);
  const weakestLevel = Object.entries(levelStats).sort(
    ([, a], [, b]) => a.correct / a.total - b.correct / b.total
  )[0];
  const analysis = weakestLevel && weakestLevel[1].correct < weakestLevel[1].total
    ? `${weakestLevel[0]} 영역에서 ${weakestLevel[1].total - weakestLevel[1].correct}문제를 더 연습하면 좋아요. 짧은 글을 소리 내어 읽고, 핵심 낱말을 찾아보세요.`
    : '모든 영역을 고르게 잘 풀었어요. 지금처럼 다양한 글을 읽으며 어휘를 넓혀 보세요.';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
      className="bg-white border border-[#e8e0d7] rounded-[24px] shadow-[0_8px_30px_rgba(67,48,32,0.05)] p-7 md:p-11 text-center"
    >
      <div className="w-24 h-24 bg-[#e6f1e8] text-[#4c8a5a] rounded-[22px] flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12" />
      </div>
      
      <h2 className="text-[34px] font-bold mb-2 tracking-tight text-[#29251f]">진단평가 완료!</h2>
      <p className="text-[#776e64] mb-10 text-[18px]">{feedback}</p>
      
      <div className="bg-[#fbf7f2] border border-[#eee4da] rounded-[20px] p-8 mb-10 max-w-sm mx-auto">
        <div className="text-[#8E8E93] font-semibold mb-2 text-[15px] uppercase tracking-wider">나의 점수</div>
        <div className="text-[72px] font-bold text-black mb-1 leading-none tracking-tighter">
          {score} <span className="text-[32px] text-[#C7C7CC] font-semibold">/ {total}</span>
        </div>
        <div className="text-[#8E8E93] font-medium text-[17px]">({percentage}점)</div>
      </div>

      <div className="bg-white rounded-[20px] border border-[#e8e0d7] p-6 mb-10 text-left max-w-md mx-auto">
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
        <div className="mt-8 p-4 bg-[#f8e4d7] rounded-[14px] text-[#a95537] text-[16px] font-bold text-center leading-relaxed">
          {percentage >= 80 
            ? '모든 단계를 골고루 잘 이해하고 있어요. 앞으로도 다양한 책을 읽어보세요!' 
            : '틀린 문제가 있는 단계를 중심으로 복습해보면 더욱 좋아질 거예요!'}
        </div>
        <div className="mt-4 p-5 bg-[#fbf7f2] rounded-[14px] text-left">
          <h4 className="font-bold text-[16px] mb-2">학습 분석</h4>
          <p className="text-[#666] text-[15px] leading-relaxed">{analysis}</p>
        </div>
      </div>

      <button 
        onClick={onRestart}
        className="inline-flex items-center justify-center gap-2 bg-[#29251f] hover:bg-[#4a4037] text-white px-8 py-4 rounded-[14px] text-[18px] font-bold transition-all active:scale-95 w-full sm:w-auto"
      >
        <RefreshCw className="w-5 h-5" />
        다시 평가하기
      </button>
    </motion.div>
  );
}
