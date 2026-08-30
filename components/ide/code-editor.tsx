"use client";

import { useEffect, useRef } from "react";
import { EditorState, type Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  rectangularSelection,
  crosshairCursor,
  dropCursor
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab
} from "@codemirror/commands";
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
  HighlightStyle
} from "@codemirror/language";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap
} from "@codemirror/autocomplete";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { javascript } from "@codemirror/lang-javascript";
import { tags as t } from "@lezer/highlight";

/**
 * The editor at the centre of the coding workspace.
 *
 * This replaced a bare <textarea>, where Tab moved focus out of the field,
 * there were no line numbers, no highlighting, no bracket matching and no
 * auto-indent. For a round that is meant to simulate a real technical
 * interview — which is conducted in CoderPad or CodeSignal, not a comment
 * box — that gap was doing real damage to the exercise.
 *
 * CodeMirror 6 rather than Monaco: Monaco is the literal VS Code editor but
 * ships several megabytes and wants a webpack worker configuration that
 * fights Turbopack, or a CDN load, which is an external dependency on a page
 * people may be mid-interview in. CodeMirror gives the same editing
 * behaviours at a fraction of the weight and no network dependency.
 *
 * Theming uses the app's own CSS custom properties, so the editor follows
 * the light/dark theme and the user's accent choice instead of shipping its
 * own palette.
 */

/** Syntax colours, expressed against the app's tokens. */
const highlightStyle = HighlightStyle.define([
  { tag: [t.keyword, t.moduleKeyword, t.controlKeyword], color: "hsl(var(--brand-3))" },
  { tag: [t.definitionKeyword, t.modifier], color: "hsl(var(--brand-3))" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "hsl(var(--accent-text))" },
  { tag: [t.string, t.special(t.string)], color: "hsl(var(--success))" },
  { tag: [t.number, t.bool, t.null], color: "hsl(var(--warn))" },
  { tag: [t.comment, t.blockComment, t.lineComment], color: "hsl(var(--faint))", fontStyle: "italic" },
  { tag: [t.propertyName], color: "hsl(var(--brand-1))" },
  { tag: [t.operator, t.punctuation, t.separator], color: "hsl(var(--muted))" },
  { tag: [t.className, t.typeName], color: "hsl(var(--brand-2))" },
  { tag: [t.variableName], color: "hsl(var(--text))" },
  { tag: t.invalid, color: "hsl(var(--danger))" }
]);

/** Chrome — gutter, cursor, selection — also from the app's tokens. */
const editorTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    color: "hsl(var(--text))",
    fontSize: "13px",
    height: "100%"
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
    lineHeight: "1.6",
    overflow: "auto"
  },
  ".cm-content": { padding: "12px 0", caretColor: "hsl(var(--accent))" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "hsl(var(--faint))",
    border: "none",
    borderRight: "1px solid hsl(var(--border) / 0.6)",
    paddingRight: "4px"
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 12px", minWidth: "34px" },
  ".cm-activeLine": { backgroundColor: "hsl(var(--overlay) / 0.5)" },
  ".cm-activeLineGutter": {
    backgroundColor: "hsl(var(--overlay) / 0.5)",
    color: "hsl(var(--text-secondary))"
  },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "hsl(var(--accent))", borderLeftWidth: "2px" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
    backgroundColor: "hsl(var(--accent) / 0.25)"
  },
  ".cm-selectionMatch": { backgroundColor: "hsl(var(--accent) / 0.16)" },
  ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
    backgroundColor: "hsl(var(--accent) / 0.22)",
    outline: "1px solid hsl(var(--accent) / 0.5)"
  },
  ".cm-nonmatchingBracket": { color: "hsl(var(--danger))" },
  ".cm-foldGutter .cm-gutterElement": { color: "hsl(var(--faint))", cursor: "pointer" },
  ".cm-tooltip": {
    backgroundColor: "hsl(var(--surface-raised))",
    border: "1px solid hsl(var(--borderc))",
    borderRadius: "10px",
    color: "hsl(var(--text))"
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "hsl(var(--accent) / 0.18)",
    color: "hsl(var(--text))"
  },
  ".cm-panels": {
    backgroundColor: "hsl(var(--surface-raised))",
    color: "hsl(var(--text))",
    borderTop: "1px solid hsl(var(--borderc))"
  },
  ".cm-searchMatch": { backgroundColor: "hsl(var(--warn) / 0.3)" },
  ".cm-searchMatch-selected": { backgroundColor: "hsl(var(--accent) / 0.4)" }
});

export interface CursorPosition {
  line: number;
  column: number;
  selectionLength: number;
}

export function CodeEditor({
  value,
  onChange,
  onRun,
  onCursorChange,
  ariaLabel,
  readOnly = false
}: {
  value: string;
  onChange: (next: string) => void;
  /** Cmd/Ctrl+Enter, the shortcut people already expect from every IDE. */
  onRun?: () => void;
  onCursorChange?: (position: CursorPosition) => void;
  ariaLabel: string;
  readOnly?: boolean;
}) {
  const host = useRef<HTMLDivElement | null>(null);
  const view = useRef<EditorView | null>(null);
  // Held in refs so changing a callback never tears down and rebuilds the
  // editor, which would lose undo history and cursor position mid-edit.
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  const onCursorRef = useRef(onCursorChange);
  onChangeRef.current = onChange;
  onRunRef.current = onRun;
  onCursorRef.current = onCursorChange;

  useEffect(() => {
    if (!host.current || view.current) return;

    const extensions: Extension[] = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      crosshairCursor(),
      indentOnInput(),
      indentUnit.of("  "),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      highlightSelectionMatches(),
      javascript(),
      syntaxHighlighting(highlightStyle),
      editorTheme,
      EditorView.lineWrapping,
      EditorState.readOnly.of(readOnly),
      EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
      keymap.of([
        {
          key: "Mod-Enter",
          preventDefault: true,
          run: () => {
            onRunRef.current?.();
            return true;
          }
        },
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        // Last, so it only claims Tab when nothing above wants it. Escape
        // then Tab still moves focus, which keyboard users rely on.
        indentWithTab
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        if (update.selectionSet || update.docChanged) {
          const range = update.state.selection.main;
          const line = update.state.doc.lineAt(range.head);
          onCursorRef.current?.({
            line: line.number,
            column: range.head - line.from + 1,
            selectionLength: Math.abs(range.to - range.from)
          });
        }
      })
    ];

    view.current = new EditorView({
      state: EditorState.create({ doc: value, extensions }),
      parent: host.current
    });

    return () => {
      view.current?.destroy();
      view.current = null;
    };
    // Built once; `value` is synchronised by the effect below so that typing
    // does not recreate the editor on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Accept external changes (Reset to starter, restoring a saved draft)
  // without disturbing the cursor while the user is typing.
  useEffect(() => {
    const editor = view.current;
    if (!editor) return;
    const current = editor.state.doc.toString();
    if (current === value) return;
    editor.dispatch({
      changes: { from: 0, to: current.length, insert: value },
      selection: { anchor: Math.min(editor.state.selection.main.anchor, value.length) }
    });
  }, [value]);

  return <div ref={host} className="h-full w-full overflow-hidden" />;
}
