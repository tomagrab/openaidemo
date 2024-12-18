# Next.js 15 Documentation

## How to set up a new Next.js project

### System requirements

- [Node.js 18.18](https://nodejs.org/) or later.

### Automatic installation

We recommend starting a new Next.js app using create-next-app, which sets up everything automatically for you. To create a project, run:

```bash
npx create-next-app@latest openaidemo
```

On installation, you'll see the following prompts:

```bash
What is your project named? openaidemo
Would you like to use TypeScript? No / Yes
Would you like to use ESLint? No / Yes
Would you like to use Tailwind CSS? No / Yes
Would you like your code inside a `src/` directory? No / Yes
Would you like to use App Router? (recommended) No / Yes
Would you like to use Turbopack for `next dev`?  No / Yes
Would you like to customize the import alias (`@/*` by default)? No / Yes
What import alias would you like configured? @/*
```

After the prompts, create-next-app will create a folder with your project name and install the required dependencies.

## Project structure and organization

This page provides an overview of the folder and file conventions in Next.js, as well as tips for organizing your project.

### Folder and file conventions

#### Top-level folders

Top-level folders are used to organize your application's code and static assets.

![File Structure](https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Ftop-level-folders.png&w=1920&q=75)

|Folder|Description|
|---|---|
|app|	App Router|
|pages|	Pages Router|
|public|	Static assets to be served|
|src|	Optional application source folder|

#### Top-level files

Top-level files are used to configure your application, manage dependencies, run middleware, integrate monitoring tools, and define environment variables.

|File|Description|
|---|---|
|next.config.js	|Configuration file for Next.js|
|package.json	|Project dependencies and scripts|
|instrumentation.ts|	OpenTelemetry and Instrumentation file|
|middleware.ts	|Next.js request middleware|
|.env|	Environment variables|
|.env.local	|Local environment variables|
|.env.production|	Production environment variables|
|.env.development|	Development environment variables|
|.eslintrc.json	|Configuration file for ESLint|
|.gitignore	|Git files and folders to ignore|
|next-env.d.ts|	TypeScript declaration file for Next.js|
|tsconfig.json|	Configuration file for TypeScript|
|jsconfig.json|	Configuration file for JavaScript|

#### Routing Files

|File|Extension|Description|
|---|---|---|
|layout	|.js .jsx .tsx|Layout|
|page	|.js .jsx .tsx|Page|
|loading|	.js .jsx .tsx|Loading UI|
|not-found|	.js .jsx .tsx|Not found UI|
|error	|.js .jsx .tsx|Error UI|
|global-error|	.js .jsx .tsx|Global error UI|
|route	|.js .ts|	API endpoint|
|template	|.js .jsx .tsx|Re-rendered layout|
|default	|.js .jsx .tsx|Parallel route fallback page|

#### Nested routes

|Folder|Description|
|---|---|
|folder	|Route segment|
|folder/folder|	Nested route segment|

#### Dynamic routes

|File|Description|
|---|---|
|[folder]|	Dynamic route segment|
|[...folder]|	Catch-all route segment|
|[[...folder]]|	Optional catch-all route segment|

#### Route Groups and private folders

|Folder|Description|
|---|---|
|(folder)|	Group routes without affecting routing|
|_folder	|Opt folder and all child segments out of routing|

#### Parallel and Intercepted Routes

|Folder|Description|
|---|---|
|@folder	|Named slot|
|(.)folder	|Intercept same level|
|(..)folder	|Intercept one level above|
|(..)(..)folder	|Intercept two levels above|
|(...)folder	|Intercept from root|


#### Metadata file conventions

##### App icons

|File|Extension|Description|
|---|---|---|
|favicon|	.ico	|Favicon file|
|icon|	.ico .jpg .jpeg .png .svg|	App Icon file|
|icon|	.js .ts .tsx	|Generated App Icon|
|apple-icon|	.jpg .jpeg, .png|	Apple App Icon file|
|apple-icon	|.js .ts .tsx|	Generated Apple App Icon|


#### Open Graph and Twitter images

|File|Extension|Description|
|---|---|---|
|opengraph-image|	.jpg .jpeg .png .gif	|Open Graph image file|
|opengraph-image|	.js .ts .tsx|	Generated Open Graph image|
|twitter-image|	.jpg .jpeg .png .gif|	Twitter image file|
|twitter-image|	.js .ts .tsx	|Generated Twitter image|

#### SEO

|File|Extension|Description|
|---|---|---|
|sitemap|	.xml	|Sitemap file|
|sitemap|	.js .ts	|Generated Sitemap|
|robots|	.txt	|Robots file|
|robots|	.js .ts	|Generated Robots file|

#### Component hierarchy

The React components defined in special files of a route segment are rendered in a specific hierarchy:

- layout.js
- template.js
- error.js (React error boundary)
- loading.js (React suspense boundary)
- not-found.js (React error boundary)
- page.js or nested layout.js

![Component Hierarchy](https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Ffile-conventions-component-hierarchy.png&w=1920&q=75)

In a nested route, the components of a segment will be nested inside the components of its parent segment.

![Nested Component Hierarchy](https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Fnested-file-conventions-component-hierarchy.png&w=1920&q=75)

### Organizing your project

Apart from folder and file conventions, Next.js is unopinionated about how you organize and colocate your project files. But it does provide several features to help you organize your project.

#### Colocation

In the `app` directory, nested folders define route structure. Each folder represents a route segment that is mapped to a corresponding segment in a URL path.

However, even though route structure is defined through folders, a route is not publicly accessible until a `page.js` or `route.js` file is added to a route segment.

![Colocation](https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Fproject-organization-not-routable.png&w=1920&q=75)

And, even when a route is made publicly accessible, only the content returned by `page.js` or `route.js` is sent to the client.

![Colocation](https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Fproject-organization-routable.png&w=1920&q=75)

This means that project files can be safely colocated inside route segments in the `app` directory without accidentally being routable.

![Colocation](https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Fproject-organization-colocation.png&w=1920&q=75)

> **Good to know**:
> While you can colocate your project files in app you don't have to. If you prefer, you can keep them outside the app directory.

### Private folders

Private folders can be created by prefixing a folder with an underscore: `_folderName`

This indicates the folder is a private implementation detail and should not be considered by the routing system, thereby opting the folder and all its **subfolders** out of routing.

![Private Folders](https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Fproject-organization-private-folders.png&w=1920&q=75)

Since files in the `app` directory can be safely colocated by default, private folders are not required for colocation. However, they can be useful for:

- Separating UI logic from routing logic.
- Consistently organizing internal files across a project and the Next.js ecosystem.
- Sorting and grouping files in code editors.
- Avoiding potential naming conflicts with future Next.js file conventions.

> **Good to know**:
> - While not a framework convention, you might also consider marking files outside private folders as "private" using the same underscore pattern.
> - You can create URL segments that start with an underscore by prefixing the folder name with `%5F` (the URL-encoded form of an underscore): `%5FfolderName`.
> - If you don't use private folders, it would be helpful to know Next.js special file conventions to prevent unexpected naming conflicts.

### Route groups

Route groups can be created by wrapping a folder in parenthesis: `(folderName)`

This indicates the folder is for organizational purposes and should not be included in the route's URL path.

![Route Groups](https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Fproject-organization-route-groups.png&w=1920&q=75)

Route groups are useful for:

- Organizing routes into groups e.g. by site section, intent, or team.
- Enabling nested layouts in the same route segment level:
  - Creating multiple nested layouts in the same segment, including multiple root layouts
  - Adding a layout to a subset of routes in a common segment

### `src` directory

Next.js supports storing application code (including app) inside an optional src directory. This separates application code from project configuration files which mostly live in the root of a project.

![src Directory](https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Fproject-organization-src-directory.png&w=1920&q=75)

### Common strategies

The following section lists a very high-level overview of common strategies. The simplest takeaway is to choose a strategy that works for you and your team and be consistent across the project.

> **Good to know**: In our examples below, we're using `components` and `lib` folders as generalized placeholders, their naming has no special framework significance and your projects might use other folders like `ui`, `utils`, `hooks`, `styles`, etc.

#### Store project files outside of `app`

This strategy stores all application code in shared folders in the root of your project and keeps the `app` directory purely for routing purposes.

#### Store project files in top-level folders inside of `app`

This strategy stores all application code in shared folders in the root of the `app` directory.

#### Split project files by feature or route

This strategy stores globally shared application code in the root `app` directory and splits more specific application code into the route segments that use them.

## How to fetch data and stream

This page will walk you through how you can fetch data in Server Components and Client Components. As well as how to to stream content that depends on data.

### Fetching data
#### Server Components

You can fetch data in Server Components using:

1. The `fetch` API
2. An ORM or database

##### With the `fetch` API

To fetch data with the `fetch` API, turn your component into an asynchronous function, and await the `fetch` call. For example:

`app/blog/page.tsx`

```tsx
export default async function Page() {
  const data = await fetch('https://api.vercel.app/blog')
  const posts = await data.json()
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

##### With an ORM or database

You can fetch data with an ORM or database by turning your component into an asynchronous function, and awaiting the call:

`app/blog/page.tsx`

```tsx
import { db, posts } from '@/lib/db'

export default async function Page() {
  const allPosts = await db.select().from(posts)
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

#### Client Components

There are two ways to fetch data in Client Components, using:

1. React's `use` hook
2. A community library like SWR or React Query

##### With the `use` hook

You can use React's `use` hook to stream data from the server to client. Start by fetching data in your Server component, and pass the promise to your Client Component as prop:

`app/blog/page.tsx`

```tsx
import Posts from '@/app/ui/posts'
import { Suspense } from 'react'

export default function Page() {
  // Don't await the data fetching function
  const posts = getPosts()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Posts posts={posts} />
    </Suspense>
  )
}
```

Then, in your Client Component, use the `use` hook read the promise:

`app/ui/posts.tsx`

```tsx
'use client'
import { use } from 'react'

export default function Posts({ posts }) {
  const posts = use(posts)

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

In the example above, you need to wrap the `<Posts />` component in a `<Suspense>` boundary. This means the fallback will be shown while the promise is being resolved. Learn more about streaming.

##### Community libraries

You can use a community library like SWR or React Query to fetch data in Client Components. These libraries have their own semantics for caching, streaming, and other features. For example, with SWR:

`app/blog/page.tsx`

```tsx
'use client'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((r) => r.json())

export default function BlogPage() {
  const { data, error, isLoading } = useSWR(
    'https://api.vercel.app/blog',
    fetcher
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {data.map((post: { id: string; title: string }) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### Streaming

> **Warning**: The content below assumes the `dynamicIO` config option is enabled in your application. The flag was introduced in Next.js 15 canary.
> To enable the dynamicIO flag, set it to true in the experimental section of your next.config.ts file:
> ```ts
> import type { NextConfig } from 'next'
>
> const nextConfig: NextConfig = {
>   experimental: {
>     dynamicIO: true,
>   },
> }
>
> export default nextConfig
>  ```

When using `async/await` in Server Components, Next.js will opt into dynamic rendering. This means the data will be fetched and rendered on the server for every user request. If there are any slow data requests, the whole route will be blocked from rendering.

To improve the initial load time and user experience, you can use streaming to break up the page's HTML into smaller chunks and progressively send those chunks from the server to the client.

There are two ways you can implement streaming in your application:

1. With the `loading.js` file
2. With React's `<Suspense>` component

### With `loading.js`

You can create a `loading.js` file in the same folder as your page to stream the entire page while the data is being fetched. For example, to stream `app/blog/page.js`, add the file inside the `app/blog` folder.

`app/blog/loading.js`

```js
export default function Loading() {
  // Define the Loading UI here
  return <div>Loading...</div>
}
```

On navigation, the user will immediately see the layout and a loading state while the page is being rendered. The new content will then be automatically swapped in once rendering is complete.

Behind-the-scenes, `loading.js` will be nested inside `layout.js`, and will automatically wrap the `page.js` file and any children below in a `<Suspense>` boundary.

This approach works well for route segments (layouts and pages), but for more granular streaming, you can use `<Suspense>`.

### With `<Suspense>`

`<Suspense>` allows you to be more granular about what parts of the page to stream. For example, you can immediately show any page content that falls outside of the `<Suspense>` boundary, and stream in the list of blog posts inside the boundary.

`app/blog/page.tsx`

```tsx
import { Suspense } from 'react'
import BlogList from '@/components/BlogList'
import BlogListSkeleton from '@/components/BlogListSkeleton'

export default function BlogPage() {
  return (
    <div>
      {/* This content will be sent to the client immediately */}
      <header>
        <h1>Welcome to the Blog</h1>
        <p>Read the latest posts below.</p>
      </header>
      <main>
        {/* Any content wrapped in a <Suspense> boundary will be streamed */}
        <Suspense fallback={<BlogListSkeleton />}>
          <BlogList />
        </Suspense>
      </main>
    </div>
  )
}
```

### Creating meaningful loading states

An instant loading state is fallback UI that is shown immediately to the user after navigation. For the best user experience, we recommend designing loading states that are meaningful and help users understand the app is responding. For example, you can use skeletons and spinners, or a small but meaningful part of future screens such as a cover photo, title, etc.

In development, you can preview and inspect the loading state of your components using the React Devtools.

## Data Fetching and Caching

This guide will walk you through the basics of data fetching and caching in Next.js, providing practical examples and best practices.

Here's a minimal example of data fetching in Next.js:

`app/page.tsx`

```tsx
export default async function Page() {
  const data = await fetch('https://api.vercel.app/blog')
  const posts = await data.json()
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

This example demonstrates a basic server-side data fetch using the fetch API in an asynchronous React Server Component.

### Examples

#### Fetching data on the server with the `fetch` API

This component will fetch and display a list of blog posts. The response from `fetch` is not cached by default.

`app/page.tsx`

```tsx
export default async function Page() {
  const data = await fetch('https://api.vercel.app/blog')
  const posts = await data.json()
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

If you are not using any Dynamic APIs anywhere else in this route, it will be prerendered during next build to a static page. The data can then be updated using Incremental Static Regeneration.

To prevent the page from prerendering, you can add the following to your file:

```tsx
export const dynamic = 'force-dynamic'
```

However, you will commonly use functions like `cookies`, `headers`, or reading the incoming `searchParams` from the page props, which will automatically make the page render dynamically. In this case, you do not need to explicitly use `force-dynamic`.

#### Fetching data on the server with an ORM or database

This component will fetch and display a list of blog posts. The response from the database is not cached by default but could be with additional configuration.

`app/page.tsx`

```tsx
import { db, posts } from '@/lib/db'

export default async function Page() {
  const allPosts = await db.select().from(posts)
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

If you are not using any Dynamic APIs anywhere else in this route, it will be prerendered during `next build` to a static page. The data can then be updated using Incremental Static Regeneration.

To prevent the page from prerendering, you can add the following to your file:

```tsx
export const dynamic = 'force-dynamic'
```

However, you will commonly use functions like `cookies`, `headers`, or reading the incoming `searchParams` from the page props, which will automatically make the page render dynamically. In this case, you do not need to explicitly use `force-dynamic`.

#### Fetching data on the client

We recommend first attempting to fetch data on the server-side.

However, there are still cases where client-side data fetching makes sense. In these scenarios, you can manually call `fetch` in a `useEffect` (not recommended), or lean on popular React libraries in the community (such as SWR or React Query) for client fetching.

`app/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'

export function Posts() {
  const [posts, setPosts] = useState(null)

  useEffect(() => {
    async function fetchPosts() {
      const res = await fetch('https://api.vercel.app/blog')
      const data = await res.json()
      setPosts(data)
    }
    fetchPosts()
  }, [])

  if (!posts) return <div>Loading...</div>

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

#### Caching data with an ORM or Database

You can use the `unstable_cache` API to cache the response to allow pages to be prerendered when running `next build`.

`app/page.tsx`

```tsx
import { unstable_cache } from 'next/cache'
import { db, posts } from '@/lib/db'

const getPosts = unstable_cache(
  async () => {
    return await db.select().from(posts)
  },
  ['posts'],
  { revalidate: 3600, tags: ['posts'] }
)

export default async function Page() {
  const allPosts = await getPosts()

  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

This example caches the result of the database query for 1 hour (3600 seconds). It also adds the cache tag `posts` which can then be invalidated with Incremental Static Regeneration.

#### Reusing data across multiple functions

Next.js uses APIs like `generateMetadata` and `generateStaticParams` where you will need to use the same data fetched in the `page`.

If you are using `fetch`, requests can be memoized by adding `cache: 'force-cache'`. This means you can safely call the same URL with the same options, and only one request will be made.

> **Good to know**:
> In previous versions of Next.js, using fetch would have a default cache value of force-cache. This changed in version 15, to a default of cache: no-store.

`app/blog/[id]/page.tsx`

```tsx
import { notFound } from 'next/navigation'

interface Post {
  id: string
  title: string
  content: string
}

async function getPost(id: string) {
  const res = await fetch(`https://api.vercel.app/blog/${id}`, {
    cache: 'force-cache',
  })
  const post: Post = await res.json()
  if (!post) notFound()
  return post
}

