import { BaseMessageOptions, EmbedBuilder } from "discord.js";

export default class Utils {
    static isBaseMessageOptions(page: BaseMessageOptions | EmbedBuilder): page is BaseMessageOptions {
        return "content" in page || "embeds" in page;
    }
}
