import React, { useState } from 'react'
import { useForm } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'

export default function RepositoryCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        is_public: false,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('wiki.repositories.store'))
    }

    return (
        <WikiLayout>
            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">新しいリポジトリ</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        新しいWikiリポジトリを作成します
                    </p>
                </div>

                <div className="bg-white shadow sm:rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                リポジトリ名 *
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="例: プロジェクトドキュメント"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                説明
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="リポジトリの説明を入力してください"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_public"
                                checked={data.is_public}
                                onChange={(e) => setData('is_public', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                                公開リポジトリにする
                            </label>
                        </div>
                        {errors.is_public && (
                            <p className="mt-1 text-sm text-red-600">{errors.is_public}</p>
                        )}

                        <div className="flex justify-end space-x-3">
                            <a
                                href={route('wiki.repositories.index')}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                キャンセル
                            </a>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {processing ? '作成中...' : 'リポジトリを作成'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </WikiLayout>
    )
}
