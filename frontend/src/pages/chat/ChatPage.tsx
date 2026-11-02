import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi, documentApi } from '../../services/api';
import { ChatSession, ChatMessage } from '../../types';
import {
  MessageSquareCode,
  Send,
  Plus,
  Sparkles,
  FileText,
  Trash2,
  Layers,
  BookOpen,
  Paperclip,
  Image as ImageIcon,
  X,
  UploadCloud,
  ChevronLeft,
  FileCheck,
} from 'lucide-react';
import { FormattedText } from '../../components/common/FormattedText';

export const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSessionId = searchParams.get('session');
  const queryClient = useQueryClient();

  const [inputQuestion, setInputQuestion] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [showMobileSessions, setShowMobileSessions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Chat Sessions
  const { data: sessions = [], refetch: refetchSessions } = useQuery({
    queryKey: ['chatSessions'],
    queryFn: () => chatApi.listSessions(),
  });

  // 2. Fetch Active Session details & messages
  const {
    data: currentSession,
    isLoading: sessionLoading,
    refetch: refetchCurrentSession,
  } = useQuery({
    queryKey: ['chatSession', activeSessionId],
    queryFn: () => chatApi.getSession(activeSessionId!),
    enabled: !!activeSessionId,
  });

  // 3. Fetch documents for selection
  const { data: docsData, refetch: refetchDocs } = useQuery({
    queryKey: ['availableDocuments'],
    queryFn: () => documentApi.list({ limit: 50, status: 'READY' }),
  });

  const availableDocs = docsData?.documents || [];

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  // Set default session if none selected and sessions exist
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setSearchParams({ session: sessions[0].id });
    }
  }, [sessions, activeSessionId, setSearchParams]);

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (docId?: string) => chatApi.createSession(undefined, docId || undefined),
    onSuccess: (newSession) => {
      refetchSessions();
      setSearchParams({ session: newSession.id });
      setShowMobileSessions(false);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, question }: { sessionId: string; question: string }) =>
      chatApi.sendMessage(sessionId, question),
    onSuccess: () => {
      setInputQuestion('');
      clearAttachment();
      refetchCurrentSession();
      refetchSessions();
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => chatApi.deleteSession(sessionId),
    onSuccess: () => {
      refetchSessions();
      setSearchParams({});
    },
  });

  // Handle attachment selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED_EXTS = ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.webp'];
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTS.includes(ext) && !file.type.startsWith('image/')) {
      alert(`⚠️ Định dạng file "${ext || 'không xác định'}" không được hỗ trợ. Vui lòng chọn tài liệu PDF, DOCX, TXT hoặc hình ảnh.`);
      clearAttachment();
      return;
    }

    setAttachedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachedPreview(null);
    }
  };

  const clearAttachment = () => {
    setAttachedFile(null);
    setAttachedPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || !activeSessionId || sendMessageMutation.isPending) return;

    let finalQuestion = inputQuestion.trim();

    // If an attachment is present
    if (attachedFile) {
      // If it's a document file, upload it into system
      const isDoc =
        attachedFile.name.endsWith('.pdf') ||
        attachedFile.name.endsWith('.docx') ||
        attachedFile.name.endsWith('.txt');

      if (isDoc) {
        setIsUploadingAttachment(true);
        try {
          const formData = new FormData();
          formData.append('file', attachedFile);
          formData.append('title', attachedFile.name.replace(/\.[^/.]+$/, ''));
          formData.append('description', 'Tải lên trực tiếp từ cửa sổ Trợ lý AI SmartDoc');
          const uploadedDoc = await documentApi.upload(formData);
          refetchDocs();
          finalQuestion += `\n\n[Đính kèm tài liệu: "${uploadedDoc.title}"]`;
        } catch (uploadErr) {
          console.warn('Lỗi khi tải tài liệu đính kèm:', uploadErr);
        } finally {
          setIsUploadingAttachment(false);
        }
      } else if (attachedFile.type.startsWith('image/')) {
        finalQuestion += `\n\n[Đính kèm hình ảnh từ thiết bị: "${attachedFile.name}"]`;
      }
    }

    sendMessageMutation.mutate({
      sessionId: activeSessionId,
      question: finalQuestion,
    });
  };

  const handleNewChat = () => {
    createSessionMutation.mutate(selectedDocId || undefined);
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] sm:h-[calc(100vh-7.5rem)] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm relative">
      {/* Mobile Drawer Backdrop */}
      {showMobileSessions && (
        <div
          onClick={() => setShowMobileSessions(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-30 md:hidden animate-in fade-in duration-150"
        />
      )}

      {/* 1. Left Sidebar: Chat Sessions */}
      <div
        className={`${
          showMobileSessions ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } fixed md:relative inset-y-0 left-0 md:inset-auto z-40 w-72 max-w-[82vw] h-full border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm transition-transform duration-200`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3.5">
          <div className="flex items-center justify-between">
            <button
              onClick={handleNewChat}
              disabled={createSessionMutation.isPending}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base font-semibold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Plus className="w-5 h-5" />
              <span>Đoạn chat mới</span>
            </button>
            <button
              onClick={() => setShowMobileSessions(false)}
              className="md:hidden ml-2 p-2.5 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Document filter for new chat */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Gắn với tài liệu:
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm truncate focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Toàn bộ tài liệu (Hỏi chung)</option>
              {availableDocs.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
          {sessions.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              <MessageSquareCode className="w-9 h-9 mx-auto text-slate-300 mb-2.5" />
              <span>Chưa có cuộc trò chuyện nào</span>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  setSearchParams({ session: session.id });
                  setShowMobileSessions(false);
                }}
                className={`group flex items-center justify-between p-3 rounded-xl text-base font-medium cursor-pointer transition ${
                  activeSessionId === session.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <MessageSquareCode className="w-4.5 h-4.5 shrink-0" />
                  <span className="truncate">{session.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSessionMutation.mutate(session.id);
                  }}
                  className={`opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-lg hover:text-rose-400 transition ${
                    activeSessionId === session.id ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
        {/* Chat Header */}
        <div className="h-18 px-5 md:px-7 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 truncate">
            {/* Mobile Toggle Drawer Button */}
            <button
              onClick={() => setShowMobileSessions(true)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 mr-1"
              title="Danh sách đoạn chat"
            >
              <MessageSquareCode className="w-5 h-5" />
            </button>

            <img src="/logo.png" alt="SmartDoc" className="w-6 h-6 rounded-md object-contain shrink-0" />
            <h2 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-200 truncate">
              {currentSession?.title || 'SmartDoc Trợ lý Học tập'}
            </h2>
            {currentSession?.document && (
              <span className="text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 px-3 py-1.5 rounded-xl font-bold truncate max-w-[200px] md:max-w-sm ml-1.5 border border-indigo-100/60 dark:border-indigo-900/60">
                📄 {currentSession.document.title}
              </span>
            )}
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-7">
          {!activeSessionId ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Sparkles className="w-16 h-16 text-indigo-400 mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-200">
                Chào mừng bạn đến với Trợ lý RAG SmartDoc
              </h3>
              <p className="text-base text-slate-500 max-w-lg mt-2">
                Hãy chọn hoặc tạo một cuộc trò chuyện mới để bắt đầu hỏi đáp chuyên sâu từ tài liệu.
              </p>
            </div>
          ) : sessionLoading ? (
            <div className="py-24 text-center text-base text-slate-400">Đang tải cuộc trò chuyện...</div>
          ) : currentSession?.messages?.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <BookOpen className="w-14 h-14 text-slate-300 mb-3" />
              <p className="text-base md:text-lg font-bold text-slate-700 dark:text-slate-300">Cuộc trò chuyện mới</p>
              <p className="text-sm md:text-base text-slate-500 mt-2 max-w-lg leading-relaxed">
                Nhập câu hỏi của bạn hoặc tải lên tài liệu/ảnh từ thiết bị bên dưới để AI phân tích và trả lời ngay.
              </p>
            </div>
          ) : (
            currentSession?.messages?.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 text-base leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-0.5 p-1.5">
                    <img src="/logo.png" alt="SmartDoc" className="w-full h-full object-contain" />
                  </div>
                )}

                <div
                  className={`max-w-[94%] sm:max-w-3xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  }`}
                >
                  <FormattedText
                    content={msg.content}
                    className={msg.role === 'user' ? 'text-white' : 'text-slate-800 dark:text-slate-200'}
                  />

                  {/* Sources Citation Section */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Layers className="w-4 h-4" />
                        <span>Trích dẫn nguồn tài liệu:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {msg.sources.map((s, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                            <span>
                              {s.documentName} — <strong>Trang {s.pageNumber}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {(sendMessageMutation.isPending || isUploadingAttachment) && (
            <div className="flex gap-3 sm:gap-3.5 justify-start text-sm sm:text-base">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl sm:rounded-3xl rounded-bl-none p-4 sm:p-5 text-slate-600 dark:text-slate-300 flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
                <span className="inline-block w-4 h-4 sm:w-5 sm:h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                <span>
                  {isUploadingAttachment
                    ? 'Đang tải tài liệu từ thiết bị và vector hóa...'
                    : 'SmartDoc AI đang tra cứu pgvector và tổng hợp câu trả lời...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Device File & Image Attachment */}
        {activeSessionId && (
          <div className="p-3 sm:p-4 md:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {/* Attachment Preview Badge */}
            {attachedFile && (
              <div className="mb-2.5 sm:mb-3 flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs sm:text-sm text-indigo-800 dark:text-indigo-200 max-w-fit">
                {attachedPreview ? (
                  <img src={attachedPreview} alt="Preview" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover" />
                ) : (
                  <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                )}
                <div className="truncate max-w-[200px] sm:max-w-md">
                  <p className="font-semibold text-xs sm:text-sm truncate">{attachedFile.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {(attachedFile.size / 1024).toFixed(1)} KB • Sẵn sàng phân tích
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearAttachment}
                  className="p-1 hover:bg-indigo-200 dark:hover:bg-indigo-900 rounded-xl text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 sm:gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.docx,.txt,image/png,image/jpeg,image/webp"
                className="hidden"
              />

              {/* Attach File Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Tải tệp hoặc ảnh từ thiết bị"
                className="p-2.5 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 transition shrink-0"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder="Hỏi bất kỳ điều gì về tài liệu..."
                  className="w-full pl-3.5 sm:pl-5 pr-12 sm:pr-16 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none transition placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!inputQuestion.trim() || sendMessageMutation.isPending || isUploadingAttachment}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
