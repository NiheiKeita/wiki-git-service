import React from 'react'

interface Commit {
  id: string
  message: string
  author: string
  date: string
  branch: string
  parents: string[]
  is_merge: boolean
  is_head: boolean
}

interface Branch {
  name: string
  color: string
  commits: string[]
}

interface Props {
  commits: Commit[]
  branches: Branch[]
  className?: string
}

export default function GitHistoryGraph({ commits, branches, className = '' }: Props) {
  const getBranchColor = (branchName: string) => {
    const branch = branches.find(b => b.name === branchName)
    return branch?.color || '#6B7280'
  }

  const getCommitPosition = (commit: Commit, index: number) => {
    const branchIndex = branches.findIndex(b => b.name === commit.branch)
    return {
      x: branchIndex * 60 + 30,
      y: index * 80 + 40
    }
  }

  const renderCommitNode = (commit: Commit, index: number) => {
    const position = getCommitPosition(commit, index)
    const branchColor = getBranchColor(commit.branch)

    return (
      <g key={commit.id}>
        {/* コミットノード */}
        <circle
          cx={position.x}
          cy={position.y}
          r={commit.is_head ? 8 : 6}
          fill={commit.is_merge ? '#8B5CF6' : branchColor}
          stroke={commit.is_head ? '#1F2937' : 'none'}
          strokeWidth={commit.is_head ? 2 : 0}
        />

        {/* コミット情報 */}
        <text
          x={position.x + 15}
          y={position.y - 5}
          className="fill-gray-900 text-xs font-medium"
        >
          {commit.message.length > 30 ? commit.message.substring(0, 30) + '...' : commit.message}
        </text>
        <text
          x={position.x + 15}
          y={position.y + 10}
          className="fill-gray-500 text-xs"
        >
          {commit.author} • {new Date(commit.date).toLocaleDateString('ja-JP')}
        </text>

        {/* ブランチ名 */}
        <text
          x={position.x}
          y={position.y - 25}
          className="fill-gray-700 text-xs font-medium"
          textAnchor="middle"
        >
          {commit.branch}
        </text>
      </g>
    )
  }

  const renderBranchLines = () => {
    const lines: JSX.Element[] = []

    branches.forEach((branch, branchIndex) => {
      const branchCommits = commits.filter(c => c.branch === branch.name)
      const x = branchIndex * 60 + 30

      // ブランチの縦線
      if (branchCommits.length > 1) {
        const firstCommit = branchCommits[0]
        const lastCommit = branchCommits[branchCommits.length - 1]
        const firstIndex = commits.findIndex(c => c.id === firstCommit.id)
        const lastIndex = commits.findIndex(c => c.id === lastCommit.id)

        lines.push(
          <line
            key={`branch-line-${branch.name}`}
            x1={x}
            y1={firstIndex * 80 + 40}
            x2={x}
            y2={lastIndex * 80 + 40}
            stroke={branch.color}
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        )
      }

      // コミット間の接続線
      branchCommits.forEach((commit, commitIndex) => {
        if (commitIndex < branchCommits.length - 1) {
          const currentIndex = commits.findIndex(c => c.id === commit.id)
          const nextCommit = branchCommits[commitIndex + 1]
          const nextIndex = commits.findIndex(c => c.id === nextCommit.id)

          lines.push(
            <line
              key={`commit-line-${commit.id}`}
              x1={x}
              y1={currentIndex * 80 + 40}
              x2={x}
              y2={nextIndex * 80 + 40}
              stroke={branch.color}
              strokeWidth={2}
            />
          )
        }
      })
    })

    // マージ線
    commits.forEach((commit, index) => {
      if (commit.is_merge && commit.parents.length > 1) {
        const parent1 = commits.find(c => c.id === commit.parents[0])
        const parent2 = commits.find(c => c.id === commit.parents[1])

        if (parent1 && parent2) {
          const parent1Index = commits.findIndex(c => c.id === parent1.id)
          const parent2Index = commits.findIndex(c => c.id === parent2.id)
          const parent1Pos = getCommitPosition(parent1, parent1Index)
          const parent2Pos = getCommitPosition(parent2, parent2Index)
          const commitPos = getCommitPosition(commit, index)

          // マージ線（曲線）
          lines.push(
            <path
              key={`merge-line-${commit.id}`}
              d={`M ${parent1Pos.x} ${parent1Pos.y} Q ${(parent1Pos.x + commitPos.x) / 2} ${(parent1Pos.y + commitPos.y) / 2} ${commitPos.x} ${commitPos.y}`}
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="none"
              strokeDasharray="3,3"
            />
          )
        }
      }
    })

    return lines
  }

  const renderBranchLabels = () => {
    return branches.map((branch, index) => (
      <g key={`branch-label-${branch.name}`}>
        <rect
          x={index * 60 + 10}
          y={10}
          width={40}
          height={20}
          fill={branch.color}
          rx={4}
        />
        <text
          x={index * 60 + 30}
          y={23}
          className="fill-white text-xs font-medium"
          textAnchor="middle"
        >
          {branch.name}
        </text>
      </g>
    ))
  }

  const svgWidth = branches.length * 60 + 60
  const svgHeight = commits.length * 80 + 80

  return (
    <div className={`rounded-lg bg-white shadow ${className}`}>
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900">Git履歴</h3>
      </div>
      <div className="overflow-auto p-6">
        <svg
          width={svgWidth}
          height={svgHeight}
          className="min-w-full"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          {/* 背景グリッド */}
          <defs>
            <pattern id="grid" width="60" height="80" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 80" fill="none" stroke="#F3F4F6" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* ブランチラベル */}
          {renderBranchLabels()}

          {/* ブランチ線とマージ線 */}
          {renderBranchLines()}

          {/* コミットノード */}
          {commits.map((commit, index) => renderCommitNode(commit, index))}
        </svg>
      </div>
    </div>
  )
}
