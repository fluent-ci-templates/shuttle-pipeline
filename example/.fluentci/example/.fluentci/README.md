# Shuttle Pipeline

[![deno module](https://shield.deno.dev/x/shuttle_pipeline)](https://deno.land/x/shuttle_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.34)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/shuttle-pipeline)](https://codecov.io/gh/fluent-ci-templates/shuttle-pipeline)

A ready-to-use CI/CD Pipeline for deploying your Rust applications to [Shuttle](https://shuttle.rs/).

## 🚀 Usage

Run the following command:

```bash
dagger run fluentci shuttle_pipeline
```

## Environment Variables

| Variable        | Description                      |
|-----------------|----------------------------------|
| SHUTTLE_API_KEY | Your Shuttle API key             |

## Jobs

| Job     | Description                                 |
|---------|---------------------------------------------|
| deploy  | Deploy your Rust application to shuttle.rs. |

## Programmatic usage

You can also use this pipeline programmatically:

```typescript
import { Client, connect } from "https://esm.sh/@dagger.io/dagger@0.8.1";
import { Dagger } from "https://deno.land/x/shuttle_pipeline/mod.ts";

const { deploy } = Dagger;

function pipeline(src = ".") {
  connect(async (client: Client) => {
    await deploy(client, src);
  });
}

pipeline();

```