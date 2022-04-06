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
	{ emojiList, footer, owner, timeout }: Partial<PageOptions>, startPage?: number) {

	const options: PageOptions = {
		emojiList: emojiList ?? ['⬅️', '➡️'],
		timeout: timeout ?? 120000,
		footer: footer ?? 'Showing page {current} of {max}',
		owner: owner || null,
	};

	let page = startPage
		? (startPage >= pages.length || startPage < 0)
			? 0
			: startPage
		: 0;

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

	if (pages.length > 1) {

		const slides = pages.map((p: MessageEmbed | MessageOptions, i) => {
			if (p instanceof MessageEmbed) {
				return {
					content: null,
					embeds: [p.setFooter({ text: formatFooter(options.footer, i + 1, pages.length)})],
				}
			}
			return p
		})

		timeout = timeout ?? 120000;

		const currentPage = await message.channel.send({
			...slides[page],
			components: row,
		});

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
					break;
				}
				case "Forward": {
					page = page + 1 < slides.length ? ++page : 0;
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
		let page = pages[0];

		if (page instanceof MessageEmbed) {
			page = {
				content: null,
				embeds: [page],
			}
		}

		return await message.channel.send({
			...page
		});
	}
}
