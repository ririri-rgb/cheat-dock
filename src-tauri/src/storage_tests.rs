use crate::storage::{ensure_layout, load_from_root, write_to_root, WriteRequest};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

fn temp_root(name: &str) -> PathBuf {
    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    std::env::temp_dir().join(format!(
        "cheat-dock-extra-{name}-{}-{stamp}",
        std::process::id()
    ))
}

fn sample(id: &str, title: &str) -> String {
    format!(
        "---\nid: {id}\ntitle: {title}\n---\n\n## Notes\n\n### Example\n- id: user-item\n- kind: shortcut\n- shortcut: Command + K\n"
    )
}

#[test]
fn rejects_markdown_over_one_mib_without_replacing_existing_data() {
    let root = temp_root("size");
    let original = sample("user-alpha", "Alpha");
    write_to_root(
        &root,
        &WriteRequest {
            kind: "sheet".into(),
            id: "user-alpha".into(),
            content: original.clone(),
            expected_content: None,
        },
    )
    .unwrap();

    let oversized = format!(
        "---\nid: user-alpha\ntitle: Alpha\n---\n\n## Notes\n\n### Huge\n- id: user-huge\n- kind: operation\n\n{}",
        "x".repeat(1_048_576)
    );
    let error = write_to_root(
        &root,
        &WriteRequest {
            kind: "sheet".into(),
            id: "user-alpha".into(),
            content: oversized,
            expected_content: Some(original.clone()),
        },
    )
    .unwrap_err();

    assert_eq!(error.code, "file-too-large");
    assert_eq!(fs::read_to_string(root.join("cheats/user-alpha.md")).unwrap(), original);
    let _ = fs::remove_dir_all(root);
}

#[test]
fn loads_at_most_the_bounded_number_of_markdown_files_and_reports_overflow() {
    let root = temp_root("count");
    ensure_layout(&root).unwrap();
    for index in 0..257 {
        let id = format!("user-{index:03}");
        fs::write(root.join("cheats").join(format!("{id}.md")), sample(&id, &format!("Sheet {index}"))).unwrap();
    }

    let loaded = load_from_root(&root).unwrap();
    assert_eq!(loaded.documents.iter().filter(|doc| doc.kind == "sheet").count(), 256);
    assert!(loaded.issues.iter().any(|issue| issue.code == "too-many-files"));
    let _ = fs::remove_dir_all(root);
}
