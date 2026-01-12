'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getBalanceGameList,
  type BalanceGameListItem,
} from '@/lib/api';

export default function BalanceGameClient() {
  const [games, setGames] = useState<BalanceGameListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getBalanceGameList();
      setGames(response.items);
    } catch (err) {
      console.error('Failed to load balance games:', err);
      setError('밸런스 게임 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGames();
  }, [loadGames]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          <p className="text-4xl mb-4">⚖️</p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">밸런스 게임</h1>
          <p className="text-gray-500">아직 밸런스 게임이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">⚖️</span>
            <span className="font-medium">밸런스 게임</span>
          </div>
        </div>
        <div className="p-4">
          <p className="text-gray-600 text-sm">
            MBTI별 선택을 비교해보세요! 30일 이내 게임에만 투표할 수 있습니다.
          </p>
        </div>
      </div>

      {/* Game List */}
      <div className="space-y-4">
        {games.map((game) => (
          <Link key={game.id} href={`/community/balance/${game.id}`} className="block">
            <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer">
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">{game.week_of}</span>
              {game.is_votable ? (
                <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                  투표 가능
                </span>
              ) : (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  마감됨
                </span>
              )}
            </div>

            {/* Question */}
            <h3 className="text-lg font-bold text-gray-800 mb-4">{game.question}</h3>

            {/* Options with Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-pink-600">{game.option_left}</span>
                <span className="text-purple-600">{game.option_right}</span>
              </div>
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-pink-400 to-pink-500 transition-all duration-500 flex items-center justify-center"
                  style={{ width: `${game.left_percentage}%` }}
                >
                  {game.left_percentage > 15 && (
                    <span className="text-white text-xs font-bold">
                      {game.left_percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
                <div
                  className="bg-gradient-to-r from-purple-400 to-purple-500 transition-all duration-500 flex items-center justify-center"
                  style={{ width: `${game.right_percentage}%` }}
                >
                  {game.right_percentage > 15 && (
                    <span className="text-white text-xs font-bold">
                      {game.right_percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <span>💬 댓글 {game.comment_count}개</span>
            </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}