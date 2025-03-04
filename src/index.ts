import {
	ActionRowBuilder,
	BaseMessageOptions,
	ButtonBuilder,
	EmbedBuilder,
	JSONEncodable,
	Message, MessageEditOptions,
	User,
} from 'discord.js';
import Utils from "./Utils";

const formatFooter = (footer: string, current: number, max: number) =>
	footer
		.replace('{%c}', current.toString())
		.replace('{%m}', max.toString());

/**
 * @property {[string, string]} emojiList - Customize emojis to use. Defaults to arrows
 * @property {Number} timeout - How long buttons show in ms. Defaults to 120000
 * @property {String} footer - Footer text. Defaults to page numbers
 * @property {User} owner - The user that gets control of buttons. Defaults to message author
 * @property {Boolean} allowEveryone - Whether buttons are usable by everyone. Overrides {@link owner}. Defaults to false
 * @property {Number} startPage - Page to start at. Defaults to 0
 */
export interface PageOptions {
	emojiList: [string, string];
	timeout: number;
	footer: string;
	owner: User;
	allowEveryone: boolean;
	startPage: number
}

// Overloads
export async function sendPaginatedMessage(
	message: Message<false>,
	pages: (EmbedBuilder | BaseMessageOptions)[],
	inputOptions?: Partial<PageOptions>
): Promise<void>;

export async function sendPaginatedMessage(
	message: Message<true>,
	pages: (EmbedBuilder | BaseMessageOptions)[],
	inputOptions?: Partial<PageOptions>
): Promise<void>;

export async function sendPaginatedMessage(
	message: Message,
	pages: (EmbedBuilder | BaseMessageOptions)[],
	inputOptions?: Partial<PageOptions>
): Promise<void>;

// Implementation
export async function sendPaginatedMessage<M extends boolean>(
	message: Message<M>,
	pages: (EmbedBuilder | BaseMessageOptions)[],
	inputOptions: Partial<PageOptions> = {}): Promise<void> {

	const options: PageOptions = {
		emojiList: inputOptions.emojiList ?? ['⬅️', '➡️'],
		timeout: inputOptions.timeout || 120000,
		footer: inputOptions.footer ?? 'Showing page {%c} of {%m}',
		owner: inputOptions.owner || message.author,
		allowEveryone: inputOptions.allowEveryone || false,
		startPage: inputOptions.startPage || 0
	};

	let page = options.startPage >= pages.length || options.startPage < 0
			? 0
			: options.startPage;

	const row = [new ActionRowBuilder<ButtonBuilder>({components: [
			new ButtonBuilder()
				.setCustomId("Backward")
				.setLabel(options.emojiList[0] ?? '⬅️')
				.setStyle(2),
			new ButtonBuilder()
				.setCustomId("Forward")
				.setLabel(options.emojiList[1] ?? "➡️")
				.setStyle(2),
		]})
	];

	if (pages.length > 1) {

		const slides: BaseMessageOptions[] = pages.map((p, i) => {
			if (Utils.isBaseMessageOptions(p)) {
				if (p.embeds?.length) {
					(p.embeds as (EmbedBuilder | JSONEncodable<EmbedBuilder>)[])[p.embeds.length - 1] = EmbedBuilder.from(p.embeds[p.embeds.length - 1]).setFooter(({text: formatFooter(options.footer, i + 1, pages.length)}))
				}
				return p;
			} else {
				return {
					content: undefined,
					embeds: [p.setFooter({text: formatFooter(options.footer, i + 1, pages.length)})],
				}
			}
		})

		const currentMessage = await message.reply({
			...slides[page],
			components: row,
		});

		const collector = currentMessage.createMessageComponentCollector({
			filter: async (i) => {
				if (["Forward", "Backward"].includes(i.customId)) {
					if (options.allowEveryone) {
						return true;
					}
					if (options.owner.id === i.user.id) {
						return true;
					}
				}

				await i.deferUpdate();
				return false;
			},
			time: options.timeout,
		})

		collector.on("collect", async (t) => {
			if (!t.deferred) await t.deferUpdate();

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

			const content: MessageEditOptions = {
				...slides[page],
				content: slides[page].content || null,
				files: slides[page].files || [],
				components: row,
			}

			await currentMessage.edit(content);
		});

		collector.once("end", async () => {
			await currentMessage.edit({components: []})
			collector.stop();
		});

		return;
	}

	else {
		let page = pages[0];

		if (!Utils.isBaseMessageOptions(page)) {
			page = {
				content: undefined,
				embeds: [page],
			}
		}

		await message.reply({
			...page
		});
	}
}
