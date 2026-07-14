declare module 'gifshot' {
  export interface GifshotOptions {
    images?: string[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numFrames?: number;
    frameDuration?: number;
    fontWeight?: string;
    fontSize?: string;
    fontFamily?: string;
    fontColor?: string;
    textAlign?: string;
    textBaseline?: string;
    sampleInterval?: number;
    numWorkers?: number;
    progressCallback?: (captureProgress: number) => void;
  }

  export interface GifshotResult {
    error: boolean;
    errorCode: string;
    errorMsg: string;
    image: string; // Base64 Data URL
  }

  export function createGIF(
    options: GifshotOptions,
    callback: (obj: GifshotResult) => void
  ): void;
}
