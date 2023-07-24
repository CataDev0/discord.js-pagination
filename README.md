
# discord-js-button-pagination-ts
[![npm version](https://badge.fury.io/js/discord-js-button-pagination-ts.svg)](https://badge.fury.io/js/discord-js-button-pagination-ts)

[jellz' discord.js-pagination](https://github.com/jellz/discord.js-pagination/) Modified and changed to use buttons.
- Buttons
- Select start page
- Optional owner
- Paginate Embeds and or messageOptions, or mix both!

This allows pagination of messages with only text on one page and multiple embeds on next page!

**Requirements**

[discord.js](https://www.npmjs.com/package/discord.js) ^14.6.0 - Or newer

**Usage**
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

---

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/C0C3IJV8A)