export async function generateStaticParams() {
  const posts = await fetch('https://api.vercel.app/blog', {
    cache: 'force-cache',
  }).then((res) => res.json())

  return posts.map((post: Post) => ({
    id: String(post.id),
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)

  return {
    title: post.title,
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

If you are *not* using `fetch`, and instead using an ORM or database directly, you can wrap your data fetch with the React `cache` function. This will de-duplicate and only make one query.

```tsx
import { cache } from 'react'
import { db, posts, eq } from '@/lib/db' // Example with Drizzle ORM
import { notFound } from 'next/navigation'

export const getPost = cache(async (id) => {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, parseInt(id)),
  })

  if (!post) notFound()
  return post
})
```

### Patterns

#### Parallel and sequential data fetching

When fetching data inside components, you need to be aware of two data fetching patterns: Parallel and Sequential.

- **Sequential**: requests in a component tree are dependent on each other. This can lead to longer loading times.
- **Parallel**: requests in a route are eagerly initiated and will load data at the same time. This reduces the total time it takes to load data.

##### Sequential data fetching

If you have nested components, and each component fetches its own data, then data fetching will happen sequentially if those data requests are not memoized.

There may be cases where you want this pattern because one fetch depends on the result of the other. For example, the `Playlists` component will only start fetching data once the `Artist` component has finished fetching data because `Playlists` depends on the `artistID` prop:

`app/artist/[username]/page.tsx`

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  // Get artist information
  const artist = await getArtist(username)

  return (
    <>
      <h1>{artist.name}</h1>
      {/* Show fallback UI while the Playlists component is loading */}
      <Suspense fallback={<div>Loading...</div>}>
        {/* Pass the artist ID to the Playlists component */}
        <Playlists artistID={artist.id} />
      </Suspense>
    </>
  )
}

async function Playlists({ artistID }: { artistID: string }) {
  // Use the artist ID to fetch playlists
  const playlists = await getArtistPlaylists(artistID)

  return (
    <ul>
      {playlists.map((playlist) => (
        <li key={playlist.id}>{playlist.name}</li>
      ))}
    </ul>
  )
}
```

You can use `loading.js` (for route segments) or React `<Suspense>` (for nested components) to show an instant loading state while React streams in the result.

This will prevent the whole route from being blocked by data requests, and the user will be able to interact with the parts of the page that are ready.

##### Parallel Data Fetching

By default, layout and page segments are rendered in parallel. This means requests will be initiated in parallel.

However, due to the nature of `async`/`await`, an awaited request inside the same segment or component will block any requests below it.

To fetch data in parallel, you can eagerly initiate requests by defining them outside the components that use the data. This saves time by initiating both requests in parallel, however, the user won't see the rendered result until both promises are resolved.

In the example below, the `getArtist` and `getAlbums` functions are defined outside the `Page` component and initiated inside the component using `Promise.all`:

`app/artist/[username]/page.tsx`

```tsx
import Albums from './albums'

async function getArtist(username: string) {
  const res = await fetch(`https://api.example.com/artist/${username}`)
  return res.json()
}

async function getAlbums(username: string) {
  const res = await fetch(`https://api.example.com/artist/${username}/albums`)
  return res.json()
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const artistData = getArtist(username)
  const albumsData = getAlbums(username)

  // Initiate both requests in parallel
  const [artist, albums] = await Promise.all([artistData, albumsData])

  return (
    <>
      <h1>{artist.name}</h1>
      <Albums list={albums} />
    </>
  )
}
```

In addition, you can add a Suspense Boundary to break up the rendering work and show part of the result as soon as possible.

### Preloading Data

Another way to prevent waterfalls is to use the preload pattern by creating an utility function that you eagerly call above blocking requests. For example, `checkIsAvailable()` blocks `<Item/>` from rendering, so you can call `preload()` before it to eagerly initiate `<Item/>` data dependencies. By the time `<Item/>` is rendered, its data has already been fetched.

Note that `preload` function doesn't block `checkIsAvailable()` from running.

`components/item.tsx`

```tsx
import { getItem } from '@/utils/get-item'

export const preload = (id: string) => {
  // void evaluates the given expression and returns undefined
  // https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/void
  void getItem(id)
}
export default async function Item({ id }: { id: string }) {
  const result = await getItem(id)
  // ...
}
```

`app/item/[id]/page.tsx`

```tsx
import Item, { preload, checkIsAvailable } from '@/components/Item'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // starting loading item data
  preload(id)
  // perform another asynchronous task
  const isAvailable = await checkIsAvailable()

  return isAvailable ? <Item id={id} /> : null
}
```

> **Good to know**: The "preload" function can also have any name as it's a pattern, not an API.

#### Using React `cache` and `server-only` with the Preload Pattern

You can combine the `cache` function, the `preload` pattern, and the `server-only` package to create a data fetching utility that can be used throughout your app.

`utils/get-item.ts`

```tsx
import { cache } from 'react'
import 'server-only'

export const preload = (id: string) => {
  void getItem(id)
}

export const getItem = cache(async (id: string) => {
  // ...
})
```

With this approach, you can eagerly fetch data, cache responses, and guarantee that this data fetching only happens on the server.

The `utils/get-item` exports can be used by Layouts, Pages, or other components to give them control over when an item's data is fetched.

> **Good to know**:
> - We recommend using the `server-only` package to make sure server data fetching functions are never used on the client.

#### Preventing sensitive data from being exposed to the client

We recommend using React's taint APIs, `taintObjectReference` and `taintUniqueValue`, to prevent whole object instances or sensitive values from being passed to the client.

To enable tainting in your application, set the Next.js Config `experimental.taint` option to `true`:

`mext.config.js`

```js
module.exports = {
  experimental: {
    taint: true,
  },
}
```

Then pass the object or value you want to taint to the `experimental_taintObjectReference` or `experimental_taintUniqueValue` functions:

`app/utils.ts`

```ts
import { queryDataFromDB } from './api'
import {
  experimental_taintObjectReference,
  experimental_taintUniqueValue,
} from 'react'

export async function getUserData() {
  const data = await queryDataFromDB()
  experimental_taintObjectReference(
    'Do not pass the whole user object to the client',
    data
  )
  experimental_taintUniqueValue(
    "Do not pass the user's address to the client",
    data,
    data.address
  )
  return data
}
```

`app/page.tsx`

```tsx
import { getUserData } from './data'

export async function Page() {
  const userData = getUserData()
  return (
    <ClientComponent
      user={userData} // this will cause an error because of taintObjectReference
      address={userData.address} // this will cause an error because of taintUniqueValue
    />
  )
}
```

## Server Actions and Mutations

Server Actions are **asynchronous functions** that are executed on the server. They can be called in Server and Client Components to handle form submissions and data mutations in Next.js applications.

### Convention

A Server Action can be defined with the React "use server" directive. You can place the directive at the top of an async function to mark the function as a Server Action, or at the top of a separate file to mark all exports of that file as Server Actions.

### Server Components

Server Components can use the inline function level or module level `"use server"` directive. To inline a Server Action, add `"use server"` to the top of the function body:

`app/page.tsx`

```tsx
export default function Page() {
  // Server Action
  async function create() {
    'use server'
    // Mutate data
  }
 
  return '...'
}
```

### Client Components

To call a Server Action in a Client Component, create a new file and add the `"use server"` directive at the top of it. All exported functions within the file will be marked as Server Actions that can be reused in both Client and Server Components:

`app/actions.ts`

```ts
'use server'

export async function create() {}
```

`app/ui/button.tsx`

```tsx
'use client'

import { create } from '@/app/actions'

export function Button() {
  return <button onClick={() => create()}>Create</button>
}
```

### Passing actions as props

You can also pass a Server Action to a Client Component as a prop:

```tsx
<ClientComponent updateItemAction={updateItem} />
```

`app/client-component.tsx`

```tsx
'use client'

export default function ClientComponent({
  updateItemAction,
}: {
  updateItemAction: (formData: FormData) => void
}) {
  return <form action={updateItemAction}>{/* ... */}</form>
}
```

Usually, the Next.js TypeScript plugin would flag `updateItemAction` in `client-component.tsx` since it is a function which generally can't be serialized across client-server boundaries. However, props named `action` or ending with `Action` are assumed to receive Server Actions. This is only a heuristic since the TypeScript plugin doesn't actually know if it receives a Server Action or an ordinary function. Runtime type-checking will still ensure you don't accidentally pass a function to a Client Component.

### Behavior
- Server actions can be invoked using the `action` attribute in a <form> element:
  - Server Components support progressive enhancement by default, meaning the form will be submitted even if JavaScript hasn't loaded yet or is disabled.
  - In Client Components, forms invoking Server Actions will queue submissions if JavaScript isn't loaded yet, prioritizing client hydration.
  - After hydration, the browser does not refresh on form submission.
- Server Actions are not limited to `<form>` and can be invoked from event handlers, `useEffect`, third-party libraries, and other form elements like `<button>`.
- Server Actions integrate with the Next.js caching and revalidation architecture. When an action is invoked, Next.js can return both the updated UI and new data in a single server roundtrip.
- Behind the scenes, actions use the `POST` method, and only this HTTP method can invoke them.
- The arguments and return value of Server Actions must be serializable by React. See the React docs for a list of serializable arguments and values.
- Server Actions are functions. This means they can be reused anywhere in your application.
- Server Actions inherit the runtime from the page or layout they are used on.
- Server Actions inherit the Route Segment Config from the page or layout they are used on, including fields like `maxDuration`.

### Examples

#### Forms

React extends the HTML `<form>` element to allow Server Actions to be invoked with the `action` prop.

When invoked in a form, the action automatically receives the `FormData` object. You don't need to use React `useState` to manage fields, instead, you can extract the data using the native `FormData` methods:

`app/invoices/page.tsx`

```tsx
export default function Page() {
  async function createInvoice(formData: FormData) {
    'use server'

    const rawFormData = {
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    }

    // mutate data
    // revalidate cache
  }

  return <form action={createInvoice}>...</form>
}
```

> **Good to know**: 
> - Example: Form with Loading & Error States
> - When working with forms that have many fields, you may want to consider using the `entries()` method with JavaScript's `Object.fromEntries()`. For example: `const rawFormData = Object.fromEntries(formData`). One thing to note is that the formData will include additional $ACTION_ properties.

#### Passing additional arguments

You can pass additional arguments to a Server Action using the JavaScript `bind` method.

`app/client-component.tsx`

```tsx
'use client'

import { updateUser } from './actions'

export function UserProfile({ userId }: { userId: string }) {
  const updateUserWithId = updateUser.bind(null, userId)

  return (
    <form action={updateUserWithId}>
      <input type="text" name="name" />
      <button type="submit">Update User Name</button>
    </form>
  )
}
```

The Server Action will receive the `userId` argument, in addition to the form data:

`app/actions.ts`

```ts
'use server'

export async function updateUser(userId: string, formData: FormData) {}
```

> **Good to know**:
> - An alternative is to pass arguments as hidden input fields in the form (e.g. `<input type="hidden" name="userId" value={userId} />`). However, the value will be part of the rendered HTML and will not be encoded.
> - `.bind` works in both Server and Client Components. It also supports progressive enhancement.

### Nested form elements

You can also invoke a Server Action in elements nested inside `<form>` such as `<button>`, `<input type="submit">`, and `<input type="image">`. These elements accept the `formAction` prop or event handlers.

This is useful in cases where you want to call multiple server actions within a form. For example, you can create a specific `<button>` element for saving a post draft in addition to publishing it. See the React `<form>` docs for more information.

### Programmatic form submission

You can trigger a form submission programmatically using the `requestSubmit()` method. For example, when the user submits a form using the ⌘ + Enter keyboard shortcut, you can listen for the `onKeyDown` event:

`app/entry.tsx`

```tsx
'use client'

export function Entry() {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === 'Enter' || e.key === 'NumpadEnter')
    ) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <div>
      <textarea name="entry" rows={20} required onKeyDown={handleKeyDown} />
    </div>
  )
}
```

This will trigger the submission of the nearest `<form>` ancestor, which will invoke the Server Action.

### Server-side form validation

You can use the HTML attributes like `required` and `type="email"` for basic client-side form validation.

For more advanced server-side validation, you can use a library like zod to validate the form fields before mutating the data:

`app/actions.ts`

```ts
'use server'

