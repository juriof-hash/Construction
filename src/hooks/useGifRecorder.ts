import { useState } from 'react';
import gifshot from 'gifshot';

export const useGifRecorder = (svgRef: React.RefObject<SVGSVGElement>) => {
  const [frames, setFrames] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const captureFrame = async () => {
    if (!svgRef.current) return;

    try {
      const svgElement = svgRef.current;
      const { width, height } = svgElement.getBoundingClientRect();
      
      const clone = svgElement.cloneNode(true) as SVGSVGElement;
      clone.setAttribute('width', width.toString());
      clone.setAttribute('height', height.toString());
      
      // Ensure viewBox matches current bounds for exact snapshot
      // We also want to remove cursor classes from clone so they don't affect capture if they do
      clone.style.cursor = 'default';

      const svgData = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No 2d context');

      // Fill background
      ctx.fillStyle = '#fafaf9'; // bg-slate-50
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);

      const frameDataUrl = canvas.toDataURL('image/png');
      setFrames(prev => [...prev, frameDataUrl]);
      
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to capture frame', err);
    }
  };

  const clearFrames = () => {
    setFrames([]);
  };

  const createGif = () => {
    if (frames.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);

    const img = new Image();
    img.src = frames[0];
    img.onload = () => {
      gifshot.createGIF({
        images: frames,
        gifWidth: img.width,
        gifHeight: img.height,
        interval: 0.5, // 0.5 seconds per frame (2fps)
        numWorkers: 2,
        sampleInterval: 10,
        progressCallback: (captureProgress) => {
          setProgress(Math.round(captureProgress * 100));
        }
      }, (obj) => {
        setIsProcessing(false);
        if (!obj.error) {
          // Download GIF
          const link = document.createElement('a');
          link.href = obj.image;
          link.download = `geometry-capture-${Date.now()}.gif`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          clearFrames();
        } else {
          console.error('GIF generation failed', obj.errorMsg);
        }
      });
    };
  };

  return {
    frames,
    isProcessing,
    progress,
    captureFrame,
    clearFrames,
    createGif
  };
};
