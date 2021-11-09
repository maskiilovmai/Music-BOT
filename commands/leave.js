const { canModifyQueue } = require("../util/Util");
const i18n = require("../util/i18n");

module.exports = {
    name: "leave",
    aliases: ["quit"],
    description: i18n.__("leave.description"),

    execute(message) {
        if (!message.member.voice.channel) return;

        message.member.voice.channel.leave();
        //message.channel.send("Đã rời khỏi kênh thoại!")
        message.channel.send(i18n.__mf("leave.result"))
    }
}