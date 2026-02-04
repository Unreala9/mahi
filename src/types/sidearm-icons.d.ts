// TypeScript declarations for Sidearm Icons web components

declare namespace JSX {
  interface IntrinsicElements {
    "s-icon": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        name?: string;
      },
      HTMLElement
    >;
  }
}
