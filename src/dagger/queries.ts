import { gql } from "../../deps.ts";

export const deploy = gql`
  query deploy($src: String!, $apiKey: String!) {
    deply(src: $src, apiKey: $apiKey)
  }
`;
