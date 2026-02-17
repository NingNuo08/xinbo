import React from 'react';
import { Github } from 'lucide-react';

const FOOTER_CONFIG = {
  githubUrl: 'https://github.com/NingNuo08/xinbo',
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800/50 border-t border-slate-700/50 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-sm">心波 v1.0.0</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>实时心率监控 · 数据分析</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={FOOTER_CONFIG.githubUrl}
              className="text-slate-400 hover:text-white transition-colors"
              title="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-center text-xs text-slate-500">
            免责声明：本系统提供的心率数据仅供参考，不构成任何医疗建议。如有健康问题，请咨询专业医疗人员。本系统不对因使用或依赖本系统数据而导致的任何损失或损害承担责任。
          </p>
        </div>
      </div>
    </footer>
  );
};
