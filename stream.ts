import { ReadableStream } from "stream/web";
import { Buffer } from "buffer";

export const nodeStreamToReadableStreamReader = (
  nodeStream: NodeJS.ReadableStream
) => {
  const readableStream = new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => {
        if (typeof chunk === "string") {
          controller.enqueue(new TextEncoder().encode(chunk));
        } else if (Buffer.isBuffer(chunk)) {
          controller.enqueue(new Uint8Array(chunk));
        } else {
          controller.error(new Error("Unknown chunk type"));
        }
      });
      nodeStream.on("end", () => {
        controller.close();
      });
      nodeStream.on("error", (err) => {
        controller.error(err);
      });
    },
    cancel() {
      if (typeof nodeStream.pause === "function") {
        nodeStream.pause();
      }
      if (typeof nodeStream.unpipe === "function") {
        nodeStream.unpipe();
      }
    },
  });

  return readableStream.getReader();
};
