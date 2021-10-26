import { Message, MessageEmbed, User, MessageActionRow, MessageButton, MessageOptions } from 'discord.js';

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
	pages: (MessageEmbed | MessageOptions)[],
	{ emojiList, footer, owner, timeout }: Partial<PageOptions>) {

	const options: PageOptions = {
		emojiList: emojiList ?? ['⬅️', '➡️'],
		timeout: timeout ?? 120000,
		footer: footer ?? 'Showing page {current} of {max}',
		owner: owner || null,
	};

	let page = 0;

	const row = [new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId("Backward")
				.setLabel(options.emojiList[0] ?? '⬅️')
				.setStyle("SECONDARY"),
		)
		.addComponents(
			new MessageButton()
				.setCustomId("Forward")
				.setLabel(options.emojiList[1] ?? "➡️")
				.setStyle("SECONDARY"),
		)];

	const slides = pages.map((p: MessageEmbed | MessageOptions) => {
		if (p instanceof MessageEmbed) {
			return {
				content: null,
				embeds: [p],
			}
		}
		return p
	})

	if (pages.length > 1) {

		timeout = timeout ?? 120000;

		const currentPage = await message.channel.send({
			...slides[page],
			components: row,
		});

		// await currentPage.awaitMessageComponent({
		// 	componentType: "BUTTON",
		// 	filter: args => {
		// 		args.deferUpdate()
		// 		return owner
		// 			? owner.id === args.user.id
		// 			: true
		// 	},
		// 	time: timeout
		// })

		const collector = currentPage.createMessageComponentCollector({
			filter: (i) => {
				if (["Forward", "Backward"].includes(i.customId) && owner
					? owner.id === i.user.id
					: true) return true;
				else {
					i.deferUpdate()
					return false
				}
			},
			time: timeout,
		})

		collector.on("collect", async (t) => {
			await t.deferUpdate();
			switch (t.customId) {
				case "Backward": {
					page = page > 0 ? --page : slides.length - 1;
					if (slides[page].embeds?.length) (slides[page].embeds?.[slides[page].embeds!.length - 1] as MessageEmbed).setFooter(formatFooter(options.footer, page + 1, pages.length))
					break;
				}
				case "Forward": {
					page = page + 1 < slides.length ? ++page : 0;
					if (slides[page].embeds?.length) (slides[page].embeds?.[slides[page].embeds!.length - 1] as MessageEmbed).setFooter(formatFooter(options.footer, page + 1, pages.length))
					break;
				}
				default: {
					break;
				}
			}
			if (slides[page].files) await currentPage.removeAttachments();
			await currentPage.edit({
				...slides[page]
			});
		});

		collector.once("end", async () => {
			await currentPage.edit({components: []})
			collector.stop();
		});

		return currentPage;
	}

	else {
		return await message.channel.send({
				...slides[page]
		});
	}
}
