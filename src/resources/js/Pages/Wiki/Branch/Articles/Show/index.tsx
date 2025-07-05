import React, { useState } from 'react'
import { Link, useForm } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'
import MarkdownEditor from '@/Components/MarkdownEditor'
import ReactDiffViewer from 'react-diff-viewer'

interface Branch {
  id: number;
  name: string;
}

interface Repository {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface Commit {
  id: number;
  hash: string;
  message: string;
  created_at: string;
  user: User;
}

interface Article {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  branch: Branch;
  commits: Commit[];
}

interface Props {
  repository: Repository;
  branch: Branch;
  article: Article;
  htmlContent: string;
}

export default function BranchArticleShow({ repository, branch, article, htmlContent }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [originalContent, setOriginalContent] = useState(article.content)
  const [originalTitle, setOriginalTitle] = useState(article.title)

  const { data, setData, put, processing, errors } = useForm({
    title: article.title,
    content: article.content,
    commit_message: '記事を更新',
  })

  const handleEdit = () => {
    setIsEditing(true)
    setData({
      title: article.title,
      content: article.content,
      commit_message: '記事を更新',
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setData({
      title: originalTitle,
      content: originalContent,
      commit_message: '記事を更新',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(route('wiki.repositories.articles.update', [repository.id, article.id]), {
      onSuccess: () => {
        setIsEditing(false)
        setOriginalContent(data.content)
        setOriginalTitle(data.title)
      },
    })
  }

  return (
    <WikiLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">{article.title}</h1>
          <p className="mt-2 text-sm text-gray-700">
            リポジトリ「{repository.name}」 / ブランチ「{branch.name}」
          </p>
          <div className="mt-4 flex space-x-2">
            <Link
              href={route('wiki.repositories.branches.articles', [repository.id, branch.id])}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              ブランチの記事一覧に戻る
            </Link>
            {!isEditing && (
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center rounded-md border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                記事を編集
              </button>
            )}
          </div>
        </div>
        {isEditing ? (
          <div className="space-y-6">
            {/* 編集フォーム */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">記事を編集</h3>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    タイトル
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    内容
                  </label>
                  <MarkdownEditor
                    value={data.content}
                    onChange={(content) => setData('content', content)}
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="commit_message" className="block text-sm font-medium text-gray-700">
                    コミットメッセージ
                  </label>
                  <input
                    type="text"
                    id="commit_message"
                    value={data.commit_message}
                    onChange={(e) => setData('commit_message', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.commit_message && (
                    <p className="mt-1 text-sm text-red-600">{errors.commit_message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {processing ? '更新中...' : '記事を更新'}
                  </button>
                </div>
              </form>
            </div>

            {/* 差分表示 */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">変更内容のプレビュー</h3>
              </div>
              <div className="p-4 sm:p-6">
                <ReactDiffViewer
                  oldValue={originalContent}
                  newValue={data.content}
                  splitView={true}
                  useDarkTheme={false}
                  styles={{
                    diffContainer: {
                      pre: {
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e1e4e8',
                        borderRadius: '6px',
                        fontSize: '12px',
                        lineHeight: '1.45',
                        overflow: 'auto',
                        padding: '16px',
                      },
                    },
                    line: {
                      padding: '4px 8px',
                      '&:hover': {
                        backgroundColor: '#f6f8fa',
                      },
                    },
                    gutter: {
                      backgroundColor: '#f6f8fa',
                      color: '#586069',
                      padding: '4px 8px',
                      borderRight: '1px solid #e1e4e8',
                    },
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 shadow sm:rounded-lg">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
              <div className="mt-6 text-sm text-gray-500">
                作成日: {new Date(article.created_at).toLocaleDateString('ja-JP')}<br />
                更新日: {new Date(article.updated_at).toLocaleDateString('ja-JP')}
              </div>
            </div>

            {/* コミット履歴 */}
            {article.commits && article.commits.length > 0 && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900">編集履歴</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {article.commits.map((commit) => (
                    <div key={commit.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{commit.message}</span>
                            <span className="font-mono text-xs text-gray-500">{commit.hash.substring(0, 8)}</span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {commit.user.name} • {new Date(commit.created_at).toLocaleString('ja-JP')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </WikiLayout>
  )
}
