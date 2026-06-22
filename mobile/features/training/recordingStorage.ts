import { Directory, File, Paths } from "expo-file-system";

const recordingsDirectory = new Directory(Paths.document, "recordings");

function safeExtension(uri: string) {
  const withoutQuery = uri.split(/[?#]/, 1)[0];
  const match = withoutQuery.match(/\.[a-z0-9]{1,8}$/i);
  return match?.[0].toLowerCase() ?? ".m4a";
}

export function persistRecording(uri: string | undefined, name: string) {
  if (!uri) {
    return undefined;
  }

  recordingsDirectory.create({ intermediates: true, idempotent: true });
  const source = new File(uri);
  const destination = new File(
    recordingsDirectory,
    `${name}${safeExtension(uri)}`,
  );

  if (destination.exists) {
    destination.delete();
  }

  source.copy(destination);
  return destination.uri;
}

export function deleteStoredRecordings() {
  if (recordingsDirectory.exists) {
    recordingsDirectory.delete();
  }
}
