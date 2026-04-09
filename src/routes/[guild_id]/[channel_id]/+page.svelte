<script lang="ts">
  import { page } from '$app/state'

  import { req } from '$lib/utils.js'

  import Loader from '../../../components/Loader.svelte'

  interface Message {
    id: string
    content: string
    timestamp: string
    author: {
      id: string
      username: string
      avatar: string
    }
  }

  let messages: Message[] | null = $state(null)
  let error: string | null = $state(null)

  let content: string = $state('')

  async function fetchMessages(channel: string) {
    messages = null
    error = null

    const res = await req.get(`channels/${channel}/messages`)

    if (res.status !== 200) {
      if (res.status === 403) {
        error = 'You do not have permission to view this channel.'
      } else {
        error = 'An unknown error occurred.'
      }
      return
    }

    messages = res.data.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      timestamp: msg.timestamp,
      author: {
        id: msg.author.id,
        username: msg.author.global_name || msg.author.username,
        avatar: msg.author.avatar
          ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png?size=64`
          : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(msg.author.id) >> 22n) % 6}.png`
      }
    }))
  }

  async function reload() {
    const channel = page.params.channel_id
    await fetchMessages(channel!)
  }

  async function send() {
    if (!content.trim()) return

    const channel = page.params.channel_id
    const res = await req.post(`channels/${channel}/messages`, {
      content
    })
    if (res.status !== 200) {
      alert(
        'Failed to send message. You may be missing permission to send messages.'
      )
      return
    }

    content = ''
    await fetchMessages(channel!)
  }

  $effect(() => {
    const channel = page.params.channel_id

    fetchMessages(channel!)
  })
</script>

<main>
  <button class="reload" onclick={reload} disabled={messages === null}>
    <div class="material-icons">refresh</div>
  </button>
  {#if error}
    <div class="error">
      <span class="material-icons"> error_outline </span>
      {error}
    </div>
  {:else if messages}
    <div class="messages">
      {#each messages as message}
        <div class="message">
          <img class="avatar" src={message.author.avatar} alt="avatar" />
          <div class="content">
            <strong>{message.author.username}</strong>
            <p>{message.content}</p>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="loading">
      <Loader />
    </div>
  {/if}
  <div class="input">
    <input
      type="text"
      placeholder="Type a message..."
      bind:value={content}
      onkeydown={e => e.key === 'Enter' && send()}
    />
    <button onclick={send}>
      <span class="material-icons"> send </span>
    </button>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
    animation: appear 500ms ease;
    position: relative;
  }

  .reload {
    all: unset;
    position: absolute;
    top: 16px;
    right: 16px;
    cursor: pointer;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 200ms ease;
  }

  .reload:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    animation: spin 500ms ease;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    animation: appear 500ms ease;
  }

  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 12px;
    animation: appear 500ms ease;
  }

  .error .material-icons {
    font-size: 48px;
    color: red;
  }

  .messages {
    display: flex;
    flex-direction: column-reverse;
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    animation: appear 500ms ease;
    gap: 16px;
  }

  .message {
    display: flex;
    gap: 12px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .content {
    background-color: #333;
    padding: 8px 12px;
    border-radius: 8px;
    max-width: 60%;
    display: flex;
    flex-direction: column;
    gap: 2px;
    user-select: text;
    word-break: break-all;
    white-space: pre-wrap;
  }

  .input {
    display: flex;
    border: 1px solid #555;
    border-radius: 8px;
    margin: 16px;
    overflow: hidden;
  }

  .input input {
    all: unset;
    flex: 1;
    padding: 8px;
  }

  .input button {
    all: unset;
    background-color: #0064ff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    cursor: pointer;
  }
</style>
