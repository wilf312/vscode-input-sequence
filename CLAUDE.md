# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code) 向けのガイダンスを提供します。

## 言語設定

このリポジトリでの作業時は日本語でコミュニケーションを取ってください。

## プロジェクト概要

これは「vscode-input-sequence」というVS Code拡張機能で、連番挿入機能を提供します。設定可能な構文パターンを使用して、複数のカーソル位置に連続した数字を挿入できます。

## アーキテクチャ

### 主要コンポーネント

- **extension.js**: 全機能を含むメイン拡張ファイル
  - `activate()`: 拡張機能のアクティベーションとコマンド登録
  - `insertSequentialNumbers`: 入力ダイアログを開く主要コマンド
  - `parseInput()`: ユーザー入力構文の解析 (`<start> <operator> <step> : <digit> : <radix>`)
  - `calculate()`: 解析されたオプションに基づく連番生成
  - `perform()`: エディターの選択範囲に計算値を適用

### 主要機能

- 複数の演算子をサポート: `+`, `-`, `++`, `--`
- 設定可能な数値基数 (2-36進数)
- 桁数指定によるゼロパディング
- 16進数の大文字小文字保持
- 入力中のリアルタイムプレビュー
- 選択範囲の動作を制御する `sequence.replaceSelection` 設定オプション

## 開発コマンド

### テスト
```bash
pnpm test
```
VS Code拡張テストランナーを使用してテストスイートを実行します。

### パッケージング
```bash
pnpm run package  
```
vsce (Visual Studio Code Extension) ツールを使用して .vsix パッケージファイルを作成します。

### インストール
```bash
pnpm install
```
VS Code拡張開発の依存関係をインストールします。

## テスト構造

- テストは `test/` ディレクトリにあります
- `extension.test.js`: 入力解析と計算ロジックを網羅する包括的な単体テスト
- 有効・無効な入力構文パターンの検証
- 異なる演算子、基数値、エッジケースをカバー

## 設定

拡張機能は1つの設定項目を提供します：
- `sequence.replaceSelection` (真偽値、デフォルト: true): 初期選択範囲をシーケンスで置換するかを制御

## キーバインド

デフォルトキーバインド: `Ctrl+Alt+0` (Windows/Linux) / `Cmd+Alt+0` (Mac)