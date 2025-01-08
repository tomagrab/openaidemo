# Assistants API tools

Explore tools for file search, code, and function calling.

Assistants created using the Assistants API can be equipped with tools that allow them to perform more complex tasks or interact with your application. We provide built-in tools for assistants, but you can also define your own tools to extend their capabilities using Function Calling.

The Assistants API currently supports the following tools:

[

File Search

Built-in RAG tool to process and search through files

](/docs/assistants/tools/file-search)[

Code Interpreter

Write and run python code, process files and diverse data

](/docs/assistants/tools/code-interpreter)[

Function Calling

Use your own custom functions to interact with your application

](/docs/assistants/tools/function-calling)

## Assistants File Search

File Search augments the Assistant with knowledge from outside its model, such as proprietary product information or documents provided by your users. OpenAI automatically parses and chunks your documents, creates and stores the embeddings, and use both vector and keyword search to retrieve relevant content to answer user queries.

## Quickstart

In this example, we’ll create an assistant that can help answer questions about companies’ financial statements.

### Step 1: Create a new Assistant with File Search Enabled

Create a new assistant with `file_search` enabled in the `tools` parameter of the Assistant.

```python
from openai import OpenAI

client = OpenAI()

assistant = client.beta.assistants.create(
name="Financial Analyst Assistant",
instructions="You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
model="gpt-4o",
tools=[{"type": "file_search"}],
)
```

```javascript
import OpenAI from 'openai';
const openai = new OpenAI();

async function main() {
  const assistant = await openai.beta.assistants.create({
    name: 'Financial Analyst Assistant',
    instructions:
      'You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.',
    model: 'gpt-4o',
    tools: [{ type: 'file_search' }],
  });
}

main();
```

```bash
curl https://api.openai.com/v1/assistants \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "OpenAI-Beta: assistants=v2" \
-d '{
  "name": "Financial Analyst Assistant",
  "instructions": "You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
  "tools": [{"type": "file_search"}],
  "model": "gpt-4o"
}'
```

Once the `file_search` tool is enabled, the model decides when to retrieve content based on user messages.

### Step 2: Upload files and add them to a Vector Store

To access your files, the `file_search` tool uses the Vector Store object. Upload your files and create a Vector Store to contain them. Once the Vector Store is created, you should poll its status until all files are out of the `in_progress` state to ensure that all content has finished processing. The SDK provides helpers to uploading and polling in one shot.

```python
# Create a vector store caled "Financial Statements"
vector_store = client.beta.vector_stores.create(name="Financial Statements")

# Ready the files for upload to OpenAI
file_paths = ["edgar/goog-10k.pdf", "edgar/brka-10k.txt"]
file_streams = [open(path, "rb") for path in file_paths]

# Use the upload and poll SDK helper to upload the files, add them to the vector store,
# and poll the status of the file batch for completion.
file_batch = client.beta.vector_stores.file_batches.upload_and_poll(
vector_store_id=vector_store.id, files=file_streams
)

# You can print the status and the file counts of the batch to see the result of this operation.
print(file_batch.status)
print(file_batch.file_counts)
```

```javascript
const fileStreams = ['edgar/goog-10k.pdf', 'edgar/brka-10k.txt'].map(path =>
  fs.createReadStream(path),
);

// Create a vector store including our two files.
let vectorStore = await openai.beta.vectorStores.create({
  name: 'Financial Statement',
});

await openai.beta.vectorStores.fileBatches.uploadAndPoll(
  vectorStore.id,
  fileStreams,
);
```

### Step 3: Update the assistant to use the new Vector Store

To make the files accessible to your assistant, update the assistant’s `tool_resources` with the new `vector_store` id.

```python
assistant = client.beta.assistants.update(
assistant_id=assistant.id,
tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
)
```

```javascript
await openai.beta.assistants.update(assistant.id, {
  tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
});
```

### Step 4: Create a thread

You can also attach files as Message attachments on your thread. Doing so will create another `vector_store` associated with the thread, or, if there is already a vector store attached to this thread, attach the new files to the existing thread vector store. When you create a Run on this thread, the file search tool will query both the `vector_store` from your assistant and the `vector_store` on the thread.

In this example, the user attached a copy of Apple’s latest 10-K filing.

```python
# Upload the user provided file to OpenAI
message_file = client.files.create(
file=open("edgar/aapl-10k.pdf", "rb"), purpose="assistants"
)

# Create a thread and attach the file to the message
thread = client.beta.threads.create(
messages=[
  {
    "role": "user",
    "content": "How many shares of AAPL were outstanding at the end of of October 2023?",
    # Attach the new file to the message.
    "attachments": [
      { "file_id": message_file.id, "tools": [{"type": "file_search"}] }
    ],
  }
]
)

# The thread now has a vector store with that file in its tool resources.
print(thread.tool_resources.file_search)
```

```javascript
// A user wants to attach a file to a specific message, let's upload it.
const aapl10k = await openai.files.create({
  file: fs.createReadStream('edgar/aapl-10k.pdf'),
  purpose: 'assistants',
});

const thread = await openai.beta.threads.create({
  messages: [
    {
      role: 'user',
      content:
        'How many shares of AAPL were outstanding at the end of of October 2023?',
      // Attach the new file to the message.
      attachments: [{ file_id: aapl10k.id, tools: [{ type: 'file_search' }] }],
    },
  ],
});

// The thread now has a vector store in its tool resources.
console.log(thread.tool_resources?.file_search);
```

