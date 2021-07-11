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

		// for (const emoji of options.emojiList) await currentPage.react(emoji);
		// const reactionCollector = currentPage.createReactionCollector({
		// 	filter: (reaction, user) => {
		// 		if (reaction.emoji.name) {
		// 			return options.emojiList.includes(reaction.emoji.name) &&
		// 			!user.bot &&
		// 			(options.owner ? options.owner.id === user.id : true)
		// 		}
		// 		return false;
		// 	},
		// 	time: options.timeout
		// });

		collector.on("collect", (t) => {
			switch (t.customID) {
				case "Backward": {
					page = page > 0 ? --page : pages.length - 1;
					break;
				}
				case "Forward": {
					page = page + 1 < pages.length ? ++page : 0;
					break;
				}
			}
			currentPage.edit({embeds:
					[pages[page].setFooter(formatFooter(options.footer, page + 1, pages.length))]
			});
		});

		// reactionCollector.on('collect', (reaction, user) => {
		// 	reaction.users.remove(user);
		// 	switch (reaction.emoji.name) {
		// 		case options.emojiList[0]:
		// 			page = page > 0 ? --page : pages.length - 1;
		// 			break;
		// 		case options.emojiList[1]:
		// 			page = page + 1 < pages.length ? ++page : 0;
		// 			break;
		// 		default:
		// 			break;
		// 	}
		// 	currentPage.edit({embeds:
		// 		[pages[page].setFooter(formatFooter(options.footer, page + 1, pages.length))]
		// 	});
		// });

		// collector.on("end", (t) => currentPage.components.);

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