import { z } from 'zod'

const schema = z.object({
  email: z.string({
    invalid_type_error: 'Invalid Email',
  }),
})

export default async function createUser(formData: FormData) {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
  })

  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Mutate data
}
```

Once the fields have been validated on the server, you can return a serializable object in your action and use the React `useActionState` hook to show a message to the user.

- By passing the action to `useActionState`, the action's function signature changes to receive a new `prevState` or `initialState` parameter as its first argument.
- `useActionState` is a React hook and therefore must be used in a Client Component.

`app/actions.ts`

```ts
'use server'

import { redirect } from 'next/navigation'

export async function createUser(prevState: any, formData: FormData) {
  const res = await fetch('https://...')
  const json = await res.json()

  if (!res.ok) {
    return { message: 'Please enter a valid email' }
  }

  redirect('/dashboard')
}
```

Then, you can pass your action to the `useActionState` hook and use the returned `state` to display an error message.

`app/ui/signup.tsx`

```tsx
'use client'

import { useActionState } from 'react'
import { createUser } from '@/app/actions'

const initialState = {
  message: '',
}

export function Signup() {
  const [state, formAction, pending] = useActionState(createUser, initialState)

  return (
    <form action={formAction}>
      <label htmlFor="email">Email</label>
      <input type="text" id="email" name="email" required />
      {/* ... */}
      <p aria-live="polite">{state?.message}</p>
      <button disabled={pending}>Sign up</button>
    </form>
  )
}
```

### Pending states

The `useActionState` hook exposes a `pending` boolean that can be used to show a loading indicator while the action is being executed.

Alternatively, you can use the `useFormStatus` hook to show a loading indicator while the action is being executed. When using this hook, you'll need to create a separate component to render the loading indicator. For example, to disable the button when the action is pending:

`app/ui/button.tsx`

```tsx
'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button disabled={pending} type="submit">
      Sign Up
    </button>
  )
}
```

You can then nest the `SubmitButton` component inside the form:

`app/ui/signup.tsx`

```tsx
import { SubmitButton } from './button'
import { createUser } from '@/app/actions'

