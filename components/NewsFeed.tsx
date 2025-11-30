import React from 'react';
import { NewsItem } from '../types';
import { ExternalLink, Newspaper } from 'lucide-react';

interface NewsFeedProps {
  news: NewsItem[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  if (news.length === 0) return null;

  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 h-full backdrop-blur-sm">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Newspaper className="text-indigo-400" />
        Latest News
      </h3>
      <div className="space-y-4">
        {news.map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-indigo-500/50 hover:bg-gray-800 transition-all duration-200"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="text-gray-200 font-medium group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                {item.source && (
                  <span className="text-xs text-gray-500 mt-2 block font-mono">
                    {item.source}
                  </span>
                )}
              </div>
              <ExternalLink size={16} className="text-gray-600 group-hover:text-indigo-400 shrink-0 mt-1" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;