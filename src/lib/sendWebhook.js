/**
 * Create a Discord embed with consistent styling
 * @param {Object} options - Embed options
 * @param {string} options.title - The embed title
 * @param {string} options.description - The embed description
 * @param {string} [options.color] - The embed color in hex format (e.g. '#00ff00')
 * @param {Array<{name: string, value: string, inline?: boolean}>} [options.fields] - The embed fields
 * @param {string} [options.thumbnail] - URL for the thumbnail image
 * @param {string} [options.footer] - Footer text
 * @returns {Object} The formatted Discord embed
 */
export function createDiscordEmbed({
  title,
  description,
  color = '#2563eb',
  fields = [],
  thumbnail,
  footer,
}) {
  return {
    title,
    description,
    color: parseInt(color.replace('#', ''), 16),
    fields,
    thumbnail: thumbnail ? { url: thumbnail } : undefined,
    footer: footer ? { text: footer } : undefined,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Send a Discord webhook message with an embed
 * @param {string} content - The message content
 * @param {Object} embed - The embed object following Discord's embed structure
 * @returns {Promise<Response>} The fetch response
 */
export async function sendDiscordWebhook(content, embed) {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    console.warn('Discord webhook URL not configured');
    return;
  }

  try {
    const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        embeds: embed ? [embed] : [],
      }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorBody}`);
      }
      
    return response;
  } catch (error) {
    console.error('Error sending Discord webhook:', error);
    throw error;
  }
}