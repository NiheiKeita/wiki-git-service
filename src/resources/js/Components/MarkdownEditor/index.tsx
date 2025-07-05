import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "マークダウンで記事を書いてください...",
  className = ""
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'split'>('split')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+S で保存（実際の保存処理は親コンポーネントで実装）
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      // ここで自動保存の処理を呼び出す
    }
  }

  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let insertText = ''
    if (selectedText) {
      insertText = syntax.replace('{text}', selectedText)
    } else {
      insertText = syntax.replace('{text}', placeholder)
    }

    const newValue = value.substring(0, start) + insertText + value.substring(end)
    onChange(newValue)

    // カーソル位置を調整
    setTimeout(() => {
      const newCursorPos = start + insertText.length - (selectedText ? 0 : placeholder.length)
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  const toolbarItems = [
    { label: '見出し1', action: () => insertMarkdown('# {text}', '見出し1') },
    { label: '見出し2', action: () => insertMarkdown('## {text}', '見出し2') },
    { label: '見出し3', action: () => insertMarkdown('### {text}', '見出し3') },
    { label: '太字', action: () => insertMarkdown('**{text}**', '太字テキスト') },
    { label: '斜体', action: () => insertMarkdown('*{text}*', '斜体テキスト') },
    { label: 'コード', action: () => insertMarkdown('`{text}`', 'コード') },
    { label: 'コードブロック', action: () => insertMarkdown('```\n{text}\n```', 'コードブロック') },
    { label: 'リスト', action: () => insertMarkdown('- {text}', 'リストアイテム') },
    { label: '番号リスト', action: () => insertMarkdown('1. {text}', '番号リスト') },
    { label: 'リンク', action: () => insertMarkdown('[{text}](URL)', 'リンクテキスト') },
    { label: '画像', action: () => insertMarkdown('![{text}](画像URL)', '画像の説明') },
  ]

  return (
    <div className={`overflow-hidden rounded-lg border border-gray-300 ${className}`}>
      {/* ツールバー */}
      <div className="border-b border-gray-300 bg-gray-50 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {toolbarItems.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={item.action}
                className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                title={item.label}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`rounded px-3 py-1 text-xs ${activeTab === 'edit'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
            >
              編集
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`rounded px-3 py-1 text-xs ${activeTab === 'preview'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
            >
              プレビュー
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`rounded px-3 py-1 text-xs ${activeTab === 'split'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
            >
              分割表示
            </button>
          </div>
        </div>
      </div>

      {/* エディタエリア */}
      <div className="flex">
        {(activeTab === 'edit' || activeTab === 'split') && (
          <div className={`${activeTab === 'split' ? 'w-1/2' : 'w-full'}`}>
            <textarea
              id="markdown-editor"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="h-96 w-full resize-none border-0 p-4 font-mono text-sm focus:outline-none focus:ring-0"
            />
          </div>
        )}

        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className={`${activeTab === 'split' ? 'w-1/2 border-l border-gray-300' : 'w-full'}`}>
            <div className="prose prose-sm h-96 max-w-none overflow-y-auto p-4">
              {value ? (
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }: CodeProps) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={tomorrow as any}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {value}
                </ReactMarkdown>
              ) : (
                <p className="italic text-gray-500">プレビューが表示されます</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
