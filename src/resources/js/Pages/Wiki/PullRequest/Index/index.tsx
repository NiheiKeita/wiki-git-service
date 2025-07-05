import React from 'react'
import { Link } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'

interface PullRequest {
  id: number
  title: string
  status: 'open' | 'merged' | 'closed'
  author: {
    name: string
  }
  source_branch: {
    name: string
  }
  target_branch: {
    name: string
  }
  created_at: string
  updated_at: string
}

interface Repository {
  id: number
  name: string
}

interface Props {
  repository: Repository
  pullRequests: PullRequest[]
}

export default function PullRequestIndex({ repository, pullRequests }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'merged':
        return 'bg-purple-100 text-purple-800'
      case 'closed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'オープン'
      case 'merged':
        return 'マージ済み'
      case 'closed':
        return 'クローズ'
      default:
        return status
    }
  }

  return (
    <WikiLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">プルリクエスト</h1>
            <p className="mt-2 text-sm text-gray-700">
              リポジトリ「{repository.name}」のプルリクエスト
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href={route('wiki.repositories.pull-requests.create', repository.id)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              新しいプルリクエスト
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {pullRequests?.map((pullRequest) => (
                <li key={pullRequest.id}>
                  <Link
                    href={route('wiki.repositories.pull-requests.show', [repository.id, pullRequest.id])}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                              <span className="font-medium text-indigo-600">
                                #{pullRequest.id}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="truncate text-sm font-medium text-indigo-600">
                                {pullRequest.title}
                              </p>
                              <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(pullRequest.status)}`}>
                                {getStatusText(pullRequest.status)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span>{pullRequest.author.name}</span>
                              <span>{pullRequest.source_branch.name} → {pullRequest.target_branch.name}</span>
                              <span>{new Date(pullRequest.created_at).toLocaleDateString('ja-JP')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <p>更新: {new Date(pullRequest.updated_at).toLocaleDateString('ja-JP')}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              {pullRequests.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-500">
                  プルリクエストがありません
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </WikiLayout>
  )
}
