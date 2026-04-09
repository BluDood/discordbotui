<script lang="ts">
  let { children } = $props()

  import { page } from '$app/state'
  import { onMount } from 'svelte'

  import { CHANNEL_TYPE_MAP } from '$lib/constants.js'
  import { req } from '$lib/utils.js'

  import Loader from '../../components/Loader.svelte'

  interface Category {
    id: string
    name: string
    channels: Channel[]
  }

  interface Channel {
    id: string
    name: string
    type: 'text' | 'voice' | 'category' | 'unknown'
  }

  let categories: Category[] | null = $state(null)

  async function loadChannels(guild: string) {
    const res = await req.get(`guilds/${guild}/channels`)

    const cats = res.data
      .filter((c: any) => CHANNEL_TYPE_MAP[c.type] === 'category')
      .sort((a: any, b: any) => a.position - b.position)

    categories = cats.map((cat: Channel) => ({
      id: cat.id,
      name: cat.name,
      channels: res.data
        .sort((a: any, b: any) => a.position - b.position)
        .filter((c: any) => c.parent_id === cat.id)
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          type: CHANNEL_TYPE_MAP[c.type] || 'unknown'
        }))
    }))
  }

  $effect(() => {
    const guild = page.params.guild_id

    loadChannels(guild!)
  })
</script>

<svelte:head>
  {#if page.params.channel_id}
    <title>
      #{categories
        ?.find(c =>
          c.channels.some(ch => ch.id === page.params.channel_id)
        )
        ?.channels.find(ch => ch.id === page.params.channel_id)?.name}
    </title>
  {/if}
</svelte:head>

<main>
  <div class="sidebar">
    {#if categories}
      <div class="categories">
        {#each categories as category}
          <div class="category">
            <h3>{category.name}</h3>
            {#each category.channels as channel}
              <a
                class="channel"
                href="#/{page.params.guild_id}/{channel.id}"
                data-active={page.params.channel_id === channel.id}
              >
                <span class="material-icons">
                  {#if channel.type === 'text'}
                    tag
                  {:else if channel.type === 'voice'}
                    volume_up
                  {:else}
                    help_outline
                  {/if}
                </span>
                <p>
                  {channel.name}
                </p>
              </a>
            {/each}
          </div>
        {/each}
      </div>
    {:else}
      <Loader />
    {/if}
  </div>
  {@render children()}
</main>

<style>
  main {
    display: flex;
    overflow: hidden;
    flex: 1;
  }

  .sidebar {
    width: 300px;
    min-width: 150px;
    background-color: #222;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    animation: appear 500ms ease;
    resize: horizontal;
  }

  .categories {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    animation: appear 500ms ease;
  }

  .category {
    display: flex;
    flex-direction: column;
  }

  .category h3 {
    font-size: 14px;
    text-transform: uppercase;
    color: #aaa;
    padding: 12px;
    padding-bottom: 4px;
  }

  .channel {
    all: unset;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    padding-left: 16px;
    cursor: pointer;
    transition: 200ms ease;
  }

  .channel:hover {
    background-color: #333;
  }

  .channel[data-active='true'] {
    font-weight: 600;
    background-color: #333;
  }

  .channel .material-icons {
    font-size: 18px;
    color: #888;
  }

  .channel p {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
