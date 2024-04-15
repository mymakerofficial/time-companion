import type { Publisher } from '@shared/events/publisher'
import { BrowserWindow } from 'electron'

// subscribes to the publisher and forwards events to the window
export function registerIpcPublisher<
  TTopics extends object,
  TEvent extends object,
>(
  channel: string,
  publisher: Publisher<TTopics, TEvent>,
  window: BrowserWindow,
) {
  const subscriber = publisher.subscribe({}, (event, topics) => {
    window.webContents.send(channel, event, topics)
  })

  window.on('close', () => {
    publisher.unsubscribe({}, subscriber)
  })
}
