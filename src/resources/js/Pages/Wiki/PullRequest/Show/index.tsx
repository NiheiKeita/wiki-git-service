import React, { useState } from 'react'
import { useForm } from '@inertiajs/react'
import { Link } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'

interface Comment {
  id: number
  content: string
  author: {
    name: string
  }
  created_at: string
}

interface PullRequest {
  id: number
  title: string
  description: string
  status: 'open' | 'merged' | 'closed'
  author: {
    name: string
  }
  source_branch: {
    name: string
  }
  target_branch: {
    name: string
  }
  created_at: string
  updated_at: string
  comments: Comment[]
}

interface Repository {
  id: number
  name: string
}

interface Props {
  repository: Repository
  pullRequest: PullRequest
  canMerge: boolean
  canClose: boolean
}

export default function PullRequestShow({ repository, pullRequest, canMerge, canClose }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    content: '',
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'merged':
        return 'bg-purple-100 text-purple-800'
      case 'closed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'オープン'
      case 'merged':
        return 'マージ済み'
      case 'closed':
        return 'クローズ'
      default:
        return status
    }
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('wiki.repositories.pull-requests.comments.store', [repository.id, pullRequest.id]), {
      onSuccess: () => {
        setData('content', '')
      },
    })
  }

  const handleMerge = () => {
    if (confirm('このプルリクエストをマージしますか？')) {
      post(route('wiki.repositories.pull-requests.merge', [repository.id, pullRequest.id]))
    }
  }

  const handleClose = () => {
    if (confirm('このプルリクエストをクローズしますか？')) {
      post(route('wiki.repositories.pull-requests.close', [repository.id, pullRequest.id]))
    }
  }

  return (
    <WikiLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">#{pullRequest.id} {pullRequest.title}</h1>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>作成者: {pullRequest.author.name}</span>
                <span>作成日: {new Date(pullRequest.created_at).toLocaleDateString('ja-JP')}</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(pullRequest.status)}`}>
                  {getStatusText(pullRequest.status)}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              {canMerge && pullRequest.status === 'open' && (
                <button
                  onClick={handleMerge}
                  className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  マージ
                </button>
              )}
              {canClose && pullRequest.status === 'open' && (
                <button
                  onClick={handleClose}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  クローズ
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* メインコンテンツ */}
          <div className="space-y-6 lg:col-span-2">
            {/* 説明 */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">説明</h2>
              </div>
              <div className="px-6 py-4">
                <div className="prose max-w-none">
                  {pullRequest.description ? (
                    <div dangerouslySetInnerHTML={{ __html: pullRequest.description }} />
                  ) : (
                    <p className="text-gray-500">説明がありません</p>
                  )}
                </div>
              </div>
            </div>

            {/* コメント */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">コメント</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {pullRequest.comments?.map((comment) => (
                  <div key={comment.id} className="px-6 py-4">
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                          <span className="text-sm font-medium text-gray-600">
                            {comment.author.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* コメント投稿フォーム */}
              {pullRequest.status === 'open' && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <form onSubmit={handleCommentSubmit}>
                    <div>
                      <label htmlFor="content" className="sr-only">
                        コメント
                      </label>
                      <textarea
                        id="content"
                        rows={3}
                        value={data.content}
                        onChange={(e) => setData('content', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="コメントを入力してください"
                      />
                      {errors.content && (
                        <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                      )}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="submit"
                        disabled={processing || !data.content.trim()}
                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {processing ? '投稿中...' : 'コメントを投稿'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* ブランチ情報 */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">ブランチ</h3>
              </div>
              <div className="space-y-3 px-6 py-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">ソースブランチ</span>
                  <p className="text-sm text-gray-900">{pullRequest.source_branch.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">ターゲットブランチ</span>
                  <p className="text-sm text-gray-900">{pullRequest.target_branch.name}</p>
                </div>
              </div>
            </div>

            {/* アクション */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">アクション</h3>
              </div>
              <div className="space-y-3 p-6">
                <Link
                  href={route('wiki.repositories.pull-requests.index', repository.id)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  プルリクエスト一覧に戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WikiLayout>
  )
}
