import React, { useState } from 'react'
import { useForm, router } from '@inertiajs/react'
import { Link } from '@inertiajs/react'
import WikiLayout from '@/Layouts/WikiLayout'
import { PullRequest, PullRequestComment } from '@/types'

interface DiffLine {
    type: 'unchanged' | 'added' | 'removed' | 'header'
    line_number?: number
    content: string
    article_slug?: string
}

interface Props {
    repository: {
        id: number
        name: string
    }
    pullRequest: PullRequest
    diff: DiffLine[]
    sourceArticles: any[]
    targetArticles: any[]
}

type TabType = 'conversation' | 'files'

export default function PullRequestShow({ repository, pullRequest, diff, sourceArticles, targetArticles }: Props) {
    const [activeTab, setActiveTab] = useState<TabType>('conversation')
    const [selectedLine, setSelectedLine] = useState<number | null>(null)
    const [replyingTo, setReplyingTo] = useState<number | null>(null)
    const [replyingToInFiles, setReplyingToInFiles] = useState<number | null>(null)
    const [commentForm, setCommentForm] = useState({
        content: '',
        line_number: null as number | null,
        line_content: '',
        parent_id: null as number | null,
    })

    // useFormをトップレベルで定義
    const { post: postComment, processing: commentProcessing, setData: setCommentData } = useForm({
        content: '',
        line_number: null as number | null,
        line_content: '',
        parent_id: null as number | null,
    })

    const { post: postMerge, processing: mergeProcessing } = useForm({})
    const { post: postClose, processing: closeProcessing } = useForm({})

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

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        router.post(route('wiki.repositories.pull-requests.comments.store', [repository.id, pullRequest.id]), {
            content: commentForm.content,
            line_number: commentForm.line_number,
            line_content: commentForm.line_content,
        }, {
            onSuccess: () => {
                setCommentForm({ content: '', line_number: null, line_content: '', parent_id: null })
                setSelectedLine(null)
            },
        })
    }

    const handleGeneralCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        router.post(route('wiki.repositories.pull-requests.comments.store', [repository.id, pullRequest.id]), {
            content: commentForm.content,
            line_number: null,
            line_content: '',
        }, {
            onSuccess: () => {
                setCommentForm({ content: '', line_number: null, line_content: '', parent_id: null })
            },
        })
    }

    const handleLineComment = (lineNumber: number, content: string) => {
        setSelectedLine(lineNumber)
        setCommentForm({
            content: '',
            line_number: lineNumber,
            line_content: content,
            parent_id: null,
        })
    }

    const handleReply = (commentId: number) => {
        setReplyingTo(commentId)
        setCommentForm({
            content: '',
            line_number: null,
            line_content: '',
            parent_id: commentId,
        })
    }

    const handleReplyInFiles = (commentId: number) => {
        setReplyingToInFiles(commentId)
        setCommentForm({
            content: '',
            line_number: null,
            line_content: '',
            parent_id: commentId,
        })
    }

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault()
        router.post(route('wiki.repositories.pull-requests.comments.store', [repository.id, pullRequest.id]), {
            content: commentForm.content,
            line_number: null,
            line_content: '',
            parent_id: commentForm.parent_id,
        }, {
            onSuccess: () => {
                setCommentForm({ content: '', line_number: null, line_content: '', parent_id: null })
                setReplyingTo(null)
            },
        })
    }

    const handleReplySubmitInFiles = (e: React.FormEvent) => {
        e.preventDefault()
        router.post(route('wiki.repositories.pull-requests.comments.store', [repository.id, pullRequest.id]), {
            content: commentForm.content,
            line_number: null,
            line_content: '',
            parent_id: commentForm.parent_id,
        }, {
            onSuccess: () => {
                setCommentForm({ content: '', line_number: null, line_content: '', parent_id: null })
                setReplyingToInFiles(null)
            },
        })
    }

    const handleMerge = () => {
        if (confirm('このプルリクエストをマージしますか？')) {
            postMerge(route('wiki.repositories.pull-requests.merge', [repository.id, pullRequest.id]))
        }
    }

    const handleClose = () => {
        if (confirm('このプルリクエストをクローズしますか？')) {
            postClose(route('wiki.repositories.pull-requests.close', [repository.id, pullRequest.id]))
        }
    }

    const getDiffLineClass = (type: string) => {
        switch (type) {
            case 'added':
                return 'bg-green-50 border-l-4 border-green-400'
            case 'removed':
                return 'bg-red-50 border-l-4 border-red-400'
            case 'header':
                return 'bg-gray-100 font-semibold'
            default:
                return 'bg-white'
        }
    }

    const getDiffLineIcon = (type: string) => {
        switch (type) {
            case 'added':
                return '+'
            case 'removed':
                return '-'
            default:
                return ' '
        }
    }

    const renderComment = (comment: PullRequestComment, isReply = false) => (
        <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
            <div className="flex space-x-3">
                <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                        <span className="text-sm font-medium text-gray-600">
                            {comment.user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{comment.user.name}</span>
                        <span className="text-sm text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                        </span>
                        {/* 行コメントの場合はバッジ表示 */}
                        {comment.line_number && (
                            <span className="ml-2 inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                行コメント（{comment.line_number}行目）
                            </span>
                        )}
                    </div>
                    {/* 行コメントの場合は該当行内容も表示 */}
                    {comment.line_number && comment.line_content && (
                        <div className="mt-1 rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-500">
                            {comment.line_content}
                        </div>
                    )}
                    <div className="mt-1 text-sm text-gray-700">
                        {comment.content}
                    </div>
                    {/* 返信ボタン */}
                    {pullRequest.status === 'open' && !isReply && (
                        <div className="mt-2">
                            <button
                                onClick={() => handleReply(comment.id)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                返信
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 返信フォーム */}
            {replyingTo === comment.id && (
                <div className="ml-11 mt-3">
                    <form onSubmit={handleReplySubmit}>
                        <textarea
                            value={commentForm.content}
                            onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            rows={3}
                            placeholder="返信を入力してください"
                        />
                        <div className="mt-2 flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setReplyingTo(null)
                                    setCommentForm({ content: '', line_number: null, line_content: '', parent_id: null })
                                }}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                                キャンセル
                            </button>
                            <button
                                type="submit"
                                disabled={commentProcessing || !commentForm.content.trim()}
                                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {commentProcessing ? '投稿中...' : '返信を投稿'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 返信コメント */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3">
                    {comment.replies.map((reply) => renderComment(reply, true))}
                </div>
            )}
        </div>
    )

    const renderCommentInFiles = (comment: PullRequestComment, isReply = false) => (
        <div key={comment.id} className={`${isReply ? 'ml-4 border-l-2 border-gray-200 pl-3' : ''}`}>
            <div className="flex space-x-3">
                <div className="flex-shrink-0">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300">
                        <span className="text-xs font-medium text-gray-600">
                            {comment.user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{comment.user.name}</span>
                        <span className="text-sm text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                        </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                        {comment.content}
                    </div>
                    {/* 返信ボタン */}
                    {pullRequest.status === 'open' && !isReply && (
                        <div className="mt-2">
                            <button
                                onClick={() => handleReplyInFiles(comment.id)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                返信
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 返信フォーム */}
            {replyingToInFiles === comment.id && (
                <div className="ml-9 mt-3">
                    <form onSubmit={handleReplySubmitInFiles}>
                        <textarea
                            value={commentForm.content}
                            onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            rows={2}
                            placeholder="返信を入力してください"
                        />
                        <div className="mt-2 flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setReplyingToInFiles(null)
                                    setCommentForm({ content: '', line_number: null, line_content: '', parent_id: null })
                                }}
                                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                            >
                                キャンセル
                            </button>
                            <button
                                type="submit"
                                disabled={commentProcessing || !commentForm.content.trim()}
                                className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {commentProcessing ? '投稿中...' : '返信'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 返信コメント */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2">
                    {comment.replies.map((reply) => renderCommentInFiles(reply, true))}
                </div>
            )}
        </div>
    )

    const renderConversationTab = () => {
        // トップレベルのコメントをcreated_atで昇順ソート
        const sortedComments = [...pullRequest.comments]
            .filter(comment => !comment.parent_id)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        return (
            <div className="space-y-6">
                {/* 説明 */}
                <div className="rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-medium text-gray-900">説明</h2>
                    </div>
                    <div className="px-6 py-4">
                        <div className="prose max-w-none">
                            {pullRequest.description ? (
                                <div dangerouslySetInnerHTML={{ __html: pullRequest.description }} />
                            ) : (
                                <p className="text-gray-500">説明がありません</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 全コメント（一般・行コメント） */}
                <div className="rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-medium text-gray-900">コメント履歴</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {sortedComments.length === 0 && (
                            <div className="px-6 py-4 text-gray-500">コメントはありません</div>
                        )}
                        {sortedComments.map((comment) => renderComment(comment))}
                    </div>

                    {/* 一般コメント投稿フォーム */}
                    {pullRequest.status === 'open' && (
                        <div className="border-t border-gray-200 px-6 py-4">
                            <form onSubmit={handleGeneralCommentSubmit}>
                                <div>
                                    <label htmlFor="content" className="sr-only">
                                        コメント
                                    </label>
                                    <textarea
                                        id="content"
                                        rows={3}
                                        value={commentForm.content}
                                        onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="コメントを入力してください"
                                    />
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={commentProcessing || !commentForm.content.trim()}
                                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {commentProcessing ? '投稿中...' : 'コメントを投稿'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderFilesChangedTab = () => (
        <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">変更内容</h2>
                <p className="mt-1 text-sm text-gray-500">
                    {pullRequest.source_branch.name} → {pullRequest.target_branch.name}
                </p>
            </div>
            <div className="overflow-x-auto">
                <div className="min-w-full">
                    {diff.map((line, index) => (
                        <div key={index} className={`${getDiffLineClass(line.type)} group relative`}>
                            {line.type === 'header' ? (
                                <div className="px-4 py-2 font-semibold text-gray-900">
                                    📄 {line.content}
                                </div>
                            ) : (
                                <div className="flex">
                                    {/* 行番号 */}
                                    <div className="w-12 flex-shrink-0 border-r border-gray-200 bg-gray-50 px-2 py-1 text-right text-xs text-gray-500">
                                        {line.line_number}
                                    </div>
                                    {/* 変更アイコン */}
                                    <div className="w-8 flex-shrink-0 border-r border-gray-200 bg-gray-50 px-1 py-1 text-center text-xs text-gray-500">
                                        {getDiffLineIcon(line.type)}
                                    </div>
                                    {/* 内容 */}
                                    <div className="flex-1 px-4 py-1 font-mono text-sm">
                                        <span className="whitespace-pre-wrap">{line.content}</span>
                                        {/* 行コメントボタン */}
                                        {pullRequest.status === 'open' && line.type !== 'unchanged' && (
                                            <button
                                                onClick={() => handleLineComment(line.line_number!, line.content)}
                                                className="ml-2 text-blue-600 opacity-0 transition-opacity hover:text-blue-800 group-hover:opacity-100"
                                            >
                                                💬
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* インラインコメント */}
                            {pullRequest.comments
                                .filter(comment => comment.line_number === line.line_number && !comment.parent_id)
                                .map(comment => (
                                    <div key={comment.id} className="ml-20 border-l-4 border-blue-400 bg-blue-50 p-3">
                                        {renderCommentInFiles(comment)}
                                    </div>
                                ))}

                            {/* 行コメントフォーム */}
                            {selectedLine === line.line_number && (
                                <div className="ml-20 border-l-4 border-yellow-400 bg-yellow-50 p-3">
                                    <form onSubmit={handleCommentSubmit}>
                                        <textarea
                                            value={commentForm.content}
                                            onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            rows={3}
                                            placeholder="この行についてコメントを入力してください"
                                        />
                                        <div className="mt-2 flex justify-end space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedLine(null)
                                                    setCommentForm({ content: '', line_number: null, line_content: '', parent_id: null })
                                                }}
                                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                キャンセル
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={commentProcessing || !commentForm.content.trim()}
                                                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {commentProcessing ? '投稿中...' : 'コメントを投稿'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <WikiLayout>
            <div className="px-4 sm:px-6 lg:px-8">
                {/* ヘッダー */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">#{pullRequest.id} {pullRequest.title}</h1>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                <span>作成者: {pullRequest.author.name}</span>
                                <span>作成日: {new Date(pullRequest.created_at).toLocaleDateString('ja-JP')}</span>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(pullRequest.status)}`}>
                                    {getStatusText(pullRequest.status)}
                                </span>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            {pullRequest.status === 'open' && (
                                <>
                                    <button
                                        onClick={handleMerge}
                                        disabled={mergeProcessing}
                                        className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {mergeProcessing ? 'マージ中...' : 'マージ'}
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        disabled={closeProcessing}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {closeProcessing ? 'クローズ中...' : 'クローズ'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* メインコンテンツ */}
                    <div className="lg:col-span-2">
                        {/* タブ */}
                        <div className="mb-6 border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('conversation')}
                                    className={`border-b-2 px-1 py-2 text-sm font-medium ${activeTab === 'conversation'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    Conversation
                                </button>
                                <button
                                    onClick={() => setActiveTab('files')}
                                    className={`border-b-2 px-1 py-2 text-sm font-medium ${activeTab === 'files'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    Files changed
                                </button>
                            </nav>
                        </div>

                        {/* タブコンテンツ */}
                        {activeTab === 'conversation' && renderConversationTab()}
                        {activeTab === 'files' && renderFilesChangedTab()}
                    </div>

                    {/* サイドバー */}
                    <div className="space-y-6">
                        {/* ブランチ情報 */}
                        <div className="rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-lg font-medium text-gray-900">ブランチ</h3>
                            </div>
                            <div className="space-y-3 px-6 py-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">ソースブランチ</span>
                                    <p className="text-sm text-gray-900">{pullRequest.source_branch.name}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">ターゲットブランチ</span>
                                    <p className="text-sm text-gray-900">{pullRequest.target_branch.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* アクション */}
                        <div className="rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-lg font-medium text-gray-900">アクション</h3>
                            </div>
                            <div className="space-y-3 p-6">
                                <Link
                                    href={route('wiki.repositories.pull-requests.index', repository.id)}
                                    className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    プルリクエスト一覧に戻る
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WikiLayout>
    )
}
