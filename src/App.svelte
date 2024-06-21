<script lang="ts">
  import { type AudioFile, FileState } from "./types";
  import { classNames, save, toSI } from "./support";
  import convert from "./convert";

  let files: Array<AudioFile> = [];

  /**
   * Add a file onto our list of active files, then fetch its contents and
   * start decoding in the background.
   *
   * @param file The file to convert.
   */
  const addFile = (file: File): void => {
    const audioFile: AudioFile = {
      name: file.name,
      state: { state: FileState.InQueue },
    };
    files.push(audioFile);

    convert(file, (state) => {
      audioFile.state = state;
      files = files;
    });
  };

  // File upload element
  let fileElement: HTMLInputElement;
  const onFileUpload = () => {
    for (const file of fileElement.files ?? []) addFile(file);
    files = files;
  };

  // File drag and drop
  let isDragging = false;
  const onDrag = (event: DragEvent) => {
    isDragging = event.type == "dragover";
    event.preventDefault();
  };

  const onDrop = (event: DragEvent): void => {
    isDragging = false;

    event.preventDefault();
    if (!event.dataTransfer) return;

    if (event.dataTransfer.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        const item = event.dataTransfer.items[i];
        if (item.kind === "file") addFile(item.getAsFile()!);
      }
    } else {
      for (const file of event.dataTransfer.files) addFile(file);
    }

    files = files;
  };

  const saveFile = (name: string, contents: ArrayBuffer) => {
    const dot = name.lastIndexOf(".");
    const newName = (dot > 0 ? name.substring(0, dot) : name) + ".dfpwm";
    save(newName, new Blob([contents], { type: "application/octet-stream" }));
  };

  const toColour = (state: FileState): string => {
    if (state == FileState.Error) return "bg-red-200";
    if (state == FileState.Finished) return "bg-green-100";
    return "bg-blue-100";
  };
</script>

<div
  class="w-full h-full grid justify-center content-start"
  role="form"
  on:drop={onDrop}
  on:dragover={onDrag}
  on:dragleave={onDrag}
>
  <div
    class={classNames(
      "mt-20 max-w-4xl box-border py-4 px-2 border-4",
      isDragging ? "border-blue-400" : "border-gray-200",
    )}
  >
    <h1 class="text-4xl mb-4 text-gray-700">ComputerCraft Music Converter</h1>

    <input type="file" class="hidden" multiple accept="audio/*" bind:this={fileElement} on:change={onFileUpload} />

    <p>
      Drop a file or <button class="link-like" type="button" on:click={() => fileElement.click()}>choose one</button> to
      convert it to DFPWM1a.
    </p>

    {#if files.length > 0}
      <ul class="divide-y divide-gray-200">
        {#each files as { name, state }}
          <li>
            <div class={classNames("my-2 py-2 px-2", toColour(state.state))}>
              <h3 class="text-lg">{name}</h3>
              {#if state.state == FileState.InQueue}
                <div class="text-gray-600">In Queue</div>
              {:else if state.state == FileState.Decoding}
                <div class="text-gray-600">Decoding</div>
              {:else if state.state == FileState.Converting}
                <div class="text-gray-600">Decoding</div>
              {:else if state.state == FileState.Finished}
                <div>
                  <button class="link-like" type="button" on:click={() => saveFile(name, state.result)}>Download</button
                  >
                  <span class="text-gray-600">({toSI(state.result.byteLength)})</span>
                </div>
              {:else if state.state == FileState.Error}
                <div class="text-red-600">{state.message}</div>
                <pre class="text-red-900 text-xs">{state.detail}</pre>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
  <div class="max-w-4xl box-border py-1 px-2 text-gray-700 prose">
    <p>
      <a href="https://wiki.vexatos.com/dfpwm">DFPWMA</a> is a audio codec invented by Ben “GreaseMonkey” Russell. A
      modified version of this codec, DFPWM1a, is used by
      <a href="https://github.com/Vexatos/Computronics/">Computronics</a>'s tape drive and
      <a href="https://tweaked.cc">CC: Tweaked</a>'s speaker to play audio in Minecraft.
    </p>
    <p>This tool allows converting other audio files (such as MP3s) into DFPWM.</p>
    <p>
      Developed by <a href="https://github.com/SquidDev">@SquidDev</a>. To report bugs or view the source code, see
      <a href="https://github.com/SquidDev-CC/music.madefor.cc">the GitHub repository</a>.
    </p>
  </div>
</div>
