import Client, { connect } from "../../deps.ts";

export enum Job {
  deploy = "deploy",
}

export const exclude = ["target", ".git", ".fluentci"];

export const deploy = async (src = ".", apiKey?: string) => {
  if (!Deno.env.get("SHUTTLE_API_KEY") && !apiKey) {
    console.log("SHUTTLE_API_KEY is not set");
    Deno.exit(1);
  }

  await connect(async (client: Client) => {
    const context = client.host().directory(src);
    const ctr = client
      .pipeline(Job.deploy)
      .container()
      .from("rust:1.71-bookworm")
      .withExec(["apt", "update"])
      .withExec(["apt", "install", "-y", "build-essential"])
      .withExec(["cargo", "install", "cargo-shuttle"])
      .withMountedCache(
        "/usr/local/cargo/registry",
        client.cacheVolume("cargo-registry")
      )
      .withEnvVariable("SHUTTLE_API_KEY", Deno.env.get("SHUTTLE_API_KEY")!)
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
