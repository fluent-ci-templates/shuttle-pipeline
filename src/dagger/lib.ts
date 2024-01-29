import { Directory, DirectoryID, Secret, SecretID } from "../../deps.ts";
import { Client } from "../../sdk/client.gen.ts";

export const getDirectory = async (
  client: Client,
  src: string | Directory | undefined = "."
) => {
  if (typeof src === "string") {
    try {
      const directory = client.loadDirectoryFromID(src as DirectoryID);
      await directory.id();
      return directory;
    } catch (_) {
      return client.host().directory(src);
    }
  }
  return src instanceof Directory ? src : client.host().directory(src);
};

export const getApiKey = async (client: Client, apiKey?: string | Secret) => {
  if (Deno.env.get("SHUTTLE_API_KEY")) {
    return client.setSecret(
      "SHUTTLE_API_KEY",
      Deno.env.get("SHUTTLE_API_KEY")!
    );
  }
  if (apiKey && typeof apiKey === "string") {
    try {
      const secret = client.loadSecretFromID(apiKey as SecretID);
      await secret.id();
      return secret;
    } catch (_) {
      return client.setSecret("SHUTTLE_API_KEY", apiKey);
    }
  }
  if (apiKey && apiKey instanceof Secret) {
    return apiKey;
  }
  return undefined;
};
