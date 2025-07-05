import React, { useState } from 'react'
import { Link, useForm } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'
import MarkdownEditor from '@/Components/MarkdownEditor'

interface Branch {
  id: number;
  name: string;
  is_main: boolean;
}

interface Repository {
  id: number;
  name: string;
}

interface Article {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  branch: Branch;
}

interface Props {
  repository: Repository;
  branch: Branch;
  articles: Article[];
  mainArticles: Article[];
}

export default function BranchArticlesIndex({ repository, branch, articles, mainArticles }: Props) {
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [editingMainArticle, setEditingMainArticle] = useState<Article | null>(null)
  const [commitMessage, setCommitMessage] = useState('記事を更新')

  const { data, setData, put, post, processing, errors } = useForm({
    title: '',
    content: '',
    commit_message: '記事を更新',
  })

  const handleEdit = (article: Article) => {
    setEditingArticle(article)
    setEditingMainArticle(null)
    setData({
      title: article.title,
      content: article.content,
      commit_message: '記事を更新',
    })
    setCommitMessage('記事を更新')
  }

  const handleEditMainArticle = (article: Article) => {
    setEditingMainArticle(article)
    setEditingArticle(null)
    setData({
      title: article.title,
      content: article.content,
      commit_message: `mainブランチの「${article.title}」を編集`,
    })
    setCommitMessage(`mainブランチの「${article.title}」を編集`)
  }

  const handleCancelEdit = () => {
    setEditingArticle(null)
    setEditingMainArticle(null)
    setData({
      title: '',
      content: '',
      commit_message: '記事を更新',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingArticle) {
      put(route('wiki.repositories.articles.update', [repository.id, editingArticle.id]), {
        onSuccess: () => {
          setEditingArticle(null)
          setData({
            title: '',
            content: '',
            commit_message: '記事を更新',
          })
        },
      })
    } else if (editingMainArticle) {
      // mainブランチの記事を現在のブランチに新しい記事として作成
      post(route('wiki.repositories.branches.articles.store', [repository.id, branch.id]), {
        onSuccess: () => {
          setEditingMainArticle(null)
          setData({
            title: '',
            content: '',
            commit_message: '記事を更新',
          })
        },
      })
    }
  }

  return (
    <WikiLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">「{branch.name}」ブランチの記事一覧</h1>
          <p className="mt-2 text-sm text-gray-700">
            リポジトリ「{repository.name}」の「{branch.name}」ブランチで追加・更新された記事一覧です。
          </p>
          <div className="mt-4 flex space-x-2">
            <Link
              href={route('wiki.repositories.branches.index', repository.id)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              ブランチ管理に戻る
            </Link>
            <Link
              href={route('wiki.repositories.branches.articles.create', [repository.id, branch.id])}
              className="inline-flex items-center rounded-md border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
            >
              新しい記事を追加
            </Link>
          </div>
        </div>

        {/* 編集エリア */}
        {(editingArticle || editingMainArticle) && (
          <div className="mb-8 bg-white shadow sm:rounded-lg">
            <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">
                {editingArticle ? `「${editingArticle.title}」を編集中` : `mainブランチの「${editingMainArticle?.title}」を編集`}
              </h3>
              {editingMainArticle && (
                <p className="mt-1 text-sm text-gray-600">
                  この記事は現在のブランチに新しい記事として作成されます
                </p>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  タイトル
                </label>
                <input
                  type="text"
                  id="title"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  内容
                </label>
                <MarkdownEditor
                  value={data.content}
                  onChange={(content) => setData('content', content)}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
              </div>

              <div>
                <label htmlFor="commit_message" className="block text-sm font-medium text-gray-700">
                  コミットメッセージ
                </label>
                <input
                  type="text"
                  id="commit_message"
                  value={data.commit_message}
                  onChange={(e) => setData('commit_message', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.commit_message && (
                  <p className="mt-1 text-sm text-red-600">{errors.commit_message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {processing ? '処理中...' : (editingMainArticle ? '記事を作成' : '記事を更新')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 現在のブランチの記事一覧 */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-medium text-gray-900">「{branch.name}」ブランチの記事</h2>
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {articles.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-500">
                  このブランチには記事がありません
                </li>
              )}
              {articles.map((article) => (
                <li key={article.id}>
                  <div className="block px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Link
                          href={route('wiki.repositories.branches.articles.show', [repository.id, branch.id, article.id])}
                          className="text-lg font-medium text-indigo-700 hover:text-indigo-800"
                        >
                          {article.title}
                        </Link>
                        <div className="text-sm text-gray-500">作成日: {new Date(article.created_at).toLocaleDateString('ja-JP')}</div>
                        <div className="text-sm text-gray-500">更新日: {new Date(article.updated_at).toLocaleDateString('ja-JP')}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(article)}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                          編集
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* mainブランチの記事一覧（現在のブランチがmainでない場合のみ表示） */}
        {mainArticles.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-medium text-gray-900">mainブランチの記事</h2>
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {mainArticles.map((article) => (
                  <li key={article.id}>
                    <div className="block px-4 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Link
                            href={route('wiki.repositories.articles.show', [repository.id, article.id])}
                            className="text-lg font-medium text-gray-700 hover:text-gray-800"
                          >
                            {article.title}
                          </Link>
                          <div className="text-sm text-gray-500">作成日: {new Date(article.created_at).toLocaleDateString('ja-JP')}</div>
                          <div className="text-sm text-gray-500">更新日: {new Date(article.updated_at).toLocaleDateString('ja-JP')}</div>
                          <div className="mt-1 text-xs text-gray-400">mainブランチ</div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEditMainArticle(article)}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                          >
                            編集
                          </button>
                        </div>
                      </div>
                    </div>
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
