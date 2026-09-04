---
id: excel
title: Excel
title-ja: Excel
description: High-frequency Excel shortcuts for macOS.
aliases: microsoft excel, spreadsheet
applications: com.microsoft.Excel
related:
---

## Editing
- title-ja: 編集

### Copy selection
- id: copy-selection
- title-ja: コピー
- kind: shortcut
- shortcut: Command + C
- aliases: copy, コピー
- tags: clipboard, editing
- source: https://support.microsoft.com/en-us/accessibility/keyboard-shortcuts-in-excel
Copies the current selection to the clipboard.

### Paste
- id: paste
- title-ja: 貼り付け
- kind: shortcut
- shortcut: Command + V
- aliases: paste, 貼り付け
- tags: clipboard, editing
- source: https://support.microsoft.com/en-us/accessibility/common-office-for-mac-keyboard-shortcuts
Pastes clipboard contents at the current selection.

### Paste Special
- id: paste-special
- title-ja: 形式を選択して貼り付け
- kind: shortcut
- shortcut: Command + Control + V
- aliases: paste special, values, 形式を選択して貼り付け
- tags: clipboard, editing
- source: https://support.microsoft.com/en-us/accessibility/common-office-for-mac-keyboard-shortcuts
Opens Paste Special so you can choose how clipboard contents are inserted.

### Undo
- id: undo
- title-ja: 元に戻す
- kind: shortcut
- shortcut: Command + Z
- aliases: undo, 元に戻す
- tags: editing, history
- source: https://support.microsoft.com/en-us/accessibility/common-office-for-mac-keyboard-shortcuts
Undoes the most recent change.

### Redo or repeat
- id: redo-repeat
- title-ja: やり直す・繰り返す
- kind: shortcut
- shortcut: Command + Y
- aliases: redo, repeat action, やり直す, 繰り返し
- tags: editing, history
- source: https://support.microsoft.com/en-us/accessibility/common-office-for-mac-keyboard-shortcuts
Redoes an undone action or repeats the last action when Excel supports repeating it.

### Edit active cell
- id: edit-active-cell
- title-ja: アクティブセルを編集
- kind: shortcut
- shortcut: Control + U
- aliases: edit cell, cell contents, セル編集
- tags: editing, cell
- source: https://support.microsoft.com/en-us/office/keyboard-shortcuts-in-excel-1798d9d5-842a-42b8-9c99-9b7213f0040f
Edits the active cell so you can change its existing contents in place.

### Find
- id: find
- title-ja: 検索
- kind: shortcut
- shortcut: Command + F
- aliases: search, find text, 検索
- tags: search, navigation
- source: https://support.microsoft.com/en-us/accessibility/common-office-for-mac-keyboard-shortcuts
Opens Find so you can search the workbook.

## File
- title-ja: ファイル

### Save workbook
- id: save-workbook
- title-ja: 保存
- kind: shortcut
- shortcut: Command + S
- aliases: save, 保存
- tags: file, basic
- source: https://support.microsoft.com/en-us/accessibility/common-office-for-mac-keyboard-shortcuts
Saves or syncs the current workbook.

### Open workbook
- id: open-workbook
- title-ja: 開く
- kind: shortcut
- shortcut: Command + O
- aliases: open file, workbook, 開く
- tags: file, navigation
- source: https://support.microsoft.com/en-us/accessibility/common-office-for-mac-keyboard-shortcuts
Opens a workbook or other file.

### Print
- id: print
- title-ja: 印刷
- kind: shortcut
- shortcut: Command + P
- aliases: print workbook, 印刷
- tags: file, output
- source: https://support.microsoft.com/en-us/accessibility/common-office-for-mac-keyboard-shortcuts
Opens the print workflow for the current workbook.

## Selection
- title-ja: 選択

### Select all
- id: select-all
- title-ja: すべて選択
- kind: shortcut
- shortcut: Command + A
- aliases: select all, 全選択
- tags: selection, editing
- source: https://support.microsoft.com/en-us/accessibility/common-office-for-mac-keyboard-shortcuts
Selects all content in the current context.

