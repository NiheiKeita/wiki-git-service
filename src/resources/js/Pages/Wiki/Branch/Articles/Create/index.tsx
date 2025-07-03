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

interface Props {
  repository: Repository;
  branch: Branch;
}

export default function BranchArticleCreate({ repository, branch }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    content: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 既存のArticleController@storeを使う
    post(route('wiki.repositories.articles.store', repository.id), {
      preserveScroll: true,
      onSuccess: () => {
        // 成功時はブランチの記事一覧に戻る
        window.location.href = route('wiki.repositories.branches.articles', [repository.id, branch.id])
      },
    })
  }

  return (
    <WikiLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">新しい記事を追加</h1>
          <p className="mt-2 text-sm text-gray-700">
            リポジトリ「{repository.name}」 / ブランチ「{branch.name}」
          </p>
          <div className="mt-4">
            <Link
              href={route('wiki.repositories.branches.articles', [repository.id, branch.id])}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              記事一覧に戻る
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
          <input type="hidden" name="branch_id" value={branch.id} />
          <div className="flex justify-end space-x-3">
            <Link
              href={route('wiki.repositories.branches.articles', [repository.id, branch.id])}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {processing ? '作成中...' : '記事を作成'}
            </button>
          </div>
        </form>
      </div>
    </WikiLayout>
  )
}
