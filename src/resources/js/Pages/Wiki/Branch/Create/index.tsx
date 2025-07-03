import React from 'react'
import { useForm } from '@inertiajs/react'
import { Link } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'
import InputLabel from '@/Components/InputLabel'
import TextInput from '@/Components/TextInput'
import InputError from '@/Components/InputError'

interface Repository {
  id: number;
  name: string;
  description: string;
}

interface Props {
  repository: Repository;
}

export default function BranchCreate({ repository }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('wiki.repositories.branches.store', repository.id))
  }

  return (
    <WikiLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">新しいブランチ</h1>
              <p className="mt-1 text-sm text-gray-500">
                {repository.name} - 新しいブランチを作成
              </p>
            </div>
            <Link
              href={route('wiki.repositories.branches.index', repository.id)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              ブランチ一覧に戻る
            </Link>
          </div>
        </div>

        {/* フォーム */}
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <InputLabel htmlFor="name" value="ブランチ名" />
              <TextInput
                id="name"
                type="text"
                className="mt-1 block w-full"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                required
                autoFocus
              />
              <InputError message={errors.name} className="mt-2" />
            </div>

            <div>
              <InputLabel htmlFor="description" value="説明（任意）" />
              <textarea
                id="description"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                rows={3}
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
              />
              <InputError message={errors.description} className="mt-2" />
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href={route('wiki.repositories.branches.index', repository.id)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {processing ? '作成中...' : 'ブランチを作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </WikiLayout>
  )
}
