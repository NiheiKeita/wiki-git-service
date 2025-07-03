import React from 'react'
import { useForm } from '@inertiajs/react'
import { Link } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'
import InputLabel from '@/Components/InputLabel'
import TextInput from '@/Components/TextInput'
import InputError from '@/Components/InputError'

interface Branch {
  id: number;
  name: string;
  description: string | null;
  is_main: boolean;
}

interface Repository {
  id: number;
  name: string;
  description: string;
}

interface Props {
  repository: Repository;
  branch: Branch;
}

export default function BranchEdit({ repository, branch }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: branch.name,
    description: branch.description || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(route('wiki.repositories.branches.update', [repository.id, branch.id]))
  }

  return (
    <WikiLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">ブランチを編集</h1>
              <p className="mt-1 text-sm text-gray-500">
                {repository.name} - {branch.name}
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
                disabled={branch.is_main}
              />
              {branch.is_main && (
                <p className="mt-1 text-sm text-gray-500">
                  メインブランチの名前は変更できません
                </p>
              )}
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
                {processing ? '更新中...' : 'ブランチを更新'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </WikiLayout>
  )
}
