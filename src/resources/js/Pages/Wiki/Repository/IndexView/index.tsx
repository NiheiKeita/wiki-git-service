import React from 'react'
import { Link } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'

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
}

interface Props {
  ownedRepositories: Repository[];
  sharedRepositories: Repository[];
}

export default function RepositoryIndex({ ownedRepositories, sharedRepositories }: Props) {
  return (
    <WikiLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">リポジトリ</h1>
            <p className="mt-2 text-sm text-gray-700">
              あなたのWikiリポジトリを管理します
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href={route('wiki.repositories.create')}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              新しいリポジトリ
            </Link>
          </div>
        </div>

        {/* 所有リポジトリ */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-medium text-gray-900">所有リポジトリ</h2>
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {ownedRepositories.map((repository) => (
                <li key={repository.id}>
                  <Link
                    href={route('wiki.repositories.show', repository.id)}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                              <span className="font-medium text-indigo-600">
                                {repository.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="truncate text-sm font-medium text-indigo-600">
                                {repository.name}
                              </p>
                              {repository.is_public && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                  公開
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {repository.description || '説明なし'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <p>作成者: {repository.owner.name}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              {ownedRepositories.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-500">
                  所有しているリポジトリがありません
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* 共有リポジトリ */}
        {sharedRepositories.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-medium text-gray-900">共有リポジトリ</h2>
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {sharedRepositories.map((repository) => (
                  <li key={repository.id}>
                    <Link
                      href={route('wiki.repositories.show', repository.id)}
                      className="block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                <span className="font-medium text-gray-600">
                                  {repository.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {repository.name}
                                </p>
                                {repository.is_public && (
                                  <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    公開
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {repository.description || '説明なし'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <p>作成者: {repository.owner.name}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </WikiLayout>
  )
}
