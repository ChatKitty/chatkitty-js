<script setup lang="ts">
import type { Ref } from 'vue'

import { onMounted, ref, watch } from 'vue'
import { register } from 'vue-advanced-chat'
import * as chatService from '@/chatkitty'

register()

const props = defineProps<{
  theme: string
  username: string
}>()

const rooms: Ref<any[]> = ref([])
const roomsLoaded = ref(false)
const loadingRooms = ref(false)

const messages: Ref<any[]> = ref([])
const messagesLoaded = ref(false)

const currentRoom = ref(null)

const setup = async (username: string) => {
  await chatService.login(username)

  loadingRooms.value = true
  rooms.value = await chatService.fetchRooms()
  loadingRooms.value = false

  roomsLoaded.value = true
}

const fetchMessages = async ({ room, options = {} }: any) => {
  if (options.reset) {
    chatService.exitRoom(room)

    messages.value = []
    messagesLoaded.value = false

    await chatService.enterRoom({
      room,
      onMessageReceived: (message: any) => {
        messages.value = [...messages.value, message]
      },
      onRoomUpdated: (room: any) => {
        currentRoom.value = room

        rooms.value = rooms.value.map((r) => (r.roomId == room.roomId ? room : r))
      }
    })

    currentRoom.value = room
  }

  if (messagesLoaded.value) {
    return
  }

  const { items, hasMore } = await chatService.fetchMessages(room)

  messages.value = [...items, ...messages.value]
  messagesLoaded.value = !hasMore
}

const sendMessage = ({ content }: any) => {
  chatService.sendMessage({ room: currentRoom.value, content })
}

const tearDown = async () => {
  await chatService.logout()

  rooms.value = []
  roomsLoaded.value = false
  loadingRooms.value = false

  messages.value = []
  messagesLoaded.value = false
}

onMounted(async () => {
  await setup(props.username)

  watch(
    () => props.username,
    async (username) => {
      await tearDown()

      await setup(username)
    }
  )
})
</script>

<template>
  <vue-advanced-chat
    height="calc(100vh - 100px)"
    :current-user-id="username"
    :theme="theme"
    :loading-rooms="loadingRooms"
    :rooms-loaded="roomsLoaded"
    :messages-loaded="messagesLoaded"
    :single-room="false"
    :show-search="false"
    :show-add-room="false"
    :show-files="false"
    :show-audio="false"
    :show-emojis="false"
    :show-reaction-emojis="false"
    .rooms="rooms"
    .messages="messages"
    @fetch-messages="fetchMessages($event.detail[0])"
    @send-message="sendMessage($event.detail[0])"
  />
</template>