export function Signup() {
  return (
    <form action={createUser}>
      {/* Other form elements */}
      <SubmitButton />
    </form>
  )
}
```

> **Good to know**: In React 19, useFormStatus includes additional keys on the returned object, like data, method, and action. If you are not using React 19, only the pending key is available.

### Optimistic updates

You can use the React `useOptimistic` hook to optimistically update the UI before the Server Action finishes executing, rather than waiting for the response:

`app/page.tsx`

```tsx
'use client'

import { useOptimistic } from 'react'
import { send } from './actions'

type Message = {
  message: string
}

export function Thread({ messages }: { messages: Message[] }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic<
    Message[],
    string
  >(messages, (state, newMessage) => [...state, { message: newMessage }])

  const formAction = async (formData: FormData) => {
    const message = formData.get('message') as string
    addOptimisticMessage(message)
    await send(message)
  }

  return (
    <div>
      {optimisticMessages.map((m, i) => (
        <div key={i}>{m.message}</div>
      ))}
      <form action={formAction}>
        <input type="text" name="message" />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
```

### Event handlers

While it's common to use Server Actions within `<form>` elements, they can also be invoked with event handlers such as `onClick`. For example, to increment a like count:

`app/like-button.tsx`

```tsx
'use client'

import { incrementLike } from './actions'
import { useState } from 'react'

export default function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes)

  return (
    <>
      <p>Total Likes: {likes}</p>
      <button
        onClick={async () => {
          const updatedLikes = await incrementLike()
          setLikes(updatedLikes)
        }}
      >
        Like
      </button>
    </>
  )
}
```

You can also add event handlers to form elements, for example, to save a form field `onChange`:

`app/ui/edit-post.tsx`

```tsx
'use client'