### Select entire column
- id: select-column
- title-ja: 列全体を選択
- kind: shortcut
- shortcut: Control + Space
- aliases: select column, entire column, 列選択
- tags: selection, column
- source: https://support.microsoft.com/en-us/office/keyboard-shortcuts-in-excel-1798d9d5-842a-42b8-9c99-9b7213f0040f
Selects the entire column containing the active cell.

### Select entire row
- id: select-row
- title-ja: 行全体を選択
- kind: shortcut
- shortcut: Shift + Space
- aliases: select row, entire row, 行選択
- tags: selection, row
- source: https://support.microsoft.com/en-us/office/keyboard-shortcuts-in-excel-1798d9d5-842a-42b8-9c99-9b7213f0040f
Selects the entire row containing the active cell.

## Fill and formulas
- title-ja: 入力と数式

### Fill down
- id: fill-down
- title-ja: 下方向へフィル
- kind: shortcut
- shortcut: Control + D
- aliases: fill down, copy down, 下へコピー, オートフィル
- tags: editing, fill
- source: https://support.microsoft.com/en-us/office/fill-data-automatically-in-worksheet-cells-74e31bdd-d993-45da-aa82-35a236c5b5db
Fills selected cells downward using the contents of the top cell.

### Fill right
- id: fill-right
- title-ja: 右方向へフィル
- kind: shortcut
- shortcut: Control + R
- aliases: fill right, copy right, 右へコピー, オートフィル
- tags: editing, fill
- source: https://support.microsoft.com/en-us/office/fill-data-automatically-in-worksheet-cells-74e31bdd-d993-45da-aa82-35a236c5b5db
Fills selected cells to the right using the contents of the leftmost cell.

### Show or hide formulas
- id: toggle-formulas
- title-ja: 数式表示を切り替える
- kind: shortcut
- shortcut: Control + `
- aliases: show formulas, formula view, 数式, 数式表示
- tags: formula, inspect
- source: https://support.microsoft.com/en-us/office/show-and-print-formulas-65a29965-b1d4-40db-944e-b5154d53a3da
Switches the worksheet between displaying calculated values and displaying formulas.

### Toggle absolute and relative references
- id: toggle-cell-reference
- title-ja: 絶対参照・相対参照を切り替える
- kind: shortcut
- shortcut: F4
- aliases: absolute reference, relative reference, dollar sign, 絶対参照, 相対参照
- tags: formula, reference
- source: https://support.microsoft.com/en-us/office/keyboard-shortcuts-in-excel-1798d9d5-842a-42b8-9c99-9b7213f0040f
Cycles a selected formula reference through relative, absolute, and mixed reference forms.

### AutoSum
- id: autosum
- title-ja: オートSUMを挿入
- kind: shortcut
- shortcut: Shift + Command + T
- aliases: autosum, sum formula, 合計, オートSUM
- tags: formula, calculation
- source: https://support.microsoft.com/en-us/office/use-autosum-to-sum-numbers-543941e7-e783-44ef-8317-7d1bb85fe706
Inserts a SUM formula for the nearby range Excel identifies.

## Date and time
- title-ja: 日付と時刻

### Insert current date
- id: current-date
- title-ja: 現在の日付を入力
- kind: shortcut
- shortcut: Control + ;
- aliases: today's date, current date, 日付, 今日
- tags: date, input
- source: https://support.microsoft.com/en-us/office/insert-the-current-date-and-time-in-a-cell-b5663451-10b0-40ab-9e71-6b0ce5768138
Inserts the current date as a fixed value in the active cell.

### Insert current time
- id: current-time
- title-ja: 現在の時刻を入力
- kind: shortcut
- shortcut: Command + ;
- aliases: current time, timestamp, 時刻, 現在時刻
- tags: time, input
- source: https://support.microsoft.com/en-us/office/insert-the-current-date-and-time-in-a-cell-b5663451-10b0-40ab-9e71-6b0ce5768138
Inserts the current time as a fixed value in the active cell.
