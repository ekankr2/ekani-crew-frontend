'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getBalanceGameList, type BalanceGameListItem } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, profile } = useAuth();
  const [balanceGame, setBalanceGame] = useState<BalanceGameListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBalanceGame = async () => {
      try {
        const response = await getBalanceGameList();
        if (response.items.length > 0) {
          setBalanceGame(response.items[0]);
        }
      } catch (err) {
        console.error('Failed to load balance game:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBalanceGame();
  }, []);

  const handleVoteClick = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (!profile?.mbti) {
      router.push('/mypage');
      return;
    }
    if (balanceGame) {
      router.push(`/community/balance/${balanceGame.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* 밸런스 게임 */}
      <section className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <span className="text-xl">⚖️</span>
              <span className="font-bold">이번 주 밸런스 게임</span>
            </div>
            <Link href="/community/balance" className="text-white/80 text-sm hover:text-white">
              전체보기 →
            </Link>
          </div>
        </div>

        <div className="p-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : balanceGame ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-10 leading-relaxed">
                {balanceGame.question}
              </h2>

              {/* 현재 투표 현황 */}
              <div className="mb-8">
                <div className="h-12 bg-gray-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-gradient-to-r from-pink-400 to-pink-500 flex items-center justify-center transition-all duration-500"
                    style={{ width: `${balanceGame.left_percentage}%` }}
                  >
                    {balanceGame.left_percentage > 15 && (
                      <span className="text-white font-bold">
                        {balanceGame.left_percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <div
                    className="bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center transition-all duration-500"
                    style={{ width: `${balanceGame.right_percentage}%` }}
                  >
                    {balanceGame.right_percentage > 15 && (
                      <span className="text-white font-bold">
                        {balanceGame.right_percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 투표 버튼 */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleVoteClick}
                  className="cursor-pointer py-4 bg-pink-500 hover:bg-pink-600 text-white text-lg font-bold rounded-full transition"
                >
                  {balanceGame.option_left}
                </button>
                <button
                  onClick={handleVoteClick}
                  className="cursor-pointer py-4 bg-purple-500 hover:bg-purple-600 text-white text-lg font-bold rounded-full transition"
                >
                  {balanceGame.option_right}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>현재 진행 중인 게임이 없습니다</p>
            </div>
          )}
        </div>
      </section>

      {/* 메시지 변환 */}
      <section className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">✨</span>
            <span className="font-bold">메시지 변환</span>
          </div>
        </div>

        <div className="p-8">
          <p className="text-lg text-gray-700 text-center mb-8">
            같은 말도 MBTI에 따라 다르게 들려요
          </p>

          {/* 예시 */}
          <div className="space-y-4 mb-8">
            {/* 원문 */}
            <div className="bg-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-500">내가 보내려는 말</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "저번에 말한 프로젝트 자료 아직인가요? 다음 주 회의 전까지 필요한데 언제쯤 받을 수 있을까요?"
              </p>
            </div>

            {/* 변환 결과 */}
            <div className="grid gap-3">
              <div className="bg-purple-50 rounded-2xl p-5 border-l-4 border-purple-500">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded">INTJ</span>
                  <span className="text-xs text-purple-600">논리적 · 직접적</span>
                </div>
                <p className="text-gray-800 leading-relaxed">
                  "프로젝트 자료 진행 상황 확인드립니다. 다음 주 회의 준비를 위해 금요일까지 공유 가능하신지 확인 부탁드려요."
                </p>
              </div>

              <div className="bg-pink-50 rounded-2xl p-5 border-l-4 border-pink-500">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-pink-500 text-white text-xs font-bold rounded">ENFP</span>
                  <span className="text-xs text-pink-600">친근한 · 감성적</span>
                </div>
                <p className="text-gray-800 leading-relaxed">
                  "저번에 말씀드린 자료 준비 어떻게 되고 있어요~? 바쁘시겠지만 다음 주 회의 전에 같이 볼 수 있으면 좋겠어요!"
                </p>
              </div>

              <div className="bg-blue-50 rounded-2xl p-5 border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">ISTJ</span>
                  <span className="text-xs text-blue-600">정중한 · 체계적</span>
                </div>
                <p className="text-gray-800 leading-relaxed">
                  "안녕하세요. 요청드린 프로젝트 자료 전달 일정 확인 요청드립니다. 회의 일정상 이번 주 내 수령이 필요합니다."
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/convert"
            className="block w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold rounded-full text-center hover:shadow-lg transition"
          >
            내 메시지 변환하기
          </Link>
        </div>
      </section>

      {/* MBTI 검사 */}
      <section className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">🧠</span>
            <span className="font-bold">MBTI 검사</span>
          </div>
        </div>

        <div className="p-8">
          <p className="text-lg text-gray-700 text-center mb-8">
            AI와 대화하며 알아보는 정확한 MBTI
          </p>

          <div className="flex justify-center gap-8 mb-8 text-center">
            <div>
              <div className="text-3xl mb-2">💬</div>
              <div className="text-sm text-gray-500">채팅형</div>
            </div>
            <div>
              <div className="text-3xl mb-2">24</div>
              <div className="text-sm text-gray-500">질문</div>
            </div>
            <div>
              <div className="text-3xl mb-2">10분</div>
              <div className="text-sm text-gray-500">소요</div>
            </div>
          </div>

          <Link
            href="/mbti-test"
            className="block w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg font-bold rounded-full text-center hover:shadow-lg transition"
          >
            무료로 검사하기
          </Link>
        </div>
      </section>
    </div>
  );
}