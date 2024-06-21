import { convertAudio } from "./audio";
import { type AudioState, FileState } from "../types";

const queue: Array<{
  contents: ArrayBuffer,
  callback: (state: AudioState) => void,
}> = [];

let running = false;
const processQueue = async (): Promise<void> => {
  if (running) return;

  running = true;
  while (queue.length > 0) {
    const task = queue.shift()!;
    try {
      const result = await convertAudio(task.contents, task.callback);
      task.callback({ state: FileState.Finished, result });
    } catch (e: unknown) {
      task.callback({
        state: FileState.Error,
        message: "Error converting file",
        detail: `${e}`,
      })
    }
  }
  running = false;
}

export const convert = (contents: ArrayBuffer, callback: (state: AudioState) => void) => {
  queue.push({ contents, callback });
  processQueue();
}

export default (file: File, callback: (state: AudioState) => void) => {
  file.arrayBuffer()
    .then(contents => convert(contents, callback))
    .catch(x => callback({ state: FileState.Error, message: "Failed to read file", detail: `${x}` }));
}
