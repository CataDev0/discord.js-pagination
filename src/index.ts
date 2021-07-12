import { Message, MessageEmbed, User, MessageActionRow, MessageButton } from 'discord.js';

const formatFooter = (footer: string, current: number, max: number) =>
	footer
		.replace('{current}', current.toString())
		.replace('{max}', max.toString());

export interface PageOptions {
	emojiList: [string, string];
	timeout: number;
	footer: string;
	owner: User | null;
}

export async function sendPaginatedMessage(
	message: Message,
	pages: MessageEmbed[],
	{ emojiList, footer, owner, timeout }: Partial<PageOptions>) {
	const options: PageOptions = {
		emojiList: emojiList ?? ['⏪', '⏩'],
		timeout: timeout ?? 120000,
		footer: footer ?? 'Showing page {current} of {max}',
		owner: owner || null,
	};
	let page = 0;
	const row = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomID("Backward")
				.setLabel("⏪")
				.setStyle("PRIMARY"),
		)
		.addComponents(
			new MessageButton()
				.setCustomID("Forward")
				.setLabel("⏩")
				.setStyle("PRIMARY"),
		);

	if (pages.length > 1) {

		const currentPage = await message.channel.send({
				embeds: [pages[page].setFooter(formatFooter(options.footer, page + 1, pages.length))],
				components: [row],
			}
		);

		const collector = currentPage.createMessageComponentCollector({
			filter: (i) => ["Forward", "Backward"].includes(i.customID),
			time: timeout,
			dispose: true,
		})

		collector.on("collect", async (t) => {

			await t.deferUpdate();
			switch (t.customID) {
				case "Backward": {
					page = page > 0 ? --page : pages.length - 1;
					break;
				}
				case "Forward": {
					page = page + 1 < pages.length ? ++page : 0;
					break;
				}
				default: {
					break;
				}
			}

			await currentPage.edit({embeds:
					[pages[page].setFooter(formatFooter(options.footer, page + 1, pages.length))]
			});
		});

		collector.on("end", () => {
			collector.stop();
		})

		return currentPage;
	}

	else {
		return await message.channel.send({
				embeds: [pages[page].setFooter(formatFooter(options.footer, page + 1, pages.length))],
				components: [row],
			}
		);
	}
}
