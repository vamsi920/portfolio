declare module 'webgazer' {
  interface WebGazerGazeData {
    x: number
    y: number
  }

  interface WebGazerAPI {
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

  const webgazer: WebGazerAPI
  export default webgazer
  export { webgazer, type WebGazerAPI, type WebGazerGazeData }
}
