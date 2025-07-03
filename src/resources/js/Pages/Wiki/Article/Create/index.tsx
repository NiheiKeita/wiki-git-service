import React, { useState } from 'react'
import { useForm } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'
import MarkdownEditor from '@/Components/MarkdownEditor'

interface Repository {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
  is_main: boolean;
}

interface Props {
  repository: Repository;
  branches: Branch[];
}

export default function ArticleCreate({ repository, branches }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    content: '',
    branch_id: branches.find(b => b.is_main)?.id || '',
    tags: [] as string[],
    commit_message: '',
  })

  const [tagInput, setTagInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('wiki.articles.store', repository.id))
  }

  const addTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      setData('tags', [...data.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setData('tags', data.tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <WikiLayout repository={repository}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">新しい記事</h1>
          <p className="mt-2 text-sm text-gray-700">
            新しい記事を作成します
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル */}
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
              placeholder="記事のタイトルを入力してください"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* ブランチ選択 */}
          <div>
            <label htmlFor="branch_id" className="block text-sm font-medium text-gray-700">
              ブランチ *
            </label>
            <select
              id="branch_id"
              value={data.branch_id}
              onChange={(e) => setData('branch_id', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} {branch.is_main ? '(メイン)' : ''}
                </option>
              ))}
            </select>
            {errors.branch_id && (
              <p className="mt-1 text-sm text-red-600">{errors.branch_id}</p>
            )}
          </div>

          {/* タグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              タグ
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {data.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="タグを入力してEnter"
              />
              <button
                type="button"
                onClick={addTag}
                className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                追加
              </button>
            </div>
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
            )}
          </div>

          {/* マークダウンエディタ */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              内容 *
            </label>
            <MarkdownEditor
              value={data.content}
              onChange={(value) => setData('content', value)}
              placeholder="マークダウンで記事を書いてください..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {/* コミットメッセージ */}
          <div>
            <label htmlFor="commit_message" className="block text-sm font-medium text-gray-700">
              コミットメッセージ *
            </label>
            <input
              type="text"
              id="commit_message"
              value={data.commit_message}
              onChange={(e) => setData('commit_message', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="例: 初回記事作成"
            />
            {errors.commit_message && (
              <p className="mt-1 text-sm text-red-600">{errors.commit_message}</p>
            )}
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-3">
            <a
              href={route('wiki.articles.index', repository.id)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              キャンセル
            </a>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {processing ? '作成中...' : '記事を作成'}
            </button>
          </div>
        </form>
      </div>
    </WikiLayout>
  )
}
