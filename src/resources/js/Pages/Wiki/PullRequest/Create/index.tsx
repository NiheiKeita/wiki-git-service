import React, { useState } from 'react'
import { useForm } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'

interface Branch {
  id: number
  name: string
  is_default: boolean
}

interface Repository {
  id: number
  name: string
  branches: Branch[]
}

interface Props {
  repository: Repository
}

export default function PullRequestCreate({ repository }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    source_branch_id: '',
    target_branch_id: repository.branches?.find(b => b.is_default)?.id || repository.branches?.[0]?.id || '',
    create_new_branch: false,
    new_branch_name: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('wiki.repositories.pull-requests.store', repository.id))
  }

  return (
    <WikiLayout>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">新しいプルリクエスト</h1>
          <p className="mt-2 text-sm text-gray-700">
            リポジトリ「{repository.name}」に新しいプルリクエストを作成します
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                タイトル *
              </label>
              <input
                type="text"
                id="title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="プルリクエストのタイトルを入力してください"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                説明
              </label>
              <textarea
                id="description"
                rows={4}
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="プルリクエストの説明を入力してください"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="source_branch_id" className="block text-sm font-medium text-gray-700">
                  ソースブランチ *
                </label>
                <div className="mt-1 space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="existing_branch"
                      name="branch_type"
                      checked={!data.create_new_branch}
                      onChange={() => setData('create_new_branch', false)}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="existing_branch" className="ml-2 block text-sm text-gray-900">
                      既存のブランチを使用
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="new_branch"
                      name="branch_type"
                      checked={data.create_new_branch}
                      onChange={() => setData('create_new_branch', true)}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="new_branch" className="ml-2 block text-sm text-gray-900">
                      新しいブランチを作成
                    </label>
                  </div>
                </div>

                {!data.create_new_branch ? (
                  <select
                    id="source_branch_id"
                    value={data.source_branch_id}
                    onChange={(e) => setData('source_branch_id', e.target.value)}
                    className="mt-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">ブランチを選択</option>
                    {repository.branches?.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} {branch.is_default ? '(デフォルト)' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="new_branch_name"
                    value={data.new_branch_name}
                    onChange={(e) => setData('new_branch_name', e.target.value)}
                    className="mt-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="例: feature/new-feature"
                  />
                )}
                {errors.source_branch_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.source_branch_id}</p>
                )}
                {errors.new_branch_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.new_branch_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="target_branch_id" className="block text-sm font-medium text-gray-700">
                  ターゲットブランチ *
                </label>
                <select
                  id="target_branch_id"
                  value={data.target_branch_id}
                  onChange={(e) => setData('target_branch_id', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {repository.branches?.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} {branch.is_default ? '(デフォルト)' : ''}
                    </option>
                  ))}
                </select>
                {errors.target_branch_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.target_branch_id}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <a
                href={route('wiki.repositories.pull-requests.index', repository.id)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                キャンセル
              </a>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {processing ? '作成中...' : 'プルリクエストを作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </WikiLayout>
  )
}
