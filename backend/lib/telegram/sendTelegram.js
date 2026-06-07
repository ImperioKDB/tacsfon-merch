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
 *   TELEGRAM_ADMIN_CHAT_ID_2  (optional second admin)
 */

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

/**
 * Sends a text message to a single Telegram chat.
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
        disable_web_page_preview: true,
      }),
    })

    const result = await response.json()

    if (!result.ok) {
      console.error(JSON.stringify({
        level:  'error',
        event:  'telegram_send_failed',
        chatId,
        reason: result.description,
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
 * Broadcasts a message to all configured admin chat IDs.
 * Reads TELEGRAM_ADMIN_CHAT_ID_1 and TELEGRAM_ADMIN_CHAT_ID_2 from env.
 * Safe to call fire-and-forget — never throws.
 */
export async function notifyAdmins(text, parseMode = 'HTML') {
  const chatIds = [
    process.env.TELEGRAM_ADMIN_CHAT_ID_1,
    process.env.TELEGRAM_ADMIN_CHAT_ID_2,
  ].filter(Boolean)

  if (chatIds.length === 0) {
    console.warn(JSON.stringify({
      level: 'warn',
      event: 'telegram_no_admin_chat_ids',
    }))
    return
  }

  await Promise.all(
    chatIds.map(id => sendTelegramMessage(id, text, parseMode))
  )
}
