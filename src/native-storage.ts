import { invoke } from '@tauri-apps/api/core';

export type UserDocumentKind = 'sheet' | 'overlay';

export interface StorageIssue {
  code: string;
  message: string;
  relativePath?: string;
}

export interface StoredUserDocument {
  kind: UserDocumentKind;
  id: string;
  relativePath: string;
  content: string;
}

export interface LoadUserDocumentsResult {
  rootPath: string;
  documents: StoredUserDocument[];
  issues: StorageIssue[];
}

export interface StorageCommandError {
  code: string;
  message: string;
  relativePath?: string;
}

export async function loadUserDocuments(): Promise<LoadUserDocumentsResult> {
  return invoke<LoadUserDocumentsResult>('load_user_documents');
}

export async function writeUserDocument(
  kind: UserDocumentKind,
  id: string,
  content: string,
  expectedContent: string | null
): Promise<StoredUserDocument> {
  const result = await invoke<{ relativePath: string; content: string }>('write_user_document', {
    request: { kind, id, content, expectedContent }
  });
  return { kind, id, relativePath: result.relativePath, content: result.content };
}

export async function deleteUserDocument(
  kind: UserDocumentKind,
  id: string,
  expectedContent: string | null
): Promise<void> {
  await invoke('delete_user_document', { request: { kind, id, expectedContent } });
}

export async function userDataPath(): Promise<string> {
  return invoke<string>('user_data_path');
}

export function storageError(error: unknown): StorageCommandError {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as Partial<StorageCommandError>;
    if (typeof candidate.code === 'string' && typeof candidate.message === 'string') {
      return { code: candidate.code, message: candidate.message, relativePath: candidate.relativePath };
    }
  }
  return { code: 'unknown', message: error instanceof Error ? error.message : String(error) };
}
