import React from 'react'
import { Link } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'

interface Article {
  id: number
  title: string
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
  articles: Article[]
}

export default function ArticleIndex({ repository, articles }: Props) {
  return (
    <WikiLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">記事一覧</h1>
            <p className="mt-2 text-sm text-gray-700">
              リポジトリ「{repository.name}」の記事一覧
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href={route('wiki.repositories.articles.create', repository.id)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              新しい記事
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {articles?.map((article) => (
                <li key={article.id}>
                  <Link
                    href={route('wiki.repositories.articles.show', [repository.id, article.id])}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                              <span className="font-medium text-indigo-600">
                                {article.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="truncate text-sm font-medium text-indigo-600">
                                {article.title}
                              </p>
                              <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {article.branch.name}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span>作成者: {article.author.name}</span>
                              <span>作成日: {new Date(article.created_at).toLocaleDateString('ja-JP')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <p>更新: {new Date(article.updated_at).toLocaleDateString('ja-JP')}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              {articles.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-500">
                  記事がありません
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </WikiLayout>
  )
}
