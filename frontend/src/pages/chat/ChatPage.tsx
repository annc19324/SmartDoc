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
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSessionId = searchParams.get('session');
  const queryClient = useQueryClient();

  const [inputQuestion, setInputQuestion] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  const { data: docsData } = useQuery({
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
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, question }: { sessionId: string; question: string }) =>
      chatApi.sendMessage(sessionId, question),
    onSuccess: () => {
      setInputQuestion('');
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || !activeSessionId || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      sessionId: activeSessionId,
      question: inputQuestion.trim(),
    });
  };

  const handleNewChat = () => {
    createSessionMutation.mutate(selectedDocId || undefined);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* 1. Left Sidebar: Chat Sessions */}
      <div className="w-72 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <button
            onClick={handleNewChat}
            disabled={createSessionMutation.isPending}
            className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Đoạn chat mới</span>
          </button>

          {/* Document filter for new chat */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Gắn với tài liệu:
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs truncate"
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
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {sessions.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">Chưa có phiên chat nào.</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSearchParams({ session: session.id })}
                className={`group flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition ${
                  activeSessionId === session.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <MessageSquareCode className="w-4 h-4 shrink-0" />
                  <span className="truncate">{session.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSessionMutation.mutate(session.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:text-rose-400 transition ${
                    activeSessionId === session.id ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
        {/* Chat Header */}
        <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {currentSession?.title || 'SmartDoc RAG AI Assistant'}
            </h2>
            {currentSession?.document && (
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-semibold ml-2">
                📄 {currentSession.document.title}
              </span>
            )}
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeSessionId ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Sparkles className="w-12 h-12 text-indigo-400 mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Chào mừng bạn đến với Trợ lý RAG SmartDoc
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Hãy chọn hoặc tạo một cuộc trò chuyện mới để bắt đầu hỏi đáp chuyên sâu từ tài liệu.
              </p>
            </div>
          ) : sessionLoading ? (
            <div className="py-20 text-center text-xs text-slate-400">Đang tải cuộc trò chuyện...</div>
          ) : currentSession?.messages?.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <BookOpen className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Cuộc trò chuyện mới</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                Nhập câu hỏi của bạn vào khung bên dưới. AI sẽ tìm kiếm các trang tài liệu phù hợp nhất để trả lời.
              </p>
            </div>
          ) : (
            currentSession?.messages?.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Sources Citation Section */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>Trích dẫn nguồn tài liệu:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((s, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-2xs"
                          >
                            <FileText className="w-3 h-3 text-indigo-500" />
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

          {sendMessageMutation.isPending && (
            <div className="flex gap-3 justify-start text-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none p-4 text-slate-500 flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                <span>SmartDoc AI đang tra cứu pgvector và tổng hợp câu trả lời...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        {activeSessionId && (
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Hỏi bất kỳ điều gì về tài liệu của bạn (ví dụ: Quick Sort là gì?)..."
                className="w-full pl-4 pr-14 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || sendMessageMutation.isPending}
                className="absolute right-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
