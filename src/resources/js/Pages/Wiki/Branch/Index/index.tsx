import React from 'react'
import { Link } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'

interface Branch {
  id: number
  name: string
  description: string | null
  is_main: boolean
  articles_count: number
  created_at: string
}

interface Repository {
  id: number
  name: string
  description: string
  slug: string
  branches: Branch[]
}

interface Props {
  repository: Repository
}

export default function BranchIndex({ repository }: Props) {
  return (
    <WikiLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">ブランチ管理</h1>
              <p className="mt-1 text-sm text-gray-500">
                {repository.name} - ブランチの作成・編集・削除
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={route('wiki.repositories.show', repository.id)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                リポジトリに戻る
              </Link>
              <Link
                href={route('wiki.repositories.branches.create', repository.id)}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                新しいブランチ
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {repository.branches?.map((branch) => (
              <li key={branch.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {branch.name}
                          </span>
                          {branch.is_main && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                              メイン
                            </span>
                          )}
                        </div>
                        {branch.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {branch.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        {branch.articles_count} 記事
                      </div>
                      <div className="text-sm text-gray-500">
                        作成: {new Date(branch.created_at).toLocaleDateString('ja-JP')}
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={route('wiki.repositories.branches.edit', [repository.id, branch.id])}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          編集
                        </Link>
                        <Link
                          href={route('wiki.repositories.branches.articles', [repository.id, branch.id])}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900"
                        >
                          記事一覧
                        </Link>
                        {!branch.is_main && branch.articles_count === 0 && (
                          <button
                            onClick={() => {
                              if (confirm('このブランチを削除しますか？')) {
                                // 削除処理
                              }
                            }}
                            className="text-sm font-medium text-red-600 hover:text-red-900"
                          >
                            削除
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {repository.branches?.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-gray-500">
              <p>ブランチがありません</p>
              <p className="mt-2">
                <Link
                  href={route('wiki.repositories.branches.create', repository.id)}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  最初のブランチを作成
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </WikiLayout>
  )
}
