import React from 'react'
import { Link, usePage } from '@inertiajs/react'
import { PageProps } from '@/types'

interface WikiLayoutProps {
    children: React.ReactNode;
    repository?: any;
}

export default function WikiLayout({ children, repository }: WikiLayoutProps) {
    const { auth } = usePage<PageProps>().props

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ヘッダー */}
            <nav className="border-b bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex flex-shrink-0 items-center">
                                <Link href="/" className="text-xl font-bold text-gray-900">
                                    Wiki Git Service
                                </Link>
                            </div>

                            {repository && (
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    <Link
                                        href={route('wiki.repositories.show', repository.id)}
                                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    >
                                        概要
                                    </Link>
                                    <Link
                                        href={route('wiki.articles.index', repository.id)}
                                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    >
                                        記事
                                    </Link>
                                    <Link
                                        href={route('wiki.pull-requests.index', repository.id)}
                                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    >
                                        プルリクエスト
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Link
                                    href={route('wiki.repositories.index')}
                                    className="relative inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    リポジトリ一覧
                                </Link>
                            </div>

                            <div className="ml-4 flex items-center md:ml-6">
                                <div className="relative ml-3">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-700">{auth.user.name}</span>
                                        <Link
                                            href={""}
                                            method="post"
                                            as="button"
                                            className="text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            ログアウト
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* メインコンテンツ */}
            <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    )
}