Vector stores created using message attachments have a default expiration policy of 7 days after they were last active (defined as the last time the vector store was part of a run). This default exists to help you manage your vector storage costs. You can override these expiration policies at any time. Learn more [here](#managing-costs-with-expiration-policies).

### Step 5: Create a run and check the output

Now, create a Run and observe that the model uses the File Search tool to provide a response to the user’s question.

With streamingWithout streaming

```python
from typing_extensions import override
from openai import AssistantEventHandler, OpenAI

client = OpenAI()

class EventHandler(AssistantEventHandler):
  @override
  def on_text_created(self, text) -> None:
      print(f"\nassistant > ", end="", flush=True)

  @override
  def on_tool_call_created(self, tool_call):
      print(f"\nassistant > {tool_call.type}\n", flush=True)

  @override
  def on_message_done(self, message) -> None:
      # print a citation to the file searched
      message_content = message.content[0].text
      annotations = message_content.annotations
      citations = []
      for index, annotation in enumerate(annotations):
          message_content.value = message_content.value.replace(
              annotation.text, f"[{index}]"
          )
          if file_citation := getattr(annotation, "file_citation", None):
              cited_file = client.files.retrieve(file_citation.file_id)
              citations.append(f"[{index}] {cited_file.filename}")

      print(message_content.value)
      print("\n".join(citations))

# Then, we use the stream SDK helper
# with the EventHandler class to create the Run
# and stream the response.

with client.beta.threads.runs.stream(
  thread_id=thread.id,
  assistant_id=assistant.id,
  instructions="Please address the user as Jane Doe. The user has a premium account.",
  event_handler=EventHandler(),
) as stream:
  stream.until_done()
```

```javascript
const stream = openai.beta.threads.runs
.stream(thread.id, {
  assistant_id: assistant.id,
})
.on("textCreated", () => console.log("assistant >"))
.on("toolCallCreated", (event) => console.log("assistant " + event.type))
.on("messageDone", async (event) => {
  if (event.content[0].type === "text") {
    const { text } = event.content[0];
    const { annotations } = text;
    const citations: string[] = [];

    let index = 0;
    for (let annotation of annotations) {
      text.value = text.value.replace(annotation.text, "[" + index + "]");
      const { file_citation } = annotation;
      if (file_citation) {
        const citedFile = await openai.files.retrieve(file_citation.file_id);
        citations.push("[" + index + "]" + citedFile.filename);
      }
      index++;
    }

    console.log(text.value);
    console.log(citations.join("\n"));
  }
```

Your new assistant will query both attached vector stores (one containing `goog-10k.pdf` and `brka-10k.txt`, and the other containing `aapl-10k.pdf`) and return this result from `aapl-10k.pdf`.

To retrieve the contents of the file search results that were used by the model, use the `include` query parameter and provide a value of `step_details.tool_calls[*].file_search.results[*].content` in the format `?include[]=step_details.tool_calls[*].file_search.results[*].content`.

---

## How it works

The `file_search` tool implements several retrieval best practices out of the box to help you extract the right data from your files and augment the model’s responses. The `file_search` tool:

- Rewrites user queries to optimize them for search.
- Breaks down complex user queries into multiple searches it can run in parallel.
- Runs both keyword and semantic searches across both assistant and thread vector stores.
- Reranks search results to pick the most relevant ones before generating the final response.

By default, the `file_search` tool uses the following settings but these can be [configured](#customizing-file-search-settings) to suit your needs:

- Chunk size: 800 tokens
- Chunk overlap: 400 tokens
- Embedding model: `text-embedding-3-large` at 256 dimensions
- Maximum number of chunks added to context: 20 (could be fewer)
- Ranker: `auto` (OpenAI will choose which ranker to use)
- Score threshold: 0 minimum ranking score

**Known Limitations**

We have a few known limitations we're working on adding support for in the coming months:

1.  Support for deterministic pre-search filtering using custom metadata.
2.  Support for parsing images within documents (including images of charts, graphs, tables etc.)
3.  Support for retrievals over structured file formats (like `csv` or `jsonl`).
4.  Better support for summarization — the tool today is optimized for search queries.

## Vector stores

Vector Store objects give the File Search tool the ability to search your files. Adding a file to a `vector_store` automatically parses, chunks, embeds and stores the file in a vector database that's capable of both keyword and semantic search. Each `vector_store` can hold up to 10,000 files. Vector stores can be attached to both Assistants and Threads. Today, you can attach at most one vector store to an assistant and at most one vector store to a thread.

#### Creating vector stores and adding files

You can create a vector store and add files to it in a single API call:

```python
vector_store = client.beta.vector_stores.create(
name="Product Documentation",
file_ids=['file_1', 'file_2', 'file_3', 'file_4', 'file_5']
)
```

```javascript
const vectorStore = await openai.beta.vectorStores.create({
  name: 'Product Documentation',
  file_ids: ['file_1', 'file_2', 'file_3', 'file_4', 'file_5'],
});
```

Adding files to vector stores is an async operation. To ensure the operation is complete, we recommend that you use the 'create and poll' helpers in our official SDKs. If you're not using the SDKs, you can retrieve the `vector_store` object and monitor it's [`file_counts`](/docs/api-reference/vector-stores/object#vector-stores/object-file_counts) property to see the result of the file ingestion operation.

Files can also be added to a vector store after it's created by [creating vector store files](/docs/api-reference/vector-stores/createFile).

```python
file = client.beta.vector_stores.files.create_and_poll(
vector_store_id="vs_abc123",
file_id="file-abc123"
)
```

```javascript
const file = await openai.beta.vectorStores.files.createAndPoll('vs_abc123', {
  file_id: 'file-abc123',
});
```

Alternatively, you can add several files to a vector store by [creating batches](/docs/api-reference/vector-stores/createBatch) of up to 500 files.

```python
batch = client.beta.vector_stores.file_batches.create_and_poll(
vector_store_id="vs_abc123",
file_ids=['file_1', 'file_2', 'file_3', 'file_4', 'file_5']
)
```

```javascript
const batch = await openai.beta.vectorStores.fileBatches.createAndPoll(
  'vs_abc123',
  { file_ids: ['file_1', 'file_2', 'file_3', 'file_4', 'file_5'] },
);
```

Similarly, these files can be removed from a vector store by either:

- Deleting the [vector store file object](/docs/api-reference/vector-stores/deleteFile) or,
- By deleting the underlying [file object](/docs/api-reference/files/delete) (which removes the file it from all `vector_store` and `code_interpreter` configurations across all assistants and threads in your organization)

The maximum file size is 512 MB. Each file should contain no more than 5,000,000 tokens per file (computed automatically when you attach a file).

File Search supports a variety of file formats including `.pdf`, `.md`, and `.docx`. More details on the file extensions (and their corresponding MIME-types) supported can be found in the [Supported files](#supported-files) section below.

#### Attaching vector stores

You can attach vector stores to your Assistant or Thread using the `tool_resources` parameter.

```python
assistant = client.beta.assistants.create(
instructions="You are a helpful product support assistant and you answer questions based on the files provided to you.",
model="gpt-4o",
tools=[{"type": "file_search"}],
tool_resources={
  "file_search": {
    "vector_store_ids": ["vs_1"]
  }
}
)

thread = client.beta.threads.create(
messages=[ { "role": "user", "content": "How do I cancel my subscription?"} ],
tool_resources={
  "file_search": {
    "vector_store_ids": ["vs_2"]
  }
}
)
```

```javascript
const assistant = await openai.beta.assistants.create({
  instructions:
    'You are a helpful product support assistant and you answer questions based on the files provided to you.',
  model: 'gpt-4o',
  tools: [{ type: 'file_search' }],
  tool_resources: {
    file_search: {
      vector_store_ids: ['vs_1'],
    },
  },
});

const thread = await openai.beta.threads.create({
  messages: [{ role: 'user', content: 'How do I cancel my subscription?' }],
  tool_resources: {
    file_search: {
      vector_store_ids: ['vs_2'],
    },
  },
});
```

You can also attach a vector store to Threads or Assistants after they're created by updating them with the right `tool_resources`.

#### Ensuring vector store readiness before creating runs

We highly recommend that you ensure all files in a `vector_store` are fully processed before you create a run. This will ensure that all the data in your `vector_store` is searchable. You can check for `vector_store` readiness by using the polling helpers in our SDKs, or by manually polling the `vector_store` object to ensure the [`status`](/docs/api-reference/vector-stores/object#vector-stores/object-status) is `completed`.

As a fallback, we've built a **60 second maximum wait** in the Run object when the **thread’s** vector store contains files that are still being processed. This is to ensure that any files your users upload in a thread a fully searchable before the run proceeds. This fallback wait _does not_ apply to the assistant's vector store.

#### Customizing File Search settings

You can customize how the `file_search` tool chunks your data and how many chunks it returns to the model context.

**Chunking configuration**

By default, `max_chunk_size_tokens` is set to `800` and `chunk_overlap_tokens` is set to `400`, meaning every file is indexed by being split up into 800-token chunks, with 400-token overlap between consecutive chunks.

You can adjust this by setting [`chunking_strategy`](/docs/api-reference/vector-stores-files/createFile#vector-stores-files-createfile-chunking_strategy) when adding files to the vector store. There are certain limitations to `chunking_strategy`:

- `max_chunk_size_tokens` must be between 100 and 4096 inclusive.
- `chunk_overlap_tokens` must be non-negative and should not exceed `max_chunk_size_tokens / 2`.

**Number of chunks**

By default, the `file_search` tool outputs up to 20 chunks for `gpt-4*` models and up to 5 chunks for `gpt-3.5-turbo`. You can adjust this by setting [`file_search.max_num_results`](/docs/api-reference/assistants/createAssistant#assistants-createassistant-tools) in the tool when creating the assistant or the run.

Note that the `file_search` tool may output fewer than this number for a myriad of reasons:

- The total number of chunks is fewer than `max_num_results`.
- The total token size of all the retrieved chunks exceeds the token "budget" assigned to the `file_search` tool. The `file_search` tool currently has a token bugdet of:
  - 4,000 tokens for `gpt-3.5-turbo`
  - 16,000 tokens for `gpt-4*` models

#### Improve file search result relevance with chunk ranking

By default, the file search tool will return all search results to the model that it thinks have any level of relevance when generating a response. However, if responses are generated using content that has low relevance, it can lead to lower quality responses. You can adjust this behavior by both inspecting the file search results that are returned when generating responses, and then tuning the behavior of the file search tool's ranker to change how relevant results must be before they are used to generate a response.

**Inspecting file search chunks**

The first step in improving the quality of your file search results is inspecting the current behavior of your assistant. Most often, this will involve investigating responses from your assistant that are not not performing well. You can get [granular information about a past run step](/docs/api-reference/run-steps/getRunStep) using the REST API, specifically using the `include` query parameter to get the file chunks that are being used to generate results.

Include file search results in response when creating a run

```python
from openai import OpenAI
client = OpenAI()

run_step = client.beta.threads.runs.steps.retrieve(
  thread_id="thread_abc123",
  run_id="run_abc123",
  step_id="step_abc123",
  include=["step_details.tool_calls[*].file_search.results[*].content"]
)

print(run_step)
```

```javascript
import OpenAI from 'openai';
const openai = new OpenAI();

const runStep = await openai.beta.threads.runs.steps.retrieve(
  'thread_abc123',
  'run_abc123',
  'step_abc123',
  {
    include: ['step_details.tool_calls[*].file_search.results[*].content'],
  },
);

console.log(runStep);
```

```bash
curl -g https://api.openai.com/v1/threads/thread_abc123/runs/run_abc123/steps/step_abc123?include[]=step_details.tool_calls[*].file_search.results[*].content \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "Content-Type: application/json" \
-H "OpenAI-Beta: assistants=v2"
```

You can then log and inspect the search results used during the run step, and determine whether or not they are consistently relevant to the responses your assistant should generate.

**Configure ranking options**

If you have determined that your file search results are not sufficiently relevant to generate high quality responses, you can adjust the settings of the result ranker used to choose which search results should be used to generate responses. You can adjust this setting [`file_search.ranking_options`](/docs/api-reference/assistants/createAssistant#assistants-createassistant-tools) in the tool when **creating the assistant** or **creating the run**.

The settings you can configure are:

- `ranker` - Which ranker to use in determining which chunks to use. The available values are `auto`, which uses the latest available ranker, and `default_2024_08_21`.
- `score_threshold` - a ranking between 0.0 and 1.0, with 1.0 being the highest ranking. A higher number will constrain the file chunks used to generate a result to only chunks with a higher possible relevance, at the cost of potentially leaving out relevant chunks.

#### Managing costs with expiration policies

The `file_search` tool uses the `vector_stores` object as its resource and you will be billed based on the [size](/docs/api-reference/vector-stores/object#vector-stores/object-bytes) of the `vector_store` objects created. The size of the vector store object is the sum of all the parsed chunks from your files and their corresponding embeddings.

You first GB is free and beyond that, usage is billed at $0.10/GB/day of vector storage. There are no other costs associated with vector store operations.

In order to help you manage the costs associated with these `vector_store` objects, we have added support for expiration policies in the `vector_store` object. You can set these policies when creating or updating the `vector_store` object.

```python
vector_store = client.beta.vector_stores.create_and_poll(
name="Product Documentation",
file_ids=['file_1', 'file_2', 'file_3', 'file_4', 'file_5'],
expires_after={
  "anchor": "last_active_at",
  "days": 7
}
)
```

```javascript
let vectorStore = await openai.beta.vectorStores.create({
  name: 'rag-store',
  file_ids: ['file_1', 'file_2', 'file_3', 'file_4', 'file_5'],
  expires_after: {
    anchor: 'last_active_at',
    days: 7,
  },
});
```

**Thread vector stores have default expiration policies**

Vector stores created using thread helpers (like [`tool_resources.file_search.vector_stores`](/docs/api-reference/threads/createThread#threads-createthread-tool_resources) in Threads or [message.attachments](/docs/api-reference/messages/createMessage#messages-createmessage-attachments) in Messages) have a default expiration policy of 7 days after they were last active (defined as the last time the vector store was part of a run).

When a vector store expires, runs on that thread will fail. To fix this, you can simply recreate a new `vector_store` with the same files and reattach it to the thread.

```python
all_files = list(client.beta.vector_stores.files.list("vs_expired"))

vector_store = client.beta.vector_stores.create(name="rag-store")
client.beta.threads.update(
  "thread_abc123",
  tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
)

for file_batch in chunked(all_files, 100):
  client.beta.vector_stores.file_batches.create_and_poll(
      vector_store_id=vector_store.id, file_ids=[file.id for file in file_batch]
  )
```

```javascript
const fileIds = [];
for await (const file of openai.beta.vectorStores.files.list(
  'vs_toWTk90YblRLCkbE2xSVoJlF',
)) {
  fileIds.push(file.id);
}

const vectorStore = await openai.beta.vectorStores.create({
  name: 'rag-store',
});
await openai.beta.threads.update('thread_abcd', {
  tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
});

for (const fileBatch of _.chunk(fileIds, 100)) {
  await openai.beta.vectorStores.fileBatches.create(vectorStore.id, {
    file_ids: fileBatch,
  });
}
```

## Supported files

_For `text/` MIME types, the encoding must be one of `utf-8`, `utf-16`, or `ascii`._

| File format | MIME type                                                                 |
| ----------- | ------------------------------------------------------------------------- |
| .c          | text/x-c                                                                  |
| .cpp        | text/x-c++                                                                |
| .cs         | text/x-csharp                                                             |
| .css        | text/css                                                                  |
| .doc        | application/msword                                                        |
| .docx       | application/vnd.openxmlformats-officedocument.wordprocessingml.document   |
| .go         | text/x-golang                                                             |
| .html       | text/html                                                                 |
| .java       | text/x-java                                                               |
| .js         | text/javascript                                                           |
| .json       | application/json                                                          |
| .md         | text/markdown                                                             |
| .pdf        | application/pdf                                                           |
| .php        | text/x-php                                                                |
| .pptx       | application/vnd.openxmlformats-officedocument.presentationml.presentation |
| .py         | text/x-python                                                             |
| .py         | text/x-script.python                                                      |
| .rb         | text/x-ruby                                                               |
| .sh         | application/x-sh                                                          |
| .tex        | text/x-tex                                                                |
| .ts         | application/typescript                                                    |
| .txt        | text/plain                                                                |

## Assistants Code Interpreter

Code Interpreter allows Assistants to write and run Python code in a sandboxed execution environment. This tool can process files with diverse data and formatting, and generate files with data and images of graphs. Code Interpreter allows your Assistant to run code iteratively to solve challenging code and math problems. When your Assistant writes code that fails to run, it can iterate on this code by attempting to run different code until the code execution succeeds.

See a quickstart of how to get started with Code Interpreter [here](/docs/assistants/overview#step-1-create-an-assistant?context=with-streaming).

## How it works

Code Interpreter is charged at $0.03 per session. If your Assistant calls Code Interpreter simultaneously in two different threads (e.g., one thread per end-user), two Code Interpreter sessions are created. Each session is active by default for one hour, which means that you only pay for one session per if users interact with Code Interpreter in the same thread for up to one hour.

### Enabling Code Interpreter

Pass `code_interpreter` in the `tools` parameter of the Assistant object to enable Code Interpreter:

```python
assistant = client.beta.assistants.create(
instructions="You are a personal math tutor. When asked a math question, write and run code to answer the question.",
model="gpt-4o",
tools=[{"type": "code_interpreter"}]
)
```

```javascript
const assistant = await openai.beta.assistants.create({
  instructions:
    'You are a personal math tutor. When asked a math question, write and run code to answer the question.',
  model: 'gpt-4o',
  tools: [{ type: 'code_interpreter' }],
});
```

```bash
curl https://api.openai.com/v1/assistants \
-u :$OPENAI_API_KEY \
-H 'Content-Type: application/json' \
-H 'OpenAI-Beta: assistants=v2' \
-d '{
  "instructions": "You are a personal math tutor. When asked a math question, write and run code to answer the question.",
  "tools": [
    { "type": "code_interpreter" }
  ],
  "model": "gpt-4o"
}'
```

The model then decides when to invoke Code Interpreter in a Run based on the nature of the user request. This behavior can be promoted by prompting in the Assistant's `instructions` (e.g., “write code to solve this problem”).

### Passing files to Code Interpreter

Files that are passed at the Assistant level are accessible by all Runs with this Assistant:

```python
# Upload a file with an "assistants" purpose
file = client.files.create(
file=open("mydata.csv", "rb"),
purpose='assistants'
)

# Create an assistant using the file ID
assistant = client.beta.assistants.create(
instructions="You are a personal math tutor. When asked a math question, write and run code to answer the question.",
model="gpt-4o",
tools=[{"type": "code_interpreter"}],
tool_resources={
  "code_interpreter": {
    "file_ids": [file.id]
  }
}
)
```

```javascript
// Upload a file with an "assistants" purpose
const file = await openai.files.create({
  file: fs.createReadStream('mydata.csv'),
  purpose: 'assistants',
});

// Create an assistant using the file ID
const assistant = await openai.beta.assistants.create({
  instructions:
    'You are a personal math tutor. When asked a math question, write and run code to answer the question.',
  model: 'gpt-4o',
  tools: [{ type: 'code_interpreter' }],
  tool_resources: {
    code_interpreter: {
      file_ids: [file.id],
    },
  },
});
```

```bash
# Upload a file with an "assistants" purpose
curl https://api.openai.com/v1/files \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-F purpose="assistants" \
-F file="@/path/to/mydata.csv"

# Create an assistant using the file ID
curl https://api.openai.com/v1/assistants \
-u :$OPENAI_API_KEY \
-H 'Content-Type: application/json' \
-H 'OpenAI-Beta: assistants=v2' \
-d '{
  "instructions": "You are a personal math tutor. When asked a math question, write and run code to answer the question.",
  "tools": [{"type": "code_interpreter"}],
  "model": "gpt-4o",
  "tool_resources": {
    "code_interpreter": {
      "file_ids": ["file-BK7bzQj3FfZFXr7DbL6xJwfo"]
    }
  }
}'
```

Files can also be passed at the Thread level. These files are only accessible in the specific Thread. Upload the File using the [File upload](/docs/api-reference/files/create) endpoint and then pass the File ID as part of the Message creation request:

```python
thread = client.beta.threads.create(
messages=[
  {
    "role": "user",
    "content": "I need to solve the equation `3x + 11 = 14`. Can you help me?",
    "attachments": [
      {
        "file_id": file.id,
        "tools": [{"type": "code_interpreter"}]
      }
    ]
  }
]
)
```

```javascript
const thread = await openai.beta.threads.create({
  messages: [
    {
      role: 'user',
      content: 'I need to solve the equation `3x + 11 = 14`. Can you help me?',
      attachments: [
        {
          file_id: file.id,
          tools: [{ type: 'code_interpreter' }],
        },
      ],
    },
  ],
});
```

```bash
curl https://api.openai.com/v1/threads/thread_abc123/messages \
-u :$OPENAI_API_KEY \
-H 'Content-Type: application/json' \
-H 'OpenAI-Beta: assistants=v2' \
-d '{
  "role": "user",
  "content": "I need to solve the equation `3x + 11 = 14`. Can you help me?",
  "attachments": [
    {
      "file_id": "file-ACq8OjcLQm2eIG0BvRM4z5qX",
      "tools": [{"type": "code_interpreter"}]
    }
  ]
}'
```

Files have a maximum size of 512 MB. Code Interpreter supports a variety of file formats including `.csv`, `.pdf`, `.json` and many more. More details on the file extensions (and their corresponding MIME-types) supported can be found in the [Supported files](#supported-files) section below.

### Reading images and files generated by Code Interpreter

Code Interpreter in the API also outputs files, such as generating image diagrams, CSVs, and PDFs. There are two types of files that are generated:

1.  Images
2.  Data files (e.g. a `csv` file with data generated by the Assistant)

When Code Interpreter generates an image, you can look up and download this file in the `file_id` field of the Assistant Message response:

```json
{
	"id": "msg_abc123",
	"object": "thread.message",
	"created_at": 1698964262,
	"thread_id": "thread_abc123",
	"role": "assistant",
	"content": [
    {
      "type": "image_file",
      "image_file": {
        "file_id": "file-abc123"
      }
    }
  ]
  # ...
}
```

The file content can then be downloaded by passing the file ID to the Files API:

```python
from openai import OpenAI

client = OpenAI()

image_data = client.files.content("file-abc123")
image_data_bytes = image_data.read()

with open("./my-image.png", "wb") as file:
  file.write(image_data_bytes)
```

```javascript
import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI();

async function main() {
  const response = await openai.files.content('file-abc123');

  // Extract the binary data from the Response object
  const image_data = await response.arrayBuffer();

  // Convert the binary data to a Buffer
  const image_data_buffer = Buffer.from(image_data);

  // Save the image to a specific location
  fs.writeFileSync('./my-image.png', image_data_buffer);
}

main();
```

```bash
curl https://api.openai.com/v1/files/file-abc123/content \
-H "Authorization: Bearer $OPENAI_API_KEY" \
--output image.png
```

When Code Interpreter references a file path (e.g., ”Download this csv file”), file paths are listed as annotations. You can convert these annotations into links to download the file:

```json
{
  "id": "msg_abc123",
  "object": "thread.message",
  "created_at": 1699073585,
  "thread_id": "thread_abc123",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": {
        "value": "The rows of the CSV file have been shuffled and saved to a new CSV file. You can download the shuffled CSV file from the following link:\n\n[Download Shuffled CSV File](sandbox:/mnt/data/shuffled_file.csv)",
        "annotations": [
          {
            "type": "file_path",
            "text": "sandbox:/mnt/data/shuffled_file.csv",
            "start_index": 167,
            "end_index": 202,
            "file_path": {
              "file_id": "file-abc123"
            }
          }
          ...
```

### Input and output logs of Code Interpreter

By listing the steps of a Run that called Code Interpreter, you can inspect the code `input` and `outputs` logs of Code Interpreter:

```python
run_steps = client.beta.threads.runs.steps.list(
thread_id=thread.id,
run_id=run.id
)
```

```javascript
const runSteps = await openai.beta.threads.runs.steps.list(thread.id, run.id);
```

```bash
curl https://api.openai.com/v1/threads/thread_abc123/runs/RUN_ID/steps \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "OpenAI-Beta: assistants=v2" \
```

```bash
{
  "object": "list",
  "data": [
    {
      "id": "step_abc123",
      "object": "thread.run.step",
      "type": "tool_calls",
      "run_id": "run_abc123",
      "thread_id": "thread_abc123",
      "status": "completed",
      "step_details": {
        "type": "tool_calls",
        "tool_calls": [
          {
            "type": "code",
            "code": {
              "input": "# Calculating 2 + 2\nresult = 2 + 2\nresult",
              "outputs": [
                {
                  "type": "logs",
                  "logs": "4"
                }
						...
 }
```

## Supported files

| File format | MIME type                                                                 |
| ----------- | ------------------------------------------------------------------------- |
| .c          | text/x-c                                                                  |
| .cs         | text/x-csharp                                                             |
| .cpp        | text/x-c++                                                                |
| .csv        | text/csv                                                                  |
| .doc        | application/msword                                                        |
| .docx       | application/vnd.openxmlformats-officedocument.wordprocessingml.document   |
| .html       | text/html                                                                 |
| .java       | text/x-java                                                               |
| .json       | application/json                                                          |
| .md         | text/markdown                                                             |
| .pdf        | application/pdf                                                           |
| .php        | text/x-php                                                                |
| .pptx       | application/vnd.openxmlformats-officedocument.presentationml.presentation |
| .py         | text/x-python                                                             |
| .py         | text/x-script.python                                                      |
| .rb         | text/x-ruby                                                               |
| .tex        | text/x-tex                                                                |
| .txt        | text/plain                                                                |
| .css        | text/css                                                                  |
| .js         | text/javascript                                                           |
| .sh         | application/x-sh                                                          |
| .ts         | application/typescript                                                    |
| .csv        | application/csv                                                           |
| .jpeg       | image/jpeg                                                                |
| .jpg        | image/jpeg                                                                |
| .gif        | image/gif                                                                 |
| .pkl        | application/octet-stream                                                  |
| .png        | image/png                                                                 |
| .tar        | application/x-tar                                                         |
| .xlsx       | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet         |
| .xml        | application/xml or "text/xml"                                             |
| .zip        | application/zip                                                           |

## Assistants Function Calling

Similar to the Chat Completions API, the Assistants API supports function calling. Function calling allows you to describe functions to the Assistants API and have it intelligently return the functions that need to be called along with their arguments.

## Quickstart

In this example, we'll create a weather assistant and define two functions, `get_current_temperature` and `get_rain_probability`, as tools that the Assistant can call. Depending on the user query, the model will invoke parallel function calling if using our latest models released on or after Nov 6, 2023. In our example that uses parallel function calling, we will ask the Assistant what the weather in San Francisco is like today and the chances of rain. We also show how to output the Assistant's response with streaming.

With the launch of Structured Outputs, you can now use the parameter `strict: true` when using function calling with the Assistants API. For more information, refer to the [Function calling guide](/docs/guides/function-calling#function-calling-with-structured-outputs). Please note that Structured Outputs are not supported in the Assistants API when using vision.

### Step 1: Define functions

When creating your assistant, you will first define the functions under the `tools` param of the assistant.

```python
from openai import OpenAI
client = OpenAI()

assistant = client.beta.assistants.create(
instructions="You are a weather bot. Use the provided functions to answer questions.",
model="gpt-4o",
tools=[
  {
    "type": "function",
    "function": {
      "name": "get_current_temperature",
      "description": "Get the current temperature for a specific location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "The city and state, e.g., San Francisco, CA"
          },
          "unit": {
            "type": "string",
            "enum": ["Celsius", "Fahrenheit"],
            "description": "The temperature unit to use. Infer this from the user's location."
          }
        },
        "required": ["location", "unit"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "get_rain_probability",
      "description": "Get the probability of rain for a specific location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "The city and state, e.g., San Francisco, CA"
          }
        },
        "required": ["location"]
      }
    }
  }
]
)
```

```javascript
const assistant = await client.beta.assistants.create({
  model: 'gpt-4o',
  instructions:
    'You are a weather bot. Use the provided functions to answer questions.',
  tools: [
    {
      type: 'function',
      function: {
        name: 'getCurrentTemperature',
        description: 'Get the current temperature for a specific location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city and state, e.g., San Francisco, CA',
            },
            unit: {
              type: 'string',
              enum: ['Celsius', 'Fahrenheit'],
              description:
                "The temperature unit to use. Infer this from the user's location.",
            },
          },
          required: ['location', 'unit'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'getRainProbability',
        description: 'Get the probability of rain for a specific location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city and state, e.g., San Francisco, CA',
            },
          },
          required: ['location'],
        },
      },
    },
  ],
});
```

### Step 2: Create a Thread and add Messages

Create a Thread when a user starts a conversation and add Messages to the Thread as the user asks questions.

```python
thread = client.beta.threads.create()
message = client.beta.threads.messages.create(
thread_id=thread.id,
role="user",
content="What's the weather in San Francisco today and the likelihood it'll rain?",
)
```

```javascript
const thread = await client.beta.threads.create();
const message = client.beta.threads.messages.create(thread.id, {
  role: 'user',
  content:
    "What's the weather in San Francisco today and the likelihood it'll rain?",
});
```

### Step 3: Initiate a Run

When you initiate a Run on a Thread containing a user Message that triggers one or more functions, the Run will enter a `pending` status. After it processes, the run will enter a `requires_action` state which you can verify by checking the Run’s `status`. This indicates that you need to run tools and submit their outputs to the Assistant to continue Run execution. In our case, we will see two `tool_calls`, which indicates that the user query resulted in parallel function calling.

Note that a runs expire ten minutes after creation. Be sure to submit your tool outputs before the 10 min mark.

You will see two `tool_calls` within `required_action`, which indicates the user query triggered parallel function calling.

```json
{
"id": "run_qJL1kI9xxWlfE0z1yfL0fGg9",
...
"status": "requires_action",
"required_action": {
  "submit_tool_outputs": {
    "tool_calls": [
      {
        "id": "call_FthC9qRpsL5kBpwwyw6c7j4k",
        "function": {
          "arguments": "{"location": "San Francisco, CA"}",
          "name": "get_rain_probability"
        },
        "type": "function"
      },
      {
        "id": "call_RpEDoB8O0FTL9JoKTuCVFOyR",
        "function": {
          "arguments": "{"location": "San Francisco, CA", "unit": "Fahrenheit"}",
          "name": "get_current_temperature"
        },
        "type": "function"
      }
    ]
  },
  ...
  "type": "submit_tool_outputs"
}
}
```

Run object truncated here for readability

How you initiate a Run and submit `tool_calls` will differ depending on whether you are using streaming or not, although in both cases all `tool_calls` need to be submitted at the same time. You can then complete the Run by submitting the tool outputs from the functions you called. Pass each `tool_call_id` referenced in the `required_action` object to match outputs to each function call.

With streamingWithout streaming

For the streaming case, we create an EventHandler class to handle events in the response stream and submit all tool outputs at once with the “submit tool outputs stream” helper in the Python and Node SDKs.

```python
from typing_extensions import override
from openai import AssistantEventHandler

class EventHandler(AssistantEventHandler):
  @override
  def on_event(self, event):
    # Retrieve events that are denoted with 'requires_action'
    # since these will have our tool_calls
    if event.event == 'thread.run.requires_action':
      run_id = event.data.id  # Retrieve the run ID from the event data
      self.handle_requires_action(event.data, run_id)

  def handle_requires_action(self, data, run_id):
    tool_outputs = []

    for tool in data.required_action.submit_tool_outputs.tool_calls:
      if tool.function.name == "get_current_temperature":
        tool_outputs.append({"tool_call_id": tool.id, "output": "57"})
      elif tool.function.name == "get_rain_probability":
        tool_outputs.append({"tool_call_id": tool.id, "output": "0.06"})

    # Submit all tool_outputs at the same time
    self.submit_tool_outputs(tool_outputs, run_id)

  def submit_tool_outputs(self, tool_outputs, run_id):
    # Use the submit_tool_outputs_stream helper
    with client.beta.threads.runs.submit_tool_outputs_stream(
      thread_id=self.current_run.thread_id,
      run_id=self.current_run.id,
      tool_outputs=tool_outputs,
      event_handler=EventHandler(),
    ) as stream:
      for text in stream.text_deltas:
        print(text, end="", flush=True)
      print()

with client.beta.threads.runs.stream(
thread_id=thread.id,
assistant_id=assistant.id,
event_handler=EventHandler()
) as stream:
stream.until_done()
```

```javascript
class EventHandler extends EventEmitter {
  constructor(client) {
    super();
    this.client = client;
  }

  async onEvent(event) {
    try {
      console.log(event);
      // Retrieve events that are denoted with 'requires_action'
      // since these will have our tool_calls
      if (event.event === 'thread.run.requires_action') {
        await this.handleRequiresAction(
          event.data,
          event.data.id,
          event.data.thread_id,
        );
      }
    } catch (error) {
      console.error('Error handling event:', error);
    }
  }

  async handleRequiresAction(data, runId, threadId) {
    try {
      const toolOutputs =
        data.required_action.submit_tool_outputs.tool_calls.map(toolCall => {
          if (toolCall.function.name === 'getCurrentTemperature') {
            return {
              tool_call_id: toolCall.id,
              output: '57',
            };
          } else if (toolCall.function.name === 'getRainProbability') {
            return {
              tool_call_id: toolCall.id,
              output: '0.06',
            };
          }
        });
      // Submit all the tool outputs at the same time
      await this.submitToolOutputs(toolOutputs, runId, threadId);
    } catch (error) {
      console.error('Error processing required action:', error);
    }
  }

  async submitToolOutputs(toolOutputs, runId, threadId) {
    try {
      // Use the submitToolOutputsStream helper
      const stream = this.client.beta.threads.runs.submitToolOutputsStream(
        threadId,
        runId,
        { tool_outputs: toolOutputs },
      );
      for await (const event of stream) {
        this.emit('event', event);
      }
    } catch (error) {
      console.error('Error submitting tool outputs:', error);
    }
  }
}

const eventHandler = new EventHandler(client);
eventHandler.on('event', eventHandler.onEvent.bind(eventHandler));

const stream = await client.beta.threads.runs.stream(
  threadId,
  { assistant_id: assistantId },
  eventHandler,
);

for await (const event of stream) {
  eventHandler.emit('event', event);
}
```

### Using Structured Outputs

When you enable [Structured Outputs](/docs/guides/structured-outputs) by supplying `strict: true`, the OpenAI API will pre-process your supplied schema on your first request, and then use this artifact to constrain the model to your schema.

```python
from openai import OpenAI
client = OpenAI()

assistant = client.beta.assistants.create(
instructions="You are a weather bot. Use the provided functions to answer questions.",
model="gpt-4o-2024-08-06",
tools=[
  {
    "type": "function",
    "function": {
      "name": "get_current_temperature",
      "description": "Get the current temperature for a specific location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "The city and state, e.g., San Francisco, CA"
          },
          "unit": {
            "type": "string",
            "enum": ["Celsius", "Fahrenheit"],
            "description": "The temperature unit to use. Infer this from the user's location."
          }
        },
        "required": ["location", "unit"],
        "additionalProperties": False
      },
      "strict": True
    }
  },
  {
    "type": "function",
    "function": {
      "name": "get_rain_probability",
      "description": "Get the probability of rain for a specific location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "The city and state, e.g., San Francisco, CA"
          }
        },
        "required": ["location"],
        "additionalProperties": False
      },
      "strict": True
    }
  }
]
)
```

```javascript
const assistant = await client.beta.assistants.create({
  model: 'gpt-4o-2024-08-06',
  instructions:
    'You are a weather bot. Use the provided functions to answer questions.',
  tools: [
    {
      type: 'function',
      function: {
        name: 'getCurrentTemperature',
        description: 'Get the current temperature for a specific location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city and state, e.g., San Francisco, CA',
            },
            unit: {
              type: 'string',
              enum: ['Celsius', 'Fahrenheit'],
              description:
                "The temperature unit to use. Infer this from the user's location.",
            },
          },
          required: ['location', 'unit'],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: 'function',
      function: {
        name: 'getRainProbability',
        description: 'Get the probability of rain for a specific location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city and state, e.g., San Francisco, CA',
            },
          },
          required: ['location'],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  ],
});
```

Was this page useful?
