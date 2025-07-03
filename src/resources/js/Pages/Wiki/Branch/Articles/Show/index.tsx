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
  article: Article;
}

export default function BranchArticleShow({ repository, branch, article }: Props) {
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
            <Link
              href={route('wiki.repositories.branches.articles.edit', [repository.id, branch.id, article.id])}
              className="inline-flex items-center rounded-md border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              記事を編集
            </Link>
          </div>
        </div>
        <div className="bg-white p-6 shadow sm:rounded-lg">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
          <div className="mt-6 text-sm text-gray-500">
            作成日: {new Date(article.created_at).toLocaleDateString('ja-JP')}<br />
            更新日: {new Date(article.updated_at).toLocaleDateString('ja-JP')}
          </div>
        </div>
      </div>
    </WikiLayout>
  )
}
