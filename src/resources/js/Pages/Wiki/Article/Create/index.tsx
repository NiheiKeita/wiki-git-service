import React, { useState } from 'react'
import { useForm } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'
import MarkdownEditor from '@/Components/MarkdownEditor'

interface Branch {
    id: number;
    name: string;
    is_default: boolean;
}

interface Repository {
    id: number;
    name: string;
    branches: Branch[];
}

interface Props {
    repository: Repository;
}

export default function ArticleCreate({ repository }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        branch_id: repository.branches.find(b => b.is_default)?.id || repository.branches[0]?.id || '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('wiki.repositories.articles.store', repository.id))
    }

    return (
        <WikiLayout>
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">新しい記事</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        リポジトリ「{repository.name}」に新しい記事を作成します
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="space-y-6 px-4 py-5 sm:p-6">
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
                                    {repository.branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name} {branch.is_default ? '(デフォルト)' : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.branch_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.branch_id}</p>
                                )}
                            </div>

                            {/* マークダウンエディタ */}
                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                    内容 *
                                </label>
                                <div className="mt-1">
                                    <MarkdownEditor
                                        value={data.content}
                                        onChange={(content) => setData('content', content)}
                                        placeholder="記事の内容をマークダウン形式で入力してください"
                                    />
                                </div>
                                {errors.content && (
                                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex justify-end space-x-3">
                        <a
                            href={route('wiki.repositories.show', repository.id)}
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
