'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, type Gender } from '@/lib/api';

const mbtiPairs = [
  { options: ['E', 'I'], labels: ['외향', '내향'] },
  { options: ['S', 'N'], labels: ['감각', '직관'] },
  { options: ['T', 'F'], labels: ['사고', '감정'] },
  { options: ['J', 'P'], labels: ['판단', '인식'] },
];

export default function MypageClient() {
  const { user, profile, refresh } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [mbtiSelections, setMbtiSelections] = useState<(string | null)[]>([null, null, null, null]);
  const [gender, setGender] = useState<Gender | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genderLabel = profile?.gender === 'MALE' ? '남성' : profile?.gender === 'FEMALE' ? '여성' : '-';

  const startEditing = () => {
    // Initialize with current values
    if (profile?.mbti) {
      setMbtiSelections(profile.mbti.split(''));
    } else {
      setMbtiSelections([null, null, null, null]);
    }
    setGender(profile?.gender || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleMbtiSelect = (index: number, value: string) => {
    const newSelections = [...mbtiSelections];
    newSelections[index] = value;
    setMbtiSelections(newSelections);
  };

  const mbti = mbtiSelections.every(s => s !== null) ? mbtiSelections.join('') : '';

  const handleSave = async () => {
    if (!mbti || !gender) {
      alert('MBTI와 성별을 모두 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({ mbti, gender });
      await refresh();
      setIsEditing(false);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show edit form
  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-8">
          <div className="text-center space-y-2">
            <div className="text-4xl">📝</div>
            <h1 className="text-2xl font-bold text-gray-700">프로필 수정</h1>
            <p className="text-gray-500 text-sm">MBTI와 성별을 선택해주세요</p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-600">
              MBTI
            </label>
            <div className="space-y-3">
              {mbtiPairs.map((pair, index) => (
                <div key={index} className="flex gap-3">
                  {pair.options.map((option, optionIndex) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleMbtiSelect(index, option)}
                      className={`cursor-pointer flex-1 py-4 rounded-xl font-semibold transition ${
                        mbtiSelections[index] === option
                          ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-lg">{option}</div>
                      <div className="text-xs opacity-70">{pair.labels[optionIndex]}</div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            {mbti && (
              <div className="p-4 bg-pink-50 rounded-xl text-center">
                <p className="text-xs text-gray-500">선택한 MBTI</p>
                <p className="text-xl font-bold text-pink-500">{mbti}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-600">
              성별
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '남성', value: 'MALE' as Gender },
                { label: '여성', value: 'FEMALE' as Gender },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setGender(item.value)}
                  className={`cursor-pointer px-6 py-4 rounded-xl transition text-left ${
                    gender === item.value
                      ? 'bg-purple-100 border-2 border-purple-400'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-semibold">{item.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={cancelEditing}
              className="cursor-pointer flex-1 py-4 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="cursor-pointer flex-1 py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show profile view
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
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">{profile?.gender === 'MALE' ? '👨' : profile?.gender === 'FEMALE' ? '👩' : '👤'}</span>
              <span className="text-gray-600">성별</span>
            </div>
            <span className="font-medium text-gray-800">{genderLabel}</span>
          </div>

          <button
            onClick={startEditing}
            className="cursor-pointer w-full py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition"
          >
            프로필 수정
          </button>
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