import { publishPost, saveDraft } from './actions'

export default function EditPost() {
  return (
    <form action={publishPost}>
      <textarea
        name="content"
        onChange={async (e) => {
          await saveDraft(e.target.value)
        }}
      />
      <button type="submit">Publish</button>
    </form>
  )
}
```

For cases like this, where multiple events might be fired in quick succession, we recommend debouncing to prevent unnecessary Server Action invocations.

### `useEffect`

You can use the React `useEffect` hook to invoke a Server Action when the component mounts or a dependency changes. This is useful for mutations that depend on global events or need to be triggered automatically. For example, `onKeyDown` for app shortcuts, an intersection observer hook for infinite scrolling, or when the component mounts to update a view count:

`app/view-count.tsx`

```tsx
'use client'

import { incrementViews } from './actions'
import { useState, useEffect } from 'react'

export default function ViewCount({ initialViews }: { initialViews: number }) {
  const [views, setViews] = useState(initialViews)

  useEffect(() => {
    const updateViews = async () => {
      const updatedViews = await incrementViews()
      setViews(updatedViews)
    }

    updateViews()
  }, [])

  return <p>Total Views: {views}</p>
}
```

Remember to consider the behavior and caveats of `useEffect`.

### Error Handling

When an error is thrown, it'll be caught by the nearest `error.js` or `<Suspense>` boundary on the client. See Error Handling for more information.

> **Good to know**:
> - Aside from throwing the error, you can also return an object to be handled by `useActionState`.

### Revalidating data

You can revalidate the Next.js Cache inside your Server Actions with the `revalidatePath` API:

`app/actions.ts`

```ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost() {
  try {
    // ...
  } catch (error) {
    // ...
  }
 
  revalidatePath('/posts')
}
```

Or invalidate a specific data fetch with a cache tag using `revalidateTag`:

`app/actions.ts`

```ts
'use server'

