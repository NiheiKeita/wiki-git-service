import React from 'react'
import { Link } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'

interface Repository {
  id: number;
  name: string;
  description: string;
  slug: string;
  is_public: boolean;
  owner: {
    name: string;
  };
  branches: Array<{
    id: number;
    name: string;
    is_main: boolean;
  }>;
  articles: Array<{
    id: number;
    title: string;
    slug: string;
    branch: {
      name: string;
    };
    created_at: string;
  }>;
  pull_requests: Array<{
    id: number;
    title: string;
    status: string;
    author: {
      name: string;
    };
    source_branch: {
      name: string;
    };
    target_branch: {
      name: string;
    };
    created_at: string;
  }>;
}

interface Props {
  repository: Repository;
  userRole: string;
}

export default function RepositoryShow({ repository, userRole }: Props) {
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

  return (
    <WikiLayout repository={repository}>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{repository.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {repository.description || '説明なし'}
              </p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>作成者: {repository.owner.name}</span>
                {repository.is_public && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    公開
                  </span>
                )}
                <span>権限: {userRole}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              {userRole === 'owner' && (
                <Link
                  href={route('wiki.repositories.edit', repository.id)}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  設定
                </Link>
              )}
              {(userRole === 'owner' || userRole === 'editor') && (
                <Link
                  href={route('wiki.articles.create', repository.id)}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  新しい記事
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 最近の記事 */}
          <div className="rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium leading-6 text-gray-900">最近の記事</h3>
                <Link
                  href={route('wiki.articles.index', repository.id)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  すべて表示
                </Link>
              </div>
              <div className="space-y-3">
                {repository.articles.slice(0, 5).map((article) => (
                  <div key={article.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={route('wiki.articles.show', [repository.id, article.id])}
                        className="block truncate text-sm font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {article.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {article.branch.name} • {new Date(article.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {repository.articles.length === 0 && (
                  <p className="text-sm text-gray-500">記事がありません</p>
                )}
              </div>
            </div>
          </div>

          {/* 最近のプルリクエスト */}
          <div className="rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium leading-6 text-gray-900">最近のプルリクエスト</h3>
                <Link
                  href={route('wiki.pull-requests.index', repository.id)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  すべて表示
                </Link>
              </div>
              <div className="space-y-3">
                {repository.pull_requests.slice(0, 5).map((pr) => (
                  <div key={pr.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={route('wiki.pull-requests.show', [repository.id, pr.id])}
                        className="block truncate text-sm font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {pr.title}
                      </Link>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getStatusColor(pr.status)}`}>
                          {pr.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {pr.source_branch.name} → {pr.target_branch.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {pr.author.name} • {new Date(pr.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {repository.pull_requests.length === 0 && (
                  <p className="text-sm text-gray-500">プルリクエストがありません</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ブランチ一覧 */}
        <div className="mt-8 rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">ブランチ</h3>
            <div className="space-y-2">
              {repository.branches.map((branch) => (
                <div key={branch.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{branch.name}</span>
                    {branch.is_main && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        メイン
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WikiLayout>
  )
}
