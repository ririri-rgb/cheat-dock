use serde::{Deserialize, Serialize};
use std::fs::{self, File, OpenOptions};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

const MAX_FILE_BYTES: u64 = 1_048_576;
const MAX_FILES_PER_KIND: usize = 256;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageIssue {
    pub code: String,
    pub message: String,
    pub relative_path: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredDocument {
    pub kind: String,
    pub id: String,
    pub relative_path: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoadResult {
    pub root_path: String,
    pub documents: Vec<StoredDocument>,
    pub issues: Vec<StorageIssue>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WriteRequest {
    pub kind: String,
    pub id: String,
    pub content: String,
    pub expected_content: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteRequest {
    pub kind: String,
    pub id: String,
    pub expected_content: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WriteResult {
    pub relative_path: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandError {
    pub code: String,
    pub message: String,
    pub relative_path: Option<String>,
}

impl CommandError {
    fn new(code: &str, message: impl Into<String>, path: Option<&Path>, root: Option<&Path>) -> Self {
        let relative_path = path.and_then(|value| {
            root.and_then(|base| value.strip_prefix(base).ok())
                .map(|relative| relative.to_string_lossy().to_string())
                .or_else(|| Some(value.to_string_lossy().to_string()))
        });
        Self { code: code.into(), message: message.into(), relative_path }
    }
}

fn io_error(action: &str, error: std::io::Error, path: &Path, root: &Path) -> CommandError {
    CommandError::new("io", format!("{action}: {error}"), Some(path), Some(root))
}

pub fn user_data_root(app_data_dir: &Path) -> PathBuf {
    app_data_dir.join("user-data")
}

fn ensure_real_dir(path: &Path, root: Option<&Path>) -> Result<PathBuf, CommandError> {
    if let Ok(meta) = fs::symlink_metadata(path) {
        if meta.file_type().is_symlink() {
            return Err(CommandError::new("unsafe-path", "Symlinked data directories are not supported.", Some(path), root));
        }
    }
    fs::create_dir_all(path).map_err(|error| {
        let base = root.unwrap_or(path);
        io_error("Unable to create data directory", error, path, base)
    })?;
    fs::canonicalize(path).map_err(|error| {
        let base = root.unwrap_or(path);
        io_error("Unable to resolve data directory", error, path, base)
    })
}

pub fn ensure_layout(root: &Path) -> Result<PathBuf, CommandError> {
    let canonical_root = ensure_real_dir(root, None)?;
    for name in ["cheats", "overlays"] {
        let child = root.join(name);
        let canonical_child = ensure_real_dir(&child, Some(root))?;
        if !canonical_child.starts_with(&canonical_root) {
            return Err(CommandError::new("unsafe-path", "User data directory escaped the app data root.", Some(&child), Some(root)));
        }
    }
    Ok(canonical_root)
}

fn valid_id(kind: &str, id: &str) -> bool {
    if id.len() < 2 || id.len() > 80 || id.starts_with('-') {
        return false;
    }
    if !id.bytes().all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-') {
        return false;
    }
    match kind {
        "sheet" => id.starts_with("user-"),
        "overlay" => true,
        _ => false,
    }
}

fn subdir_for_kind(kind: &str) -> Option<&'static str> {
    match kind {
        "sheet" => Some("cheats"),
        "overlay" => Some("overlays"),
        _ => None,
    }
}

fn target_path(root: &Path, kind: &str, id: &str) -> Result<PathBuf, CommandError> {
    if !valid_id(kind, id) {
        return Err(CommandError::new("invalid-id", "Invalid document identity.", None, Some(root)));
    }
    let subdir = subdir_for_kind(kind).ok_or_else(|| CommandError::new("invalid-kind", "Unknown document kind.", None, Some(root)))?;
    let path = root.join(subdir).join(format!("{id}.md"));
    let parent = path.parent().expect("document path has parent");
    let canonical_root = ensure_layout(root)?;
    let canonical_parent = ensure_real_dir(parent, Some(root))?;
    if !canonical_parent.starts_with(&canonical_root) {
        return Err(CommandError::new("unsafe-path", "Document path escaped the app data root.", Some(&path), Some(root)));
    }
    Ok(path)
}

fn read_regular_file(path: &Path, root: &Path) -> Result<Option<String>, CommandError> {
    let metadata = match fs::symlink_metadata(path) {
        Ok(value) => value,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(None),
        Err(error) => return Err(io_error("Unable to inspect user file", error, path, root)),
    };
    if metadata.file_type().is_symlink() {
        return Err(CommandError::new("unsafe-path", "Symlinked user files are not loaded or overwritten.", Some(path), Some(root)));
    }
    if !metadata.is_file() {
        return Err(CommandError::new("invalid-file", "User data entry is not a regular file.", Some(path), Some(root)));
    }
    if metadata.len() > MAX_FILE_BYTES {
        return Err(CommandError::new("file-too-large", "User Markdown file exceeds the 1 MiB limit.", Some(path), Some(root)));
    }
    let mut file = File::open(path).map_err(|error| io_error("Unable to open user file", error, path, root))?;
    let mut bytes = Vec::with_capacity(metadata.len() as usize);
    file.read_to_end(&mut bytes).map_err(|error| io_error("Unable to read user file", error, path, root))?;
    String::from_utf8(bytes)
        .map(Some)
        .map_err(|_| CommandError::new("invalid-utf8", "User Markdown must be UTF-8.", Some(path), Some(root)))
}

fn issue_from_error(error: CommandError) -> StorageIssue {
    StorageIssue { code: error.code, message: error.message, relative_path: error.relative_path }
}

fn load_kind(root: &Path, kind: &str, documents: &mut Vec<StoredDocument>, issues: &mut Vec<StorageIssue>) {
    let Some(subdir) = subdir_for_kind(kind) else { return; };
    let directory = root.join(subdir);
    let entries = match fs::read_dir(&directory) {
        Ok(value) => value,
        Err(error) => {
            issues.push(issue_from_error(io_error("Unable to list user data directory", error, &directory, root)));
            return;
        }
    };

    for (index, entry) in entries.enumerate() {
        if index >= MAX_FILES_PER_KIND {
            issues.push(StorageIssue {
                code: "too-many-files".into(),
                message: format!("Only the first {MAX_FILES_PER_KIND} {kind} files are loaded."),
                relative_path: Some(subdir.into()),
            });
            break;
        }
        let entry = match entry {
            Ok(value) => value,
            Err(error) => {
                issues.push(StorageIssue { code: "io".into(), message: format!("Unable to inspect directory entry: {error}"), relative_path: Some(subdir.into()) });
                continue;
            }
        };
        let path = entry.path();
        let name = match path.file_name().and_then(|value| value.to_str()) {
            Some(value) => value,
            None => {
                issues.push(StorageIssue { code: "invalid-name".into(), message: "User file name is not valid UTF-8.".into(), relative_path: Some(subdir.into()) });
                continue;
            }
        };
        if !name.ends_with(".md") {
            continue;
        }
        let id = name.trim_end_matches(".md");
        if !valid_id(kind, id) {
            issues.push(StorageIssue { code: "invalid-id".into(), message: "Markdown file name does not contain a safe document ID.".into(), relative_path: Some(format!("{subdir}/{name}")) });
            continue;
        }
        match read_regular_file(&path, root) {
            Ok(Some(content)) => documents.push(StoredDocument {
                kind: kind.into(),
                id: id.into(),
                relative_path: format!("{subdir}/{name}"),
                content,
            }),
            Ok(None) => {}
            Err(error) => issues.push(issue_from_error(error)),
        }
    }
}

pub fn load_from_root(root: &Path) -> Result<LoadResult, CommandError> {
    ensure_layout(root)?;
    let mut documents = Vec::new();
    let mut issues = Vec::new();
    load_kind(root, "sheet", &mut documents, &mut issues);
    load_kind(root, "overlay", &mut documents, &mut issues);
    documents.sort_by(|a, b| a.relative_path.cmp(&b.relative_path));
    Ok(LoadResult { root_path: root.to_string_lossy().to_string(), documents, issues })
}

fn validate_content(content: &str, path: &Path, root: &Path) -> Result<(), CommandError> {
    if content.len() as u64 > MAX_FILE_BYTES {
        return Err(CommandError::new("file-too-large", "User Markdown file exceeds the 1 MiB limit.", Some(path), Some(root)));
    }
    if content.contains('\0') {
        return Err(CommandError::new("invalid-content", "User Markdown cannot contain NUL bytes.", Some(path), Some(root)));
    }
    if !content.replace("\r\n", "\n").starts_with("---\n") {
        return Err(CommandError::new("invalid-content", "User Markdown must start with frontmatter.", Some(path), Some(root)));
    }
    Ok(())
}

fn unique_temp_path(path: &Path, suffix: &str) -> PathBuf {
    let stamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_nanos();
    let name = path.file_name().and_then(|value| value.to_str()).unwrap_or("user.md");
    path.with_file_name(format!(".{name}.{suffix}-{}-{stamp}", std::process::id()))
}

fn write_synced(path: &Path, content: &[u8], root: &Path) -> Result<(), CommandError> {
    let mut file = OpenOptions::new().create_new(true).write(true).open(path)
        .map_err(|error| io_error("Unable to create temporary user file", error, path, root))?;
    file.write_all(content).map_err(|error| io_error("Unable to write temporary user file", error, path, root))?;
    file.sync_all().map_err(|error| io_error("Unable to sync temporary user file", error, path, root))?;
    Ok(())
}

fn backup_path(path: &Path) -> PathBuf {
    let mut name = path.file_name().unwrap_or_default().to_os_string();
    name.push(".bak");
    path.with_file_name(name)
}

fn write_backup(path: &Path, content: &str, root: &Path) -> Result<(), CommandError> {
    let backup = backup_path(path);
    if let Ok(metadata) = fs::symlink_metadata(&backup) {
        if metadata.file_type().is_symlink() {
            return Err(CommandError::new("unsafe-path", "Refusing to overwrite a symlinked backup.", Some(&backup), Some(root)));
        }
    }
    let temp = unique_temp_path(&backup, "tmp");
    write_synced(&temp, content.as_bytes(), root)?;
    if backup.exists() {
        fs::remove_file(&backup).map_err(|error| io_error("Unable to rotate previous backup", error, &backup, root))?;
    }
    if let Err(error) = fs::rename(&temp, &backup) {
        let _ = fs::remove_file(&temp);
        return Err(io_error("Unable to install backup", error, &backup, root));
    }
    Ok(())
}

#[cfg(unix)]
fn sync_directory(path: &Path, root: &Path) -> Result<(), CommandError> {
    File::open(path)
        .and_then(|file| file.sync_all())
        .map_err(|error| io_error("Unable to sync user data directory", error, path, root))
}

#[cfg(not(unix))]
fn sync_directory(_path: &Path, _root: &Path) -> Result<(), CommandError> { Ok(()) }

fn atomic_write_internal(root: &Path, request: &WriteRequest, fail_before_replace: bool) -> Result<WriteResult, CommandError> {
    let path = target_path(root, &request.kind, &request.id)?;
    validate_content(&request.content, &path, root)?;
    let current = read_regular_file(&path, root)?;

    match (&request.expected_content, &current) {
        (Some(expected), Some(actual)) if expected != actual => {
            return Err(CommandError::new("conflict", "The user Markdown file changed outside Cheat Dock. Reload before saving.", Some(&path), Some(root)));
        }
        (Some(_), None) => {
            return Err(CommandError::new("conflict", "The user Markdown file was removed outside Cheat Dock. Reload before saving.", Some(&path), Some(root)));
        }
        (None, Some(actual)) if actual != &request.content => {
            return Err(CommandError::new("conflict", "A user Markdown file with this identity already exists.", Some(&path), Some(root)));
        }
        _ => {}
    }

    if current.as_deref() == Some(request.content.as_str()) {
        return Ok(WriteResult {
            relative_path: path.strip_prefix(root).unwrap_or(&path).to_string_lossy().to_string(),
            content: request.content.clone(),
        });
    }

    let temp = unique_temp_path(&path, "tmp");
    write_synced(&temp, request.content.as_bytes(), root)?;
    let verified = read_regular_file(&temp, root)?.ok_or_else(|| CommandError::new("io", "Temporary write disappeared before validation.", Some(&temp), Some(root)))?;
    if verified != request.content {
        let _ = fs::remove_file(&temp);
        return Err(CommandError::new("verification-failed", "Temporary file did not match the requested Markdown.", Some(&temp), Some(root)));
    }

    if fail_before_replace {
        let _ = fs::remove_file(&temp);
        return Err(CommandError::new("injected-failure", "Injected write failure before atomic replace.", Some(&path), Some(root)));
    }

    if let Some(existing) = current.as_deref() {
        write_backup(&path, existing, root)?;
    }
    if let Err(error) = fs::rename(&temp, &path) {
        let _ = fs::remove_file(&temp);
        return Err(io_error("Unable to atomically replace user Markdown", error, &path, root));
    }
    sync_directory(path.parent().expect("document path has parent"), root)?;
    Ok(WriteResult {
        relative_path: path.strip_prefix(root).unwrap_or(&path).to_string_lossy().to_string(),
        content: request.content.clone(),
    })
}

pub fn write_to_root(root: &Path, request: &WriteRequest) -> Result<WriteResult, CommandError> {
    atomic_write_internal(root, request, false)
}

pub fn delete_from_root(root: &Path, request: &DeleteRequest) -> Result<(), CommandError> {
    let path = target_path(root, &request.kind, &request.id)?;
    let current = read_regular_file(&path, root)?;
    let Some(existing) = current else { return Ok(()); };
    if request.expected_content.as_deref() != Some(existing.as_str()) {
        return Err(CommandError::new("conflict", "The user Markdown file changed outside Cheat Dock. Reload before deleting.", Some(&path), Some(root)));
    }
    write_backup(&path, &existing, root)?;
    fs::remove_file(&path).map_err(|error| io_error("Unable to delete user Markdown", error, &path, root))?;
    sync_directory(path.parent().expect("document path has parent"), root)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_root(name: &str) -> PathBuf {
        let stamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
        std::env::temp_dir().join(format!("cheat-dock-{name}-{}-{stamp}", std::process::id()))
    }

    fn sample(id: &str, title: &str) -> String {
        format!("---\nid: {id}\ntitle: {title}\n---\n\n## Notes\n\n### Example\n- id: user-item\n- kind: shortcut\n- shortcut: Command + K\n")
    }

    #[test]
    fn writes_loads_and_backs_up_atomically() {
        let root = temp_root("atomic");
        let first = sample("user-alpha", "Alpha");
        let second = sample("user-alpha", "Beta");
        write_to_root(&root, &WriteRequest { kind: "sheet".into(), id: "user-alpha".into(), content: first.clone(), expected_content: None }).unwrap();
        write_to_root(&root, &WriteRequest { kind: "sheet".into(), id: "user-alpha".into(), content: second.clone(), expected_content: Some(first.clone()) }).unwrap();
        let loaded = load_from_root(&root).unwrap();
        assert_eq!(loaded.documents.len(), 1);
        assert_eq!(loaded.documents[0].content, second);
        assert_eq!(fs::read_to_string(root.join("cheats/user-alpha.md.bak")).unwrap(), first);
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn conflict_and_injected_failure_keep_old_file() {
        let root = temp_root("conflict");
        let first = sample("user-alpha", "Alpha");
        let second = sample("user-alpha", "Beta");
        write_to_root(&root, &WriteRequest { kind: "sheet".into(), id: "user-alpha".into(), content: first.clone(), expected_content: None }).unwrap();
        let conflict = write_to_root(&root, &WriteRequest { kind: "sheet".into(), id: "user-alpha".into(), content: second.clone(), expected_content: Some("stale".into()) }).unwrap_err();
        assert_eq!(conflict.code, "conflict");
        let injected = atomic_write_internal(&root, &WriteRequest { kind: "sheet".into(), id: "user-alpha".into(), content: second, expected_content: Some(first.clone()) }, true).unwrap_err();
        assert_eq!(injected.code, "injected-failure");
        assert_eq!(fs::read_to_string(root.join("cheats/user-alpha.md")).unwrap(), first);
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn delete_requires_matching_revision_and_leaves_backup() {
        let root = temp_root("delete");
        let first = sample("user-alpha", "Alpha");
        write_to_root(&root, &WriteRequest { kind: "sheet".into(), id: "user-alpha".into(), content: first.clone(), expected_content: None }).unwrap();
        assert!(delete_from_root(&root, &DeleteRequest { kind: "sheet".into(), id: "user-alpha".into(), expected_content: Some("stale".into()) }).is_err());
        delete_from_root(&root, &DeleteRequest { kind: "sheet".into(), id: "user-alpha".into(), expected_content: Some(first.clone()) }).unwrap();
        assert!(!root.join("cheats/user-alpha.md").exists());
        assert_eq!(fs::read_to_string(root.join("cheats/user-alpha.md.bak")).unwrap(), first);
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn rejects_path_traversal_and_unsafe_identifiers() {
        let root = temp_root("path");
        let error = write_to_root(&root, &WriteRequest { kind: "sheet".into(), id: "../../foo".into(), content: sample("user-alpha", "Alpha"), expected_content: None }).unwrap_err();
        assert_eq!(error.code, "invalid-id");
        assert!(!root.join("../foo.md").exists());
        let _ = fs::remove_dir_all(root);
    }

    #[cfg(unix)]
    #[test]
    fn isolates_symlinked_markdown_files() {
        use std::os::unix::fs::symlink;
        let root = temp_root("symlink");
        ensure_layout(&root).unwrap();
        let outside = root.parent().unwrap().join(format!("outside-{}.md", std::process::id()));
        fs::write(&outside, sample("user-alpha", "Outside")).unwrap();
        symlink(&outside, root.join("cheats/user-alpha.md")).unwrap();
        let loaded = load_from_root(&root).unwrap();
        assert!(loaded.documents.is_empty());
        assert!(loaded.issues.iter().any(|issue| issue.code == "unsafe-path"));
        let _ = fs::remove_file(outside);
        let _ = fs::remove_dir_all(root);
    }
}