import { revalidateTag } from 'next/cache'

export async function createPost() {
  try {
    // ...
  } catch (error) {
    // ...
  }

  revalidateTag('posts')
}
```

### Redirecting

If you would like to redirect the user to a different route after the completion of a Server Action, you can use `redirect` API. `redirect` needs to be called outside of the `try/catch` block:

`app/actions.ts`

```ts
'use server'

import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'

export async function createPost(id: string) {
  try {
    // ...
  } catch (error) {
    // ...
  }

  revalidateTag('posts') // Update cached posts
  redirect(`/post/${id}`) // Navigate to the new post page
}
```

### Cookies

You can `get`, `set`, and `delete` cookies inside a Server Action using the cookies API:

`app/actions.ts`

```ts
'use server'

import { cookies } from 'next/headers'

export async function exampleAction() {
  const cookieStore = await cookies()

  // Get cookie
  cookieStore.get('name')?.value

  // Set cookie
  cookieStore.set('name', 'Delba')

  // Delete cookie
  cookieStore.delete('name')
}
```

### Security

By default, when a Server Action is created and exported, it creates a public HTTP endpoint and should be treated with the same security assumptions and authorization checks. This means, even if a Server Action or utility function is not imported elsewhere in your code, it’s still publicly accessible.

To improve security, Next.js has the following built-in features:

- **Secure action IDs**: Next.js creates encrypted, non-deterministic IDs to allow the client to reference and call the Server Action. These IDs are periodically recalculated between builds for enhanced security.
- **Dead code elimination**: Unused Server Actions (referenced by their IDs) are removed from client bundle to avoid public access by third-party.

> **Good to know**:
> The IDs are created during compilation and are cached for a maximum of 14 days. They will be regenerated when a new build is initiated or when the build cache is invalidated. This security improvement reduces the risk in cases where an authentication layer is missing. However, you should still treat Server Actions like public HTTP endpoints.

`app/actions.js`

```js
// app/actions.js
'use server'

