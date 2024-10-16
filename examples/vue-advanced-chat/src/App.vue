<script setup lang="ts">
import ChatComponent from './components/ChatComponent.vue'
import { ref } from 'vue'

const theme = ref('light')

const users = [
  {
    username: 'b2a6da08-88bf-4778-b993-7234e6d8a3ff',
    name: 'Joni'
  },
  {
    username: 'abc4264d-f1b1-41c0-b4cc-1e9daadfc893',
    name: 'Penelope'
  },
  {
    username: 'c6f75947-af48-4893-a78e-0e0b9bd68580',
    name: 'Julie'
  },
  {
    username: '2989c53a-d0c5-4222-af8d-fbf7b0c74ec6',
    name: 'Paxton'
  },
  {
    username: '8fadc920-f3e6-49ff-9398-1e58b3dc44dd',
    name: 'Zaria'
  }
]

const username = ref(users[Math.floor(Math.random() * users.length)].username)
</script>

<template>
  <div class="app-container" :class="{ 'app-container-dark': theme === 'dark' }">
    <span class="user-logged" :class="{ 'user-logged-dark': theme === 'dark' }">
      Logged in as
    </span>
    <select v-model="username">
      <option v-for="user in users" :key="user.username" :value="user.username">
        {{ user.name }}
      </option>
    </select>

    <div class="button-theme">
      <button class="button-light" @click="theme = 'light'">Light</button>
      <button class="button-dark" @click="theme = 'dark'">Dark</button>
    </div>

    <ChatComponent :theme="theme" :username="username" />
  </div>
</template>

<style lang="scss">
body {
  margin: 0;
}

input {
  -webkit-appearance: none;
}

.app-container {
  font-family: 'Quicksand', sans-serif;
  padding: 30px;

  &.app-container-dark {
    background: #131415;
  }
}

.user-logged {
  font-size: 12px;
  margin-right: 5px;
  margin-top: 10px;

  &.user-logged-dark {
    color: #fff;
  }
}

select {
  height: 20px;
  outline: none;
  border: 1px solid #e0e2e4;
  border-radius: 4px;
  background: #fff;
  margin-bottom: 20px;
}

.button-theme {
  float: right;
  display: flex;
  align-items: center;

  .button-light {
    background: #fff;
    border: 1px solid #46484e;
    color: #46484e;
  }

  .button-dark {
    background: #1c1d21;
    border: 1px solid #1c1d21;
  }

  button {
    color: #fff;
    outline: none;
    cursor: pointer;
    border-radius: 4px;
    padding: 6px 12px;
    margin-left: 10px;
    border: none;
    font-size: 14px;
    transition: 0.3s;
    vertical-align: middle;

    &.button-github {
      height: 30px;
      background: none;
      padding: 0;
      margin-left: 20px;

      img {
        height: 30px;
      }
    }

    &:hover {
      opacity: 0.8;
    }

    &:active {
      opacity: 0.6;
    }

    @media only screen and (max-width: 768px) {
      padding: 3px 6px;
      font-size: 13px;
    }
  }
}
</style>
