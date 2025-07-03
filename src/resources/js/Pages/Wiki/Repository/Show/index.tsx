import React from 'react'
import { Link } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'
import GitHistoryGraph from '@/Components/GitHistoryGraph'

interface Article {
    id: number;
    title: string;
    slug: string;
    branch: {
        name: string;
    };
    updated_at: string;
}

interface Branch {
    id: number;
    name: string;
    is_default: boolean;
    articles_count: number;
}

interface Repository {
    id: number;
    name: string;
    description: string;
    slug: string;
    is_public: boolean;
    owner: {
        name: string;
    };
    created_at: string;
    branches: Branch[];
    recent_articles: Article[];
}

interface Commit {
    id: string;
    message: string;
    author: string;
    date: string;
    branch: string;
    parents: string[];
    is_merge: boolean;
    is_head: boolean;
}

interface GitBranch {
    name: string;
    color: string;
    commits: string[];
}

interface Props {
    repository: Repository;
    commits?: Commit[];
    branches?: GitBranch[];
}

export default function RepositoryShow({ repository, commits = [], branches = [] }: Props) {
    const defaultBranch = repository.branches?.find(branch => branch.is_default)



    return (
        <WikiLayout>
            <div className="px-4 sm:px-6 lg:px-8">
                {/* ヘッダー */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">{repository.name}</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                {repository.description || '説明なし'}
                            </p>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                <span>作成者: {repository.owner.name}</span>
                                <span>作成日: {new Date(repository.created_at).toLocaleDateString('ja-JP')}</span>
                                {repository.is_public && (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                        公開
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <Link
                                href={route('wiki.repositories.articles.create', repository.id)}
                                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                新しい記事
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* メインコンテンツ */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Git履歴グラフ */}
                        {commits.length > 0 && branches.length > 0 && (
                            <GitHistoryGraph
                                commits={commits}
                                branches={branches}
                            />
                        )}

                        {/* 最近の記事 */}
                        <div className="rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h2 className="text-lg font-medium text-gray-900">最近の記事</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {repository.recent_articles?.map((article) => (
                                    <div key={article.id} className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Link
                                                    href={route('wiki.repositories.articles.show', [repository.id, article.id])}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                                >
                                                    {article.title}
                                                </Link>
                                                <p className="text-sm text-gray-500">
                                                    ブランチ: {article.branch.name}
                                                </p>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(article.updated_at).toLocaleDateString('ja-JP')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {repository.recent_articles?.length === 0 && (
                                    <div className="px-6 py-8 text-center text-gray-500">
                                        記事がありません
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* サイドバー */}
                    <div className="space-y-6">
                        {/* ブランチ一覧 */}
                        <div className="rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-lg font-medium text-gray-900">ブランチ</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {repository.branches?.map((branch) => (
                                    <div key={branch.id} className="px-6 py-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {branch.name}
                                                </span>
                                                {branch.is_default && (
                                                    <span className="ml-2 inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                                        デフォルト
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {branch.articles_count} 記事
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* アクション */}
                        <div className="rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-lg font-medium text-gray-900">アクション</h3>
                            </div>
                            <div className="space-y-3 p-6">
                                <Link
                                    href={route('wiki.repositories.edit', repository.id)}
                                    className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    リポジトリを編集
                                </Link>
                                <Link
                                    href={route('wiki.repositories.branches.index', repository.id)}
                                    className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    ブランチ管理
                                </Link>
                                <Link
                                    href={route('wiki.repositories.pull-requests.index', repository.id)}
                                    className="block w-full rounded-md border border-transparent bg-green-600 px-4 py-2 text-center text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    プルリクエスト
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WikiLayout>
    )
}