// This action **is** used in our application, so Next.js
// will create a secure ID to allow the client to reference
// and call the Server Action.
export async function updateUserAction(formData) {}

// This action **is not** used in our application, so Next.js
// will automatically remove this code during `next build`
// and will not create a public endpoint.
export async function deleteUserAction(formData) {}
```

### Authentication and authorization

You should ensure that the user is authorized to perform the action. For example:

`app/actions.ts`

```ts
'use server'

import { auth } from './lib'

export function addItem() {
  const { user } = auth()
  if (!user) {
    throw new Error('You must be signed in to perform this action')
  }

  // ...
}
```

### Closures and encryption

Defining a Server Action inside a component creates a closure where the action has access to the outer function's scope. For example, the `publish` action has access to the `publishVersion` variable:

`app/page.tsx`

```tsx
export default async function Page() {
  const publishVersion = await getLatestVersion();

  async function publish() {
    "use server";
    if (publishVersion !== await getLatestVersion()) {
      throw new Error('The version has changed since pressing publish');
    }
    ...
  }

  return (
    <form>
      <button formAction={publish}>Publish</button>
    </form>
  );
}
```

Closures are useful when you need to capture a snapshot of data (e.g. `publishVersion`) at the time of rendering so that it can be used later when the action is invoked.

However, for this to happen, the captured variables are sent to the client and back to the server when the action is invoked. To prevent sensitive data from being exposed to the client, Next.js automatically encrypts the closed-over variables. A new private key is generated for each action every time a Next.js application is built. This means actions can only be invoked for a specific build.

> **Good to know**: We don't recommend relying on encryption alone to prevent sensitive values from being exposed on the client. Instead, you should use the React taint APIs to proactively prevent specific data from being sent to the client.