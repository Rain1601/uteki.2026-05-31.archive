interface Model {
  id: string;
  name: string;
  provider: string;
  file: string;
}

const MODELS: Model[] = [
  { id: 'claude',   name: 'Claude',   provider: 'Anthropic', file: '/icons/models/claude.png' },
  { id: 'openai',   name: 'GPT',      provider: 'OpenAI',    file: '/icons/models/openai.png' },
  { id: 'gemini',   name: 'Gemini',   provider: 'Google',    file: '/icons/models/gemini.png' },
  { id: 'deepseek', name: 'DeepSeek', provider: 'DeepSeek',  file: '/icons/models/deepseek.png' },
  { id: 'qwen',     name: 'Qwen',     provider: 'Alibaba',   file: '/icons/models/qwen.png' },
  { id: 'doubao',   name: 'Doubao',   provider: 'ByteDance', file: '/icons/models/doubao.png' },
  { id: 'minimax',  name: 'MiniMax',  provider: 'MiniMax',   file: '/icons/models/minimax.png' },
];

interface ModelLogosProps {
  variant?: 'grid' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

export default function ModelLogos({ variant = 'grid', size = 'lg' }: ModelLogosProps) {
  if (variant === 'inline') {
    const px = size === 'sm' ? 18 : size === 'md' ? 26 : 36;
    return (
      <div className="flex items-center gap-5 flex-wrap">
        {MODELS.map((m) => (
          <img
            key={m.id}
            src={m.file}
            alt={`${m.provider} ${m.name}`}
            title={`${m.provider} · ${m.name}`}
            width={px}
            height={px}
            className="opacity-70 hover:opacity-100 transition-opacity"
            style={{ filter: 'brightness(1.2)' }}
          />
        ))}
      </div>
    );
  }

  const tile = size === 'sm' ? 'p-4' : size === 'md' ? 'p-6' : 'p-7';
  const px = size === 'sm' ? 32 : size === 'md' ? 44 : 56;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {MODELS.map((m) => (
        <div
          key={m.id}
          className={`group relative rounded border border-ink-faint/25 bg-[#1a1612]/40 ${tile} flex flex-col items-center justify-center text-center hover:border-accent/60 hover:bg-[#1f1a16] transition-colors`}
          title={`${m.provider} · ${m.name}`}
        >
          <img
            src={m.file}
            alt={`${m.provider} ${m.name}`}
            width={px}
            height={px}
            className="mb-3 opacity-90 group-hover:opacity-100 transition-opacity"
            style={{ filter: 'brightness(1.05)' }}
          />
          <div className="font-display italic text-[14px] text-ink leading-tight">{m.name}</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mt-0.5">{m.provider}</div>
        </div>
      ))}
    </div>
  );
}
