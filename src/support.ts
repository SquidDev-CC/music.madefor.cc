/**
 * Small helper-function for building class names.
 *
 * This is especially useful when some classes should be conditionally appled, as you can write:
 * {@code classNames(f(x) ? "some-class" : undefined)}
 */
export const classNames = (...classes: Array<string | undefined>): string => classes.filter(x => !!x).join(" ");

/**
 * Save a blob to a file.
 */
export const save = (filename: string, blob: Blob): void => {
  // Somewhat inspired by https://github.com/eligrey/FileSaver.js/blob/master/src/FileSaver.js
  // Goodness knows how well this works on non-modern browsers.
  const element = document.createElement("a");
  const url = URL.createObjectURL(blob);

  element.download = filename;
  element.rel = "noopener";
  element.href = url;

  setTimeout(() => URL.revokeObjectURL(url), 60e3);
  setTimeout(() => {
    element.dispatchEvent(new MouseEvent("click"));
  }, 0);
};

/** Convert a value to a SI-suffixed number.  */
export const toSI = (size: number): string => {
  if(size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MiB`;
  if(size >= 1024) return `${(size / 1024).toFixed(2)} KiB`;
  return `${size} B`;
}
