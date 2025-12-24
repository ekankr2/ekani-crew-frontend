'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { requestMatch, cancelMatch, MatchRequestResponse } from '@/lib/api';

type MatchingStatus = 'idle' | 'waiting' | 'matched';

interface ChatRoom {
  id: string;
  partnerMbti: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// TODO: API 연동 시 실제 데이터로 교체
const DUMMY_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'room_1',
    partnerMbti: 'ENFP',
    lastMessage: '안녕하세요! 반가워요',
    lastMessageTime: '방금',
    unreadCount: 2,
  },
  {
    id: 'room_2',
    partnerMbti: 'INTJ',
    lastMessage: '오늘 날씨가 좋네요',
    lastMessageTime: '5분 전',
    unreadCount: 0,
  },
];

export default function ChatListClient() {
  const router = useRouter();
  const { isLoggedIn, user, profile, loading } = useAuth();

  // Matching state
  const [matchingStatus, setMatchingStatus] = useState<MatchingStatus>('idle');
  const [waitCount, setWaitCount] = useState(0);
  const [matchedMbti, setMatchedMbti] = useState<string | null>(null);
  const [matchedRoomId, setMatchedRoomId] = useState<string | null>(null);
  const [matchingError, setMatchingError] = useState<string | null>(null);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);

  // Chat list state
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  // 로그인 체크
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [loading, isLoggedIn, router]);

  // MBTI 체크
  useEffect(() => {
    if (!loading && isLoggedIn && !profile?.mbti) {
      router.push('/profile');
    }
  }, [loading, isLoggedIn, profile, router]);

  // 채팅방 목록 로드
  useEffect(() => {
    if (isLoggedIn) {
      // TODO: API 연동 시 실제 데이터로 교체
      setTimeout(() => {
        setChatRooms(DUMMY_CHAT_ROOMS);
        setIsLoadingRooms(false);
      }, 500);
    }
  }, [isLoggedIn]);

  const handleStartMatching = async () => {
    if (!user?.id || !profile?.mbti) return;

    setIsMatchingLoading(true);
    setMatchingError(null);

    try {
      const response: MatchRequestResponse = await requestMatch({
        user_id: user.id,
        mbti: profile.mbti,
      });

      setMatchingStatus('waiting');
      setWaitCount(response.wait_count);

      // TODO: WebSocket이나 폴링으로 매칭 결과를 받아야 함
      // 현재는 5초 후 매칭 성공으로 시뮬레이션
      setTimeout(() => {
        setMatchingStatus('matched');
        setMatchedMbti('ENFP');
        setMatchedRoomId('room_' + Date.now());
      }, 5000);

    } catch (err) {
      console.error('매칭 요청 실패:', err);
      setMatchingError('매칭 요청에 실패했습니다. 다시 시도해주세요.');
      setMatchingStatus('idle');
    } finally {
      setIsMatchingLoading(false);
    }
  };

  const handleCancelMatching = async () => {
    if (!user?.id || !profile?.mbti) return;

    setIsMatchingLoading(true);

    try {
      await cancelMatch({
        user_id: user.id,
        mbti: profile.mbti,
      });

      setMatchingStatus('idle');
      setWaitCount(0);
    } catch (err) {
      console.error('매칭 취소 실패:', err);
      setMatchingError('매칭 취소에 실패했습니다.');
    } finally {
      setIsMatchingLoading(false);
    }
  };

  const handleGoToChat = () => {
    if (matchedRoomId) {
      router.push(`/chat/${matchedRoomId}`);
    }
  };

  const handleRoomClick = (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 매칭 섹션 */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">새로운 대화 시작하기</h2>
          {profile?.mbti && (
            <p className="text-sm text-purple-600 mt-1">내 MBTI: {profile.mbti}</p>
          )}
        </div>

        {matchingStatus === 'idle' && (
          <div className="text-center">
            {matchingError && (
              <p className="text-red-500 text-sm mb-4">{matchingError}</p>
            )}
            <button
              onClick={handleStartMatching}
              disabled={isMatchingLoading}
              className="w-full py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full font-medium text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMatchingLoading ? '처리 중...' : '매칭 시작하기'}
            </button>
            <p className="text-gray-400 text-xs mt-3">
              무료 사용자는 하루 3회까지 매칭할 수 있습니다
            </p>
          </div>
        )}

        {matchingStatus === 'waiting' && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">매칭 중...</p>
                <p className="text-sm text-gray-500">대기 인원: {waitCount}명</p>
              </div>
            </div>
            <button
              onClick={handleCancelMatching}
              disabled={isMatchingLoading}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition disabled:opacity-50"
            >
              {isMatchingLoading ? '처리 중...' : '매칭 취소'}
            </button>
          </div>
        )}

        {matchingStatus === 'matched' && (
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-block bg-gradient-to-r from-green-400 to-emerald-400 text-white px-4 py-2 rounded-full text-sm font-medium mb-2">
                매칭 성공!
              </div>
              <p className="text-gray-600">상대방 MBTI: <span className="font-bold text-purple-600">{matchedMbti}</span></p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGoToChat}
                className="flex-1 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full font-medium hover:opacity-90 transition"
              >
                채팅 시작
              </button>
              <button
                onClick={() => {
                  setMatchingStatus('idle');
                  setMatchedMbti(null);
                  setMatchedRoomId(null);
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition"
              >
                다시 매칭
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 채팅 목록 섹션 */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">채팅 목록</h2>
        </div>

        {isLoadingRooms ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-500">아직 채팅방이 없어요</p>
            <p className="text-gray-400 text-sm mt-1">위에서 매칭을 시작해보세요!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {chatRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleRoomClick(room.id)}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition text-left"
              >
                {/* MBTI 아바타 */}
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {room.partnerMbti.slice(0, 2)}
                </div>

                {/* 채팅 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">{room.partnerMbti}</span>
                    <span className="text-xs text-gray-400">{room.lastMessageTime}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{room.lastMessage}</p>
                </div>

                {/* 안 읽은 메시지 */}
                {room.unreadCount > 0 && (
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0">
                    {room.unreadCount}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}