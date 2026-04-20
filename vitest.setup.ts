import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";

// jsdom's File does not implement arrayBuffer() in older bundles; polyfill it
// so Blob-based file reads work inside components under test.
if (typeof File !== "undefined" && !File.prototype.arrayBuffer) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  File.prototype.arrayBuffer = function () {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this as unknown as Blob);
    });
  };
}
