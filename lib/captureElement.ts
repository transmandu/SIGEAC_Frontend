import { toPng } from "html-to-image";

export interface CapturedElement {
  dataUrl: string;
  width: number;
  height: number;
}

export const captureElementAsPng = async (
  element: HTMLElement,
  options: { backgroundColor?: string; pixelRatio?: number } = {},
): Promise<CapturedElement> => {
  const { width, height } = element.getBoundingClientRect();
  const dataUrl = await toPng(element, {
    backgroundColor: options.backgroundColor ?? "#ffffff",
    pixelRatio: options.pixelRatio ?? 2,
    cacheBust: true,
  });
  return { dataUrl, width, height };
};
