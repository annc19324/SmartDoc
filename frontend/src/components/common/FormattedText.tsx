import React from 'react';

interface FormattedTextProps {
  content: string;
  className?: string;
}

export const cleanMarkdownText = (raw: string): string => {
  if (!raw) return '';
  return raw
    .replace(/^#{1,6}\s+/gm, '') // Remove heading hashes #, ##, ###
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **bold**
    .replace(/\*([^*]+)\*/g, '$1') // Remove *italic*
    .replace(/^\*\s+/gm, '• ') // Convert raw asterisk bullet to clean bullet point
    .replace(/\\([#*_`$])/g, '$1') // Unescape escaped symbols
    .replace(/\$([^$]+)\$/g, '$1') // Remove dollar signs around math formulas (e.g. $O(N \log N)$ -> O(N log N))
    .trim();
};

export const FormattedText: React.FC<FormattedTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into lines
  const lines = content.split('\n');

  return (
    <div className={`space-y-3 leading-relaxed text-sm md:text-base ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // Clean any residual markdown symbols
        const cleaned = cleanMarkdownText(trimmed);

        // Check if line looks like a header (was ### or ended with colon)
        const isHeader =
          trimmed.startsWith('#') ||
          (trimmed.endsWith(':') && trimmed.length < 60) ||
          /^[0-9]+\.\s+[A-ZÀ-Ỹ]/.test(trimmed);

        // Bullet point line
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ');

        if (isHeader) {
          return (
            <p key={idx} className="font-bold text-slate-900 dark:text-slate-100 mt-3 first:mt-0 text-base md:text-lg">
              {cleaned}
            </p>
          );
        }

        if (isBullet) {
          const bulletText = cleaned.replace(/^[-•*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2 leading-relaxed">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <span>{bulletText}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {cleaned}
          </p>
        );
      })}
    </div>
  );
};
