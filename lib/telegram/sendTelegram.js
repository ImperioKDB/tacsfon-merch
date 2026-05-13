/**
 * lib/telegram/sendTelegram.js
 *
 * Sends a message to one or more Telegram chat IDs via the Bot API.
 *
 * Design rule: NEVER throws — catches internally and logs.
 * A Telegram failure must never break order creation.
 *
 * Env vars required:
 *   TELEGRAM_BOT_TOKEN
 *   TELEGRAM_ADMIN_CHAT_ID_1
 *   TELEGRAM_ADMIN_CHAT_ID_2
 */

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

/**
 * Sends a text message to a single Telegram chat.
 *
 * @param {string|number} chatId
 * @param {string}        text
 * @param {string}        parseMode  - 'HTML' | 'Markdown' (default: 'HTML')
 */
export async function sendTelegramMessage(chatId, text, parseMode = 'HTML') {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    chatId,
        text,
        parse_mode: parseMode,
      }),
    })

    const result = await response.json()

    if (!result.ok) {
      console.error(JSON.stringify({
        level:   'error',
        event:   'telegram_send_failed',
        chatId,
        reason:  result.description,
      }))
    } else {
      console.log(JSON.stringify({
        level:  'info',
        event:  'telegram_sent',
        chatId,
      }))
    }
  } catch (err) {
    console.error(JSON.stringify({
      level:  'error',
      event:  'telegram_unexpected_error',
      chatId,
      error:  err.message,
    }))
  }
}

/**
 * Broadcasts a message to both admin Telegram chats.
 * Fires both concurrently, non-blocking.
 *
 * @param {string} text
 */
export function notifyAdmins(text) {
  const chatIds = [
    process.env.TELEGRAM_ADMIN_CHAT_ID_1,
    process.env.TELEGRAM_ADMIN_CHAT_ID_2,
  ].filter(Boolean)

  for (const chatId of chatIds) {
    sendTelegramMessage(chatId, text).catch(() => {})
  }
}
