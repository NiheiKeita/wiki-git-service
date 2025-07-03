import React from 'react'
import { Link } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'

interface Branch {
  id: number;
  name: string;
}

interface Repository {
  id: number;
  name: string;
}

interface Article {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  branch: Branch;
}

interface Props {
  repository: Repository;
  branch: Branch;
  articles: Article[];
}

export default function BranchArticlesIndex({ repository, branch, articles }: Props) {
  return (
    <WikiLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">「{branch.name}」ブランチの記事一覧</h1>
          <p className="mt-2 text-sm text-gray-700">
            リポジトリ「{repository.name}」の「{branch.name}」ブランチで追加・更新された記事一覧です。
          </p>
          <div className="mt-4 flex space-x-2">
            <Link
              href={route('wiki.repositories.branches.index', repository.id)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              ブランチ管理に戻る
            </Link>
            <Link
              href={route('wiki.repositories.branches.articles.create', [repository.id, branch.id])}
              className="inline-flex items-center rounded-md border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
            >
              新しい記事を追加
            </Link>
          </div>
        </div>
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {articles.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">
                このブランチには記事がありません
              </li>
            )}
            {articles.map((article) => (
              <li key={article.id}>
                <Link
                  href={route('wiki.repositories.branches.articles.show', [repository.id, branch.id, article.id])}
                  className="block px-4 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-medium text-indigo-700">{article.title}</div>
                      <div className="text-sm text-gray-500">作成日: {new Date(article.created_at).toLocaleDateString('ja-JP')}</div>
                      <div className="text-sm text-gray-500">更新日: {new Date(article.updated_at).toLocaleDateString('ja-JP')}</div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WikiLayout>
  )
}
