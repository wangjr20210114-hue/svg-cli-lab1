export class HelpPresenter {
  format(syntaxes: readonly string[]): string {
    return ['Commands:',...syntaxes.map(syntax=>'  '+syntax),'Types: rect / circle / ellipse / line / text / g',
      'rect: x y width height [fill] | circle: cx cy r [fill] | ellipse: cx cy rx ry [fill]',
      'line: x1 y1 x2 y2 [stroke] | text: x y "content" | g: no parameters',
      'Use double quotes for arguments containing spaces; lines starting with # are comments.',
      'EOF exits (Ctrl+Z then Enter on Windows; Ctrl+D on macOS/Linux).'].join('\n');
  }
}
