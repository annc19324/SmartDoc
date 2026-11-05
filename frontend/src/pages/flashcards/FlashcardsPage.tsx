import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi, documentApi } from '../../services/api';
import { FlashcardDeck, Flashcard } from '../../types';
import {
  CreditCard,
  Sparkles,
  Plus,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  BookOpen,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { cleanMarkdownText } from '../../components/common/FormattedText';
import { ShareModal } from '../../components/common/ShareModal';
import { useToast } from '../../context/ToastContext';

export const FlashcardsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { copyAndNotify } = useToast();

  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [shareDeck, setShareDeck] = useState<FlashcardDeck | null>(null);

  // Form states for creating deck
  const [selectedDocId, setSelectedDocId] = useState('');
  const [cardCount, setCardCount] = useState(6);
  const [deckTitle, setDeckTitle] = useState('');

  const { data: decks = [], isLoading: loadingDecks } = useQuery({
    queryKey: ['flashcardDecks'],
    queryFn: () => aiApi.listFlashcardDecks(),
  });

  const { data: docsData } = useQuery({
    queryKey: ['documentsForFlashcards'],
    queryFn: () => documentApi.list({ limit: 50, status: 'READY' }),
  });

  const availableDocs = docsData?.documents || [];

  const createDeckMutation = useMutation({
    mutationFn: () =>
      aiApi.generateFlashcards({
        documentId: selectedDocId,
        title: deckTitle || undefined,
        cardCount,
      }),
    onSuccess: (newDeck) => {
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ['flashcardDecks'] });
      setActiveDeck(newDeck);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    },
  });

  const handleNext = () => {
    if (!activeDeck?.cards) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % activeDeck.cards!.length);
  };

  const handlePrev = () => {
    if (!activeDeck?.cards) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + activeDeck.cards!.length) % activeDeck.cards!.length);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* If viewing a deck */}
      {activeDeck ? (
        <div className="space-y-6">
          <button
            onClick={() => setActiveDeck(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Danh sách Bộ thẻ</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{activeDeck.title}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{activeDeck.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const url = activeDeck.documentId
                    ? `/flashcards?documentId=${activeDeck.documentId}`
                    : '/flashcards';
                  copyAndNotify(url, activeDeck.title);
                  setShareDeck(activeDeck);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                title="Sao chép link & chia sẻ bộ Flashcards"
              >
                <Share2 className="w-4 h-4 text-cyan-600" />
                <span>Chia sẻ</span>
              </button>
              <div className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                Thẻ {currentCardIndex + 1} / {activeDeck.cards?.length || 0}
              </div>
            </div>
          </div>

          {/* Flashcard 3D Card */}
          {activeDeck.cards && activeDeck.cards.length > 0 && (
            <div className="space-y-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="perspective-1000 w-full h-80 cursor-pointer select-none"
              >
                <div
                  className={`w-full h-full duration-500 transform-style-3d relative rounded-3xl transition-transform ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-8 flex flex-col justify-between shadow-xl">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span className="uppercase tracking-wider">Mặt trước (Khái niệm / Câu hỏi)</span>
                      <RotateCw className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-center font-bold text-base md:text-lg text-slate-800 dark:text-white px-4">
                      {activeDeck.cards[currentCardIndex].front}
                    </div>
                    <div className="text-center text-[11px] text-slate-400">
                      Bấm vào thẻ hoặc dùng phím cách để lật đáp án
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl border-2 border-indigo-700 p-8 flex flex-col justify-between shadow-xl">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-200">
                      <span className="uppercase tracking-wider">Mặt sau (Giải thích / Định nghĩa)</span>
                      <RotateCw className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-center font-medium text-sm md:text-base leading-relaxed px-4">
                      {cleanMarkdownText(activeDeck.cards[currentCardIndex].back)}
                    </div>
                    <div className="text-center text-[11px] text-indigo-300">
                      Bấm vào thẻ để quay lại mặt trước
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrev}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center gap-1 hover:text-indigo-600 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Thẻ trước</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleNext}
                    className="p-3 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                    title="Chưa nhớ (Cần ôn lại)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-3 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                    title="Đã nhớ kỹ"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handleNext}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center gap-1 hover:text-indigo-600 transition"
                >
                  <span>Thẻ kế tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Deck List View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-cyan-600" />
                <span>Thẻ Ghi Nhớ Flashcards</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Phương pháp lặp lại ngắt quãng (Spaced Repetition) giúp khắc sâu kiến thức trọng tâm
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tạo Bộ Thẻ Bằng AI</span>
            </button>
          </div>

          {loadingDecks ? (
            <div className="py-20 text-center text-xs text-slate-400">Đang tải danh sách Flashcards...</div>
          ) : decks.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Chưa có bộ Flashcard nào</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                Hãy để AI phân tích giáo trình và sinh tự động các cặp thẻ câu hỏi - định nghĩa.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-semibold"
              >
                Tạo bộ thẻ đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  onClick={async () => {
                    const fullDeck = await aiApi.getFlashcardDeckById(deck.id);
                    setActiveDeck(fullDeck);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-cyan-500 cursor-pointer transition flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
                      {deck._count?.cards || 0} thẻ ghi nhớ
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 group-hover:text-cyan-600 transition line-clamp-1">
                      {deck.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{deck.description}</p>
                    {deck.document && (
                      <p className="text-[11px] text-slate-400 mt-3 truncate flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>{deck.document.title}</span>
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-cyan-600">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = deck.documentId
                          ? `/flashcards?documentId=${deck.documentId}`
                          : '/flashcards';
                        copyAndNotify(url, deck.title);
                        setShareDeck(deck);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Sao chép link & chia sẻ bộ Flashcards"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      <span>Học ngay</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Flashcard Deck with AI */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tạo Flashcards Bằng AI</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chọn tài liệu nguồn <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">-- Chọn tài liệu trong thư viện --</option>
                  {availableDocs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề bộ thẻ
                </label>
                <input
                  type="text"
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  placeholder="Ví dụ: Flashcards DSA Cốt Lõi"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Số lượng thẻ</label>
                <select
                  value={cardCount}
                  onChange={(e) => setCardCount(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                >
                  <option value={5}>5 thẻ</option>
                  <option value={8}>8 thẻ</option>
                  <option value={12}>12 thẻ</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => createDeckMutation.mutate()}
                disabled={!selectedDocId || createDeckMutation.isPending}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow"
              >
                {createDeckMutation.isPending ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>AI đang tạo flashcards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Khởi tạo bộ thẻ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareDeck && (
        <ShareModal
          isOpen={!!shareDeck}
          onClose={() => setShareDeck(null)}
          title="Bộ thẻ ghi nhớ Flashcards"
          itemTitle={shareDeck.title}
          url={shareDeck.documentId ? `/flashcards?documentId=${shareDeck.documentId}` : '/flashcards'}
          type="flashcard"
          description={shareDeck.description || `Bộ Flashcards gồm ${shareDeck.cards?.length || shareDeck._count?.cards || 0} thẻ ghi nhớ`}
        />
      )}
    </div>
  );
};
