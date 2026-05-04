import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, ExternalLink, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PROMPT_CHIPS,
  chatStream,
  classifyIntent,
  researchStream,
  type ResearchEvent,
  type SourceRef,
  MODELS,
} from '../mocks/agent';
import { useT, useI18n } from '../i18n/I18nProvider';
import { STRINGS } from '../i18n/strings';
import PageMasthead from '../components/PageMasthead';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  mode: 'chat' | 'research';
  text: string;
  done: boolean;
  // research-only state
  thoughts?: string[];
  status?: string;
  sources?: SourceRef[];
  source_reads?: SourceRef[];
}

export default function AgentChatPage() {
  const t = useT();
  const { lang } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [running, setRunning] = useState(false);
  const [model, setModel] = useState(MODELS[0].id);
  const [pendingResearch, setPendingResearch] = useState<{ promptId: string; text: string } | null>(null);
  const abort = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function newConversation() {
    abort.current?.abort();
    setMessages([]);
    setPendingResearch(null);
    setRunning(false);
  }

  async function onSelectChip(chipId: string) {
    if (running) return;
    const chip = PROMPT_CHIPS.find((c) => c.id === chipId);
    if (!chip) return;
    const userText = lang === 'zh' ? chip.prompt_zh : chip.prompt_en;
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`, role: 'user', mode: 'chat', text: userText, done: true,
    };
    setMessages((m) => [...m, userMsg]);

    setRunning(true);
    const intent = await classifyIntent(chipId);
    if (intent === 'research') {
      setPendingResearch({ promptId: chipId, text: userText });
      setRunning(false);
      return;
    }
    await runChat(chipId);
  }

  async function runChat(chipId: string) {
    setRunning(true);
    const ac = new AbortController();
    abort.current = ac;
    const aMsg: ChatMessage = {
      id: `a_${Date.now()}`, role: 'assistant', mode: 'chat', text: '', done: false,
    };
    setMessages((m) => [...m, aMsg]);
    try {
      for await (const ev of chatStream(chipId, lang, ac.signal)) {
        if (ev.type === 'done') {
          setMessages((m) => m.map((x) => x.id === aMsg.id ? { ...x, done: true } : x));
          break;
        }
        if (ev.content) {
          setMessages((m) => m.map((x) => x.id === aMsg.id ? { ...x, text: x.text + ev.content } : x));
        }
      }
    } catch {/* aborted */}
    setRunning(false);
  }

  async function runResearch(chipId: string) {
    setPendingResearch(null);
    setRunning(true);
    const ac = new AbortController();
    abort.current = ac;
    const aMsg: ChatMessage = {
      id: `a_${Date.now()}`, role: 'assistant', mode: 'research', text: '',
      done: false, thoughts: [], sources: [], source_reads: [],
    };
    setMessages((m) => [...m, aMsg]);
    try {
      for await (const ev of researchStream(chipId, lang, ac.signal) as AsyncGenerator<ResearchEvent>) {
        setMessages((m) => m.map((x) => {
          if (x.id !== aMsg.id) return x;
          if (ev.type === 'thought' && ev.thought) return { ...x, thoughts: [...(x.thoughts ?? []), ev.thought] };
          if (ev.type === 'status' && ev.status) return { ...x, status: ev.status };
          if (ev.type === 'sources_update' && ev.sources) return { ...x, sources: ev.sources };
          if (ev.type === 'source_read' && ev.source) return { ...x, source_reads: [...(x.source_reads ?? []), ev.source] };
          if (ev.type === 'content_chunk' && ev.content) return { ...x, text: x.text + ev.content };
          if (ev.type === 'done') return { ...x, done: true };
          return x;
        }));
      }
    } catch {/* aborted */}
    setRunning(false);
  }

  function abortRun() {
    abort.current?.abort();
    setRunning(false);
    setMessages((m) => m.map((x) => !x.done ? { ...x, done: true } : x));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageMasthead
        eyebrow={t(STRINGS.nav.agent)}
        title={messages.length === 0 ? t(STRINGS.agentPage.welcome) : (lang === 'zh' ? '对话进行中' : 'Conversation in progress')}
        subtitle={messages.length === 0 ? t(STRINGS.agentPage.welcomeSub) : undefined}
        right={
          <>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="font-mono text-[11px] bg-transparent border border-ink-faint/40 text-ink-muted rounded px-2 py-1 hover:text-ink hover:border-accent/60 focus:outline-none"
            >
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <button
              onClick={newConversation}
              className="font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded border border-ink-faint/40 text-ink-muted hover:text-ink hover:border-accent/60 inline-flex items-center gap-1.5"
            >
              <RotateCcw size={11} /> {t(STRINGS.agentPage.newChat)}
            </button>
          </>
        }
      />

      <div className="flex-1 flex flex-col px-8 md:px-12 max-w-5xl mx-auto w-full pb-8 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <Sparkles size={28} className="mx-auto text-accent mb-4" />
              <p className="font-display italic text-[18px] text-ink-muted">
                {t(STRINGS.agentPage.welcomeSub)}
              </p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
              >
                {msg.role === 'user' ? <UserBubble text={msg.text} /> : <AssistantMessage msg={msg} />}
              </motion.div>
            ))}
          </AnimatePresence>

          {pendingResearch && (
            <ConfirmResearchCard
              text={pendingResearch.text}
              onConfirm={() => runResearch(pendingResearch.promptId)}
              onSkip={async () => {
                setPendingResearch(null);
                await runChat(pendingResearch.promptId);
              }}
            />
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-ink-faint/25 pt-4">
          <div className="rounded border border-ink-faint/30 bg-[#1a1612]/60 px-4 py-3 flex items-end gap-3">
            <div className="flex-1 font-body text-[14px] text-ink-faint italic min-h-[28px] py-1">
              {t(STRINGS.agentPage.sendDisabled)}
            </div>
            {running ? (
              <button onClick={abortRun} className="text-loss hover:text-ink text-[12px] font-mono uppercase tracking-wider inline-flex items-center gap-1">
                <X size={13} /> {t(STRINGS.agentPage.abort)}
              </button>
            ) : (
              <button disabled className="opacity-30 text-ink-muted">
                <Send size={16} />
              </button>
            )}
          </div>

          <div className="mt-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent mb-2">
              {t(STRINGS.agentPage.presets)}
            </div>
            <div className="flex flex-wrap gap-2">
              {PROMPT_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  disabled={running || pendingResearch != null}
                  onClick={() => onSelectChip(chip.id)}
                  className="font-body text-[13px] text-left px-3 py-2 rounded border border-ink-faint/30 text-ink-muted hover:text-ink hover:border-accent/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed max-w-md"
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider text-accent mr-2">{chip.mode}</span>
                  {lang === 'zh' ? chip.prompt_zh : chip.prompt_en}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  const t = useT();
  return (
    <div className="flex justify-end">
      <div className="max-w-2xl">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent mb-1 text-right">
          {t(STRINGS.agentPage.youAsked)}
        </div>
        <div className="rounded bg-[#23191a] border border-accent/30 px-4 py-3 font-body text-[14px] text-ink leading-snug">
          {text}
        </div>
      </div>
    </div>
  );
}

function AssistantMessage({ msg }: { msg: ChatMessage }) {
  const t = useT();
  if (msg.mode === 'research') {
    return <ResearchMessage msg={msg} />;
  }
  return (
    <div className="max-w-3xl">
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent mb-2">uteki · agent</div>
      <div className="font-body text-[14.5px] text-ink leading-relaxed whitespace-pre-line">
        {msg.text}
        {!msg.done && <span className="inline-block w-2 h-3 bg-accent ml-0.5 align-middle animate-shimmer" />}
      </div>
      {!msg.done && (
        <div className="mt-2 font-mono text-[10px] text-ink-faint">{t(STRINGS.agentPage.thinking)}</div>
      )}
    </div>
  );
}

function ResearchMessage({ msg }: { msg: ChatMessage }) {
  const t = useT();
  return (
    <div className="max-w-4xl">
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent mb-2">
        uteki · research
      </div>

      {/* Live status / spinner */}
      {!msg.done && (
        <div className="mb-3 rounded border border-[#7c4ec9]/30 bg-[#1a1325]/60 px-3 py-2 font-mono text-[11px] text-[#c8a2ff] flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#c8a2ff] animate-shimmer" />
          {msg.status ?? '…'}
          {msg.sources && msg.sources.length > 0 && (
            <span className="text-ink-faint ml-2">{msg.sources.length} sources</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div>
          {/* Thoughts */}
          {msg.thoughts && msg.thoughts.length > 0 && (
            <details className="mb-4 rounded border border-ink-faint/25 bg-[#1a1612]/40">
              <summary className="cursor-pointer px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                {t(STRINGS.agentPage.thoughts)} · {msg.thoughts.length}
              </summary>
              <ul className="px-4 pb-3 pt-1 space-y-2 text-[13px] text-ink-muted font-body italic leading-relaxed">
                {msg.thoughts.map((th, i) => (
                  <li key={i} className="border-l-2 border-accent/50 pl-3">{th}</li>
                ))}
              </ul>
            </details>
          )}

          {/* Final answer */}
          <div className="font-body text-[14.5px] text-ink leading-relaxed whitespace-pre-line">
            {msg.text.split('\n').map((line, i) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <p key={i} className="font-display italic-display text-[16px] text-ink mt-4 mb-1">
                    {line.replace(/\*\*/g, '')}
                  </p>
                );
              }
              if (line.startsWith('- ')) {
                return <p key={i} className="pl-4 my-1">• {line.slice(2)}</p>;
              }
              return <p key={i} className="my-1.5">{line}</p>;
            })}
            {!msg.done && msg.text && (
              <span className="inline-block w-2 h-3 bg-accent ml-0.5 align-middle animate-shimmer" />
            )}
          </div>
        </div>

        {/* Sources panel */}
        {msg.sources && msg.sources.length > 0 && (
          <aside className="lg:sticky lg:top-4 self-start">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent mb-2">
              {t(STRINGS.agentPage.sources)} · {msg.sources.length}
            </div>
            <ul className="space-y-2">
              {msg.sources.map((s, i) => {
                const wasRead = (msg.source_reads ?? []).some((r) => r.url === s.url);
                return (
                  <li key={i}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded border border-ink-faint/20 px-2.5 py-2 hover:border-accent/60 transition-colors"
                    >
                      <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <span className="font-mono text-[10px] text-ink-faint">{s.domain}</span>
                        {wasRead && <span className="font-mono text-[9px] text-gain">✓ read</span>}
                      </div>
                      <div className="font-body text-[12px] text-ink-muted leading-snug truncate">{s.title}</div>
                      <ExternalLink size={9} className="text-ink-faint mt-1" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}

function ConfirmResearchCard({ text, onConfirm, onSkip }: { text: string; onConfirm: () => void; onSkip: () => void }) {
  const t = useT();
  return (
    <div className="max-w-2xl rounded border border-[#7c4ec9]/40 bg-[#1a1325]/60 p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#c8a2ff] mb-2">
        {t(STRINGS.agentPage.needsResearch)}
      </div>
      <p className="font-body text-[13px] text-ink-muted mb-4 italic">"{text}"</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="font-body text-[13px] px-3 py-1.5 rounded bg-[#7c4ec9] text-white hover:bg-[#9166db]"
        >
          {t(STRINGS.agentPage.confirmResearch)}
        </button>
        <button
          onClick={onSkip}
          className="font-body text-[13px] px-3 py-1.5 rounded border border-ink-faint/40 text-ink-muted hover:text-ink"
        >
          {t(STRINGS.agentPage.skipResearch)}
        </button>
      </div>
    </div>
  );
}
