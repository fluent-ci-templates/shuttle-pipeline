# Shuttle Pipeline

[![fluentci pipeline](https://shield.fluentci.io/x/shuttle_pipeline)](https://pkg.fluentci.io/shuttle_pipeline)
[![deno module](https://shield.deno.dev/x/shuttle_pipeline)](https://deno.land/x/shuttle_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.41)
[![dagger-min-version](https://shield.fluentci.io/dagger/v0.11.7)](https://dagger.io)
[![](https://jsr.io/badges/@fluentci/shuttle)](https://jsr.io/@fluentci/shuttle)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/shuttle-pipeline)](https://codecov.io/gh/fluent-ci-templates/shuttle-pipeline)

A ready-to-use CI/CD Pipeline for deploying your shuttle applications to [Shuttle](https://shuttle.rs/).

## 🚀 Usage

Run the following command:

```bash
fluentci run shuttle_pipeline
```

## 🧩 Dagger Module

Use as a [Dagger](https://dagger.io) Module:

```bash
dagger install github.com/fluent-ci-templates/shuttle-pipeline@main
```

Call `deploy` function from this module:

```bash
dagger call deploy --src . --api-key SHUTTLE_API_KEY
```

## 🛠️ Environment Variables

| Variable        | Description                      |
|-----------------|----------------------------------|
| SHUTTLE_API_KEY | Your Shuttle API key             |
| SHUTTLE_VERSION | The version of `cargo shuttle`, defaults to `v0.39.0` |

## ✨ Jobs

| Job     | Description                                 |
|---------|---------------------------------------------|
| deploy  | Deploy your shuttle application to shuttle.rs. |

```typescript
 deploy(
  src: string | Directory | undefined = ".",
  apiKey?: string | Secret,
  shuttleVersion?: string,
): Promise<string>
```

## 👨‍💻 Programmatic usage

You can also use this pipeline programmatically:

```typescript
import { deploy } from "jsr:@fluentci/shuttle";

await deploy(".");
```