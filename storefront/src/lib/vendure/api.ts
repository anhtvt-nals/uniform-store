import type {TadaDocumentNode} from 'gql.tada';
import {print} from 'graphql';
import {getAuthToken, getCartSessionId} from '@/lib/auth';

const VENDURE_API_URL = process.env.VENDURE_SHOP_API_URL || process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL;
const VENDURE_CHANNEL_TOKEN = process.env.VENDURE_CHANNEL_TOKEN || process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN || '__default_channel__';
const VENDURE_AUTH_TOKEN_HEADER = process.env.VENDURE_AUTH_TOKEN_HEADER || 'vendure-auth-token';
const VENDURE_CHANNEL_TOKEN_HEADER = process.env.VENDURE_CHANNEL_TOKEN_HEADER || 'vendure-token';

if (!VENDURE_API_URL) {
    throw new Error('VENDURE_SHOP_API_URL or NEXT_PUBLIC_VENDURE_SHOP_API_URL environment variable is not set');
}

interface VendureRequestOptions {
    token?: string;
    useAuthToken?: boolean;
    channelToken?: string;
    languageCode?: string;
    currencyCode?: string;
    sessionId?: string;
    fetch?: RequestInit;
    tags?: string[];
}

interface VendureResponse<T> {
    data?: T;
    errors?: Array<{ message: string; [key: string]: unknown }>;
}

/**
 * Extract the Vendure auth token from response headers
 */
function extractAuthToken(headers: Headers): string | null {
    return headers.get(VENDURE_AUTH_TOKEN_HEADER);
}


/**
 * Execute a GraphQL query against the Vendure API
 */
export async function query<TResult, TVariables>(
    document: TadaDocumentNode<TResult, TVariables>,
    ...[variables, options]: TVariables extends Record<string, never>
        ? [variables?: TVariables, options?: VendureRequestOptions]
        : [variables: TVariables, options?: VendureRequestOptions]
): Promise<{ data: TResult; token?: string }> {
    const {
        token,
        useAuthToken,
        channelToken,
        languageCode,
        currencyCode,
        sessionId,
        fetch: fetchOptions,
        tags,
    } = options || {};

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions?.headers as Record<string, string>),
    };

    // Use the explicitly provided token, or fetch from cookies if useAuthToken is true
    let authToken = token;
    if (useAuthToken && !authToken) {
        authToken = await getAuthToken();
    }

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const cartSessionId = sessionId || await getCartSessionId();
    if (cartSessionId) {
        headers['x-session-id'] = cartSessionId;
    }

    // Set the channel token header (use provided channelToken or default)
    headers[VENDURE_CHANNEL_TOKEN_HEADER] = channelToken || VENDURE_CHANNEL_TOKEN;

    const url = new URL(VENDURE_API_URL!);
    if (languageCode) {
        url.searchParams.set('languageCode', languageCode);
    }
    if (currencyCode) {
        url.searchParams.set('currencyCode', currencyCode);
    }

    const doFetch = (signal?: AbortSignal) =>
        fetch(url.toString(), {
            ...fetchOptions,
            method: 'POST',
            headers,
            body: JSON.stringify({
                query: print(document),
                variables: variables || {},
            }),
            signal,
            ...(tags && {next: {tags}}),
        });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await doFetch(controller.signal);
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: VendureResponse<TResult> = await response.json();

        if (result.errors) {
            throw new Error(result.errors.map(e => e.message).join(', '));
        }

        if (!result.data) {
            throw new Error('No data returned from Vendure API');
        }

        const newToken = extractAuthToken(response.headers);

        return {
            data: result.data,
            ...(newToken && {token: newToken}),
        };
    } catch (error) {
        clearTimeout(timeoutId);
        // Retry once on timeout
        if (error instanceof DOMException && error.name === 'AbortError') {
            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), 15000);
            try {
                const response = await doFetch(retryController.signal);
                clearTimeout(retryTimeoutId);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result: VendureResponse<TResult> = await response.json();
                if (result.errors) throw new Error(result.errors.map(e => e.message).join(', '));
                if (!result.data) throw new Error('No data returned from Vendure API');
                const newToken = extractAuthToken(response.headers);
                return { data: result.data, ...(newToken && {token: newToken}) };
            } finally {
                clearTimeout(retryTimeoutId);
            }
        }
        throw error;
    }
}

/**
 * Execute a GraphQL mutation against the Vendure API
 */
export async function mutate<TResult, TVariables>(
    document: TadaDocumentNode<TResult, TVariables>,
    ...[variables, options]: TVariables extends Record<string, never>
        ? [variables?: TVariables, options?: VendureRequestOptions]
        : [variables: TVariables, options?: VendureRequestOptions]
): Promise<{ data: TResult; token?: string }> {
    // Mutations use the same underlying implementation as queries in GraphQL
    // @ts-expect-error - Complex conditional type inference, runtime behavior is correct
    return query(document, variables, options);
}
