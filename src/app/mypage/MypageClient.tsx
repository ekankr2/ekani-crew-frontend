'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function MypageClient() {
  const { user, profile } = useAuth();

  const genderLabel = profile?.gender === 'MALE' ? '남성' : profile?.gender === 'FEMALE' ? '여성' : '-';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold text-pink-500 mb-2">마이페이지</h1>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">📧</span>
              <span className="text-gray-600">이메일</span>
            </div>
            <span className="font-medium text-gray-800">{user?.email || '-'}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">🧠</span>
              <span className="text-gray-600">MBTI</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-xl text-purple-600">{profile?.mbti || '-'}</span>
              <Link
                href="/profile"
                className="px-3 py-1 text-sm bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
              >
                변경
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">{profile?.gender === 'MALE' ? '👨' : profile?.gender === 'FEMALE' ? '👩' : '👤'}</span>
              <span className="text-gray-600">성별</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-800">{genderLabel}</span>
              <Link
                href="/profile"
                className="px-3 py-1 text-sm bg-gray-400 text-white rounded-full hover:bg-gray-500 transition"
              >
                변경
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-700">MBTI 다시 검사하기</p>
              <p className="text-xs text-gray-500">AI와의 대화로 정확한 MBTI를 알아보세요</p>
            </div>
            <Link
              href="/mbti-test"
              className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-full hover:bg-indigo-600 transition whitespace-nowrap"
            >
              검사하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}