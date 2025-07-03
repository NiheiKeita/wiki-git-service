import React from 'react'
import { useForm } from '@inertiajs/react'
import { Link } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'
import MarkdownEditor from '@/Components/MarkdownEditor'

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

export default function BranchArticleEdit({ repository, branch, article }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    title: article.title,
    content: article.content,
    commit_message: '記事を更新',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(route('wiki.repositories.articles.update', [repository.id, article.id]))
  }

  return (
    <WikiLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">記事を編集</h1>
          <p className="mt-2 text-sm text-gray-700">
            リポジトリ「{repository.name}」 / ブランチ「{branch.name}」
          </p>
          <div className="mt-4">
            <Link
              href={route('wiki.repositories.branches.articles.show', [repository.id, branch.id, article.id])}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              記事詳細に戻る
            </Link>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
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
            <Link
              href={route('wiki.repositories.branches.articles.show', [repository.id, branch.id, article.id])}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {processing ? '更新中...' : '記事を更新'}
            </button>
          </div>
        </form>
      </div>
    </WikiLayout>
  )
}
