/**
 * WebGazer.js eye-tracking API (minimal types for our usage).
 * @see https://github.com/brownhci/WebGazer/wiki/Top-Level-API
 */
export interface WebGazerGazeData {
  x: number
  y: number
}

export interface WebGazerAPI {
  begin(onFail?: () => void): Promise<WebGazerAPI>
  end(): WebGazerAPI
  pause(): WebGazerAPI
  resume(): Promise<WebGazerAPI>
  setGazeListener(listener: (data: WebGazerGazeData | null, elapsedTime: number) => void): WebGazerAPI
  clearGazeListener(): WebGazerAPI
  recordScreenPosition(x: number, y: number, eventType?: string): void
  addMouseEventListeners(): WebGazerAPI
  removeMouseEventListeners(): WebGazerAPI
  showVideo(show: boolean): WebGazerAPI
  showPredictionPoints(show: boolean): WebGazerAPI
  detectCompatibility(): boolean
  isReady(): boolean
}

declare const webgazer: WebGazerAPI
export default webgazer
