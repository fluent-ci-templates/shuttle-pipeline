import Client, { Directory, Secret } from "../../deps.ts";
import { connect } from "../../sdk/connect.ts";
import { getDirectory, getApiKey } from "./lib.ts";

export enum Job {
  deploy = "deploy",
}

export const exclude = ["target", ".git", ".fluentci"];

export const deploy = async (
  src: string | Directory | undefined = ".",
  apiKey?: string | Secret
) => {
  await connect(async (client: Client) => {
    const context = getDirectory(client, src);
    const secret = getApiKey(client, apiKey);

    if (!secret) {
      console.error("Missing SHUTTLE_API_KEY");
      Deno.exit(1);
    }

    const ctr = client
      .pipeline(Job.deploy)
      .container()
      .from("rust:1.72-bookworm")
      .withExec(["apt", "update"])
      .withExec(["apt", "install", "-y", "build-essential"])
      .withMountedCache(
        "/usr/local/cargo/registry",
        client.cacheVolume("cargo-registry")
      )
      .withExec(["cargo", "install", "cargo-shuttle"])
      .withSecretVariable("SHUTTLE_API_KEY", secret)
      .withMountedCache("/app/target", client.cacheVolume("cargo-target"))
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec(["sh", "-c", "cargo shuttle login --api-key $SHUTTLE_API_KEY"])
      .withExec(["cargo", "shuttle", "deploy"]);

    const result = await ctr.stdout();

    console.log(result);
  });

  return "done";
};

export type JobExec = (
  src?: string,
  apiKey?: string
) =>
  | Promise<string>
  | ((
      src?: string,
      options?: {
        ignore: string[];
      }
    ) => Promise<string>);

export const runnableJobs: Record<Job, JobExec> = {
  [Job.deploy]: deploy,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.deploy]: "Deploy the application to Shuttle",
};
