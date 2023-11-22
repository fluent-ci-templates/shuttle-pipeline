import Client, {
  Directory,
  DirectoryID,
  Secret,
  SecretID,
} from "../../deps.ts";

export const getDirectory = (
  client: Client,
  src: string | Directory | undefined = "."
) => {
  if (typeof src === "string" && src.startsWith("core.Directory")) {
    return client.directory({
      id: src as DirectoryID,
    });
  }
  return src instanceof Directory ? src : client.host().directory(src);
};

export const getApiKey = (client: Client, apiKey?: string | Secret) => {
  if (Deno.env.get("SHUTTLE_API_KEY")) {
    return client.setSecret(
      "SHUTTLE_API_KEY",
      Deno.env.get("SHUTTLE_API_KEY")!
    );
  }
  if (apiKey && typeof apiKey === "string") {
    if (apiKey.startsWith("core.Secret")) {
      return client.loadSecretFromID(apiKey as SecretID);
    }
    return client.setSecret("SHUTTLE_API_KEY", apiKey);
  }
  if (apiKey && apiKey instanceof Secret) {
    return apiKey;
  }
  return undefined;
};
