import ChatKitty from '@chatkitty/core';

import type { CurrentUser, Channel, Message, User } from '@chatkitty/core';
import { parseTimestamp } from '@/utils/dates';

export const chatkitty = ChatKitty.getInstance('afaac908-1db3-4b5c-a7ae-c040b9684403');

export const enterRoom = async ({
	room,
	onMessageReceived,
	onRoomUpdated,
}: {
	room: any;
	onMessageReceived: (message: any) => void;
	onRoomUpdated: (room: any) => void;
}) => {
	const result = await chatkitty.startChatSession({
		channel: room._channel,
		onMessageReceived: (message) => {
			const mapped = mapMessage(message);

			room.lastMessage = mapped;

			onMessageReceived(mapped);
			onRoomUpdated(room);
		},
	});

	if (result.succeeded) {
		room._chat_session = result.session;
	}
};

export const exitRoom = (room: any) => {
	room._chat_session?.end?.();

	room._messages_paginator = null;
	room._chat_session = null;
};

export const fetchMessages = async (room: any) => {
	if (room._messages_paginator) {
		const items = room._messages_paginator.items
			.map((message: Message) => mapMessage(message))
			.reverse();

		const hasMore = room._messages_paginator.hasNextPage;

		if (hasMore) {
			room._messages_paginator = await room._messages_paginator.nextPage();
		}

		return { items, hasMore };
	}

	const result = await chatkitty.listMessages({ channel: room._channel });

	if (result.succeeded) {
		const items = result.paginator.items.map((message) => mapMessage(message)).reverse();

		const hasMore = result.paginator.hasNextPage;

		if (hasMore) {
			room._messages_paginator = await result.paginator.nextPage();
		}

		return { items, hasMore };
	}

	return { items: [], hasMore: false };
};

export const fetchRooms = async () => {
	const user = chatkitty.currentUser;

	if (!user) {
		return [];
	}

	const result = await chatkitty.listChannels({ filter: { joined: true } });

	if (result.succeeded) {
		return await Promise.all(
			result.paginator.items.map(async (channel) => await mapChannel(user, channel)),
		);
	}

	return [];
};

export const login = async (username: string) => {
	await chatkitty.startSession({ username });
};

export const logout = async () => {
	await chatkitty.endSession();
};

export const sendMessage = async ({ room, content }: any) => {
	if (content) {
		await chatkitty.sendMessage({ channel: room._channel, body: content });
	}
};

const mapChannel = async (user: CurrentUser, channel: Channel) => ({
	roomId: channel.id,
	roomName:
		channel.type === 'DIRECT'
			? channel.members
					.filter((member) => member.id !== user.id)
					.map((member) => member.displayName)
					.join(', ')
			: channel.name,
	users:
		channel.type === 'DIRECT'
			? channel.members.map((member) => mapUser(member))
			: await (async () => {
					const result = await chatkitty.listChannelMembers({ channel });

					if (result.succeeded) {
						return result.paginator.items.map((member) => mapUser(member));
					}

					return [];
				})(),
	lastMessage:
		channel.lastReceivedMessage && mapMessage(channel.lastReceivedMessage, 'DD MMMM, HH:mm'),
	_channel: channel,
	_messages_paginator: null,
	_chat_session: null,
});

const mapMessage = (message: Message, timeFormat?: string) => ({
	_id: message.id,
	content: message.type === 'TEXT' || message.type === 'SYSTEM_TEXT' ? message.body : undefined,
	senderId: message.type === 'TEXT' || message.type === 'FILE' ? message.user.name : 'system',
	username:
		message.type === 'TEXT' || message.type === 'FILE' ? message.user.displayName : 'System',
	timestamp: parseTimestamp(message.createdTime, timeFormat || 'HH:mm'),
	date: parseTimestamp(message.createdTime, 'DD MMMM YYYY'),
	_message: message,
});

const mapUser = (user: User) => ({
	_id: user.name,
	username: user.displayName,
	avatar: user.displayPictureUrl,
	status: {
		state: user.presence.online ? 'online' : 'offline',
	},
	_user: user,
});
