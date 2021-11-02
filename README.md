# discord-js-button-pagination-ts
[jellz' discord.js-pagination](https://github.com/jellz/discord.js-pagination/) Modified and changed to use buttons.
- Buttons
- Select start page
- Paginate Embeds and or messageOptions, or mix both! (This allows pagination of messages with only text on one page and multiple embeds on next page!)

Usage
```ts
import { sendPaginatedMessage } from "discord-js-button-pagination-ts";
import { Message, MessageEmbed } from "discord.js";

new command("Example command", async (message: Message) => {
    const pages = [new MessageEmbed()
        .setDescription("Page 1"),
        // Pages can be the messageOptions object
        {
            content: "Page 2",
            embeds: [new MessageEmbed()
                .setDescription("Embed on page 2"),
                new MessageEmbed()
                    .setDescription("Another embed on page 2")],
        }];

    await sendPaginatedMessage(message, pages, { owner: message.author, timeout: 30000 });
});
```

TODO: Update this.
