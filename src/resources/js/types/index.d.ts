export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
}

export interface PullRequestComment {
    id: number;
    content: string;
    line_number: number | null;
    line_content: string | null;
    article_slug: string | null;
    parent_id: number | null;
    user: User;
    replies: PullRequestComment[];
    created_at: string;
}

export interface PullRequest {
    id: number;
    title: string;
    description: string | null;
    status: string;
    author: User;
    source_branch: {
        id: number;
        name: string;
    };
    target_branch: {
        id: number;
        name: string;
    };
    comments: PullRequestComment[];
    created_at: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
};
