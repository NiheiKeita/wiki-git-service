import React from 'react'
import { Link } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'

interface Article {
  id: number
  title: string
  content: string
  slug: string
  branch: {
    name: string
  }
  author: {
    name: string
  }
  created_at: string
  updated_at: string
}

interface Repository {
  id: number
  name: string
}

interface Props {
  repository: Repository
  article: Article
  canEdit: boolean
}

export default function ArticleShow({ repository, article, canEdit }: Props) {
  return (
    <WikiLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{article.title}</h1>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>作成者: {article.author.name}</span>
                <span>作成日: {new Date(article.created_at).toLocaleDateString('ja-JP')}</span>
                <span>更新日: {new Date(article.updated_at).toLocaleDateString('ja-JP')}</span>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {article.branch.name}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              {canEdit && (
                <Link
                  href={route('wiki.repositories.articles.edit', [repository.id, article.id])}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  編集
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">内容</h2>
              </div>
              <div className="px-6 py-4">
                <div className="prose max-w-none">
                  {article.content ? (
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                  ) : (
                    <p className="text-gray-500">内容がありません</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 記事情報 */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">記事情報</h3>
              </div>
              <div className="space-y-3 px-6 py-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">スラッグ</span>
                  <p className="text-sm text-gray-900">{article.slug}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">ブランチ</span>
                  <p className="text-sm text-gray-900">{article.branch.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">作成者</span>
                  <p className="text-sm text-gray-900">{article.author.name}</p>
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
                  href={route('wiki.repositories.articles.index', repository.id)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  記事一覧に戻る
                </Link>
                <Link
                  href={route('wiki.repositories.show', repository.id)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  リポジトリに戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WikiLayout>
  )
}
