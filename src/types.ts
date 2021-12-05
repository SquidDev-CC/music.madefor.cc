export const enum FileState {
  InQueue = "InQueue",
  Decoding = "Decoding",
  Converting = "Converting",
  Finished = "Finished",
  Error = "Error",
};

export type AudioState = (
  { state: FileState.InQueue }
  | { state: FileState.Decoding }
  | { state: FileState.Converting }
  | { state: FileState.Finished, result: ArrayBuffer }
  | { state: FileState.Error, message: string, detail: string }
);

export type AudioFile = { name: string, state: AudioState };
