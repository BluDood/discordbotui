<script lang="ts">
  let { children } = $props()

  import { page } from '$app/state'
  import { onMount } from 'svelte'

  import '../index.css'
  import '@fontsource-variable/inter'
  import '@fontsource/material-icons'

  import { tokenStore } from '$lib/stores.js'
  import { req } from '$lib/utils.js'

  import Loader from '../components/Loader.svelte'

  interface Guild {
    id: string
    name: string
    icon: string | null
  }

  let loggedIn = $state(false)
  let loading = $state(false)
  let guilds: Guild[] = $state([])

  async function loadGuilds() {
    loading = true
    const res = await req.get('users/@me/guilds')

    guilds = res.data.map((g: any) => ({
      id: g.id,
      name: g.name,
      icon: g.icon
        ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`
        : null
    }))
    loading = false
  }

  async function init(silent = false) {
    const savedToken = sessionStorage.getItem('bot_token')
    if (savedToken) {
      tokenStore.set(savedToken)
      loggedIn = true
      await loadGuilds()
    } else if (!silent) {
      const token = prompt('Enter your bot token:')
      if (!token) return

      sessionStorage.setItem('bot_token', token)
      init()
    }
  }

  async function logout() {
    loggedIn = false
    tokenStore.set(null)
    sessionStorage.removeItem('bot_token')
    guilds = []
  }

  onMount(() => {
    init(true)
  })
</script>

<svelte:head>
  {#if page.params.guild_id}
    <title>
      {guilds?.find(g => g.id === page.params.guild_id)?.name}
    </title>
  {:else}
    <title>Discord Bot UI</title>
  {/if}
</svelte:head>

<main>
  <div class="sidebar">
    {#if loading}
      <div class="loader">
        <Loader />
      </div>
    {:else if guilds.length > 0}
      <div class="guilds">
        {#each guilds as guild}
          <a
            class="guild"
            href="#/{guild.id}"
            data-active={page.params.guild_id === guild.id}
          >
            <img src={guild.icon} alt={guild.name} title={guild.name} />
            <p>{guild.name}</p>
          </a>
        {/each}
      </div>
    {/if}
    <div class="fill"></div>
    <div class="footer">
      {#if loggedIn}
        <button onclick={logout}>
          <span class="material-icons">logout</span>
          Logout
        </button>
      {:else}
        <button onclick={() => init()}>
          <span class="material-icons">login</span>
          Login
        </button>
      {/if}
    </div>
  </div>
  {@render children()}
</main>

<style>
  main {
    display: flex;
    height: 100svh;
    width: 100svw;
    overflow: hidden;
  }

  .sidebar {
    width: 250px;
    min-width: 56px;
    resize: horizontal;
    background-color: #111;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    overflow-y: auto;
    animation: appear 500ms ease;
  }

  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .fill {
    flex: 1;
  }

  .footer {
    display: flex;
    width: 100%;
  }

  .footer button {
    all: unset;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    cursor: pointer;
    flex: 1;
  }

  .guilds {
    display: flex;
    flex-direction: column;
    width: 100%;
    animation: appear 500ms ease;
  }

  .guild {
    all: unset;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    cursor: pointer;
    transition: 200ms ease;
  }

  .guild:hover {
    background-color: #222;
  }

  .guild[data-active='true'] {
    font-weight: 600;
    background-color: #222;
  }

  .guild img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }

  .guild p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
