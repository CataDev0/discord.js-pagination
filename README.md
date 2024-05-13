
# discord-js-button-pagination-ts
[![npm version](https://badge.fury.io/js/discord-js-button-pagination-ts.svg)](https://badge.fury.io/js/discord-js-button-pagination-ts)

#### Heavily modified [jellz' discord.js-pagination](https://github.com/jellz/discord.js-pagination/), changed to use buttons.

- Buttons, with custom emoji
- Select start page
- Allow a specific member, or everyone to use buttons 
- Paginate Embeds and or messageOptions, or mix both!

This allows unique pagination of messages with only text on one page and multiple embeds on next page!

**Requirements**

[discord.js](https://www.npmjs.com/package/discord.js) ^14.14.1 - Or newer

## [Documentation](https://cataclym.github.io/discord.js-pagination/)
### Quick overview

#### General Usage
```ts 
import { sendPaginatedMessage } from "discord-js-button-pagination-ts";
import { Message, EmbedBuilder } from "discord.js";

new command("Example command", async (message: Message) => {
    const pages = [new EmbedBuilder()
        .setDescription("Page 1"),
        // Pages can be the BaseMessageOptions object
        {
            content: "Page 2",
            embeds: [
                new EmbedBuilder()
                    .setDescription("Embed on page 2"),
                new EmbedBuilder()
                    .setDescription("Another embed on page 2")],
        }];
    
    await sendPaginatedMessage(message, pages, { owner: message.author, timeout: 30000 });
});
```
#### Setting custom emojis and allowing everyone
```ts
await sendPaginatedMessage(message, pages, { allowEveryone: true, emojiList: ['👈', '👉'] });
```

---

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/C0C3IJV8A)
