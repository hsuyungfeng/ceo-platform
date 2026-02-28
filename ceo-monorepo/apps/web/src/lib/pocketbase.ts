import PocketBase from "pocketbase";

// Determine the PocketBase URL based on the environment
const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";

export const pb = new PocketBase(pbUrl);

// Optional: you can turn off AutoCancellation if you prefer to have overlapping requests
pb.autoCancellation(false);

export default pb;
