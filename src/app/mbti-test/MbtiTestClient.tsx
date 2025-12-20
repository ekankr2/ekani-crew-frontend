'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { startMbtiTest, checkAuthStatus, generateAIQuestion, ChatMessageDTO } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function MbtiTestClient() {
  const router = useRouter();
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [turn, setTurn] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지가 추가될 때마다 자동으로 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const status = await checkAuthStatus();
        if (status.logged_in && status.user_id) {
          setUserId(status.user_id);
        }
      } catch {
        // 로그인 상태가 아니면 무시
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkUser();
  }, []);

  const handleStart = async () => {
    if (!userId) {
      setError('로그인이 필요합니다.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await startMbtiTest(userId);
      setSessionId(response.session_id);
      setMessages([{ role: 'assistant', content: response.first_question }]);
      setTurn(1);
      setIsStarted(true);
    } catch (err: any) {
      setError(err.message || 'MBTI 테스트 시작 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isCompleted) return;

    const userAnswer = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userAnswer }];
    setMessages(newMessages);
    setIsLoading(true);
    setError('');

    try {
      // 대화 기록을 API 형식으로 변환
      const history: ChatMessageDTO[] = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // AI 질문 생성 요청
      const response = await generateAIQuestion(sessionId, {
        turn: turn,
        history: history,
        question_mode: 'normal',
      });

      // 질문이 있으면 첫 번째 질문 표시
      if (response.questions && response.questions.length > 0) {
        const nextQuestion = response.questions[0].text;
        setMessages(prev => [...prev, { role: 'assistant', content: nextQuestion }]);

        // 다음 턴으로
        const nextTurn = turn + 1;
        setTurn(nextTurn);

        // 5턴 완료 체크
        if (nextTurn > 5) {
          setIsCompleted(true);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: '테스트가 완료되었습니다! 결과를 분석 중입니다...' }
          ]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'AI 질문 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
          <div className="text-6xl mb-6">🧠</div>
          <h1 className="text-2xl font-bold text-purple-500 mb-4">MBTI 테스트 시작하기</h1>
          <p className="text-gray-500 mb-8">
            AI와의 대화를 통해 당신의 MBTI를 알아보세요.
            <br />
            자연스러운 질문에 솔직하게 답변해주시면 됩니다!
          </p>
          {!isCheckingAuth && !userId && (
            <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded-lg">
              로그인 후 테스트를 진행할 수 있습니다.
              <button
                onClick={() => router.push('/login')}
                className="ml-2 underline hover:text-yellow-900"
              >
                로그인하기
              </button>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          <button
            onClick={handleStart}
            disabled={isLoading || isCheckingAuth || !userId}
            className="cursor-pointer px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || isCheckingAuth ? '로딩 중...' : '테스트 시작하기'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white p-4">
          <h1 className="font-bold">MBTI 테스트</h1>
          <p className="text-sm text-white/80">
            {isCompleted ? '테스트 완료!' : `진행 중: ${Math.min(turn, 5)}/5턴`}
          </p>
        </div>

        {/* 메시지 영역 */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-purple-400 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 rounded-bl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 입력 영역 */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && !isCompleted && handleSend()}
              placeholder={isCompleted ? '테스트가 완료되었습니다' : '답변을 입력해주세요...'}
              disabled={isLoading || isCompleted}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || isCompleted || !input.trim()}
              className="px-6 py-3 bg-purple-400 text-white rounded-full font-medium hover:bg-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '전송 중...' : '전송'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
