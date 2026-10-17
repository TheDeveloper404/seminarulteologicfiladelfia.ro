import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, it, vi } from "vitest";

let root: string;
afterEach(async () => {
  vi.unstubAllEnvs();
  vi.resetModules();
  if (root) await rm(root, { recursive: true, force: true });
});

// "Fișierele stau în afara `public/`, ca și materialele de curs — descărcarea trece exclusiv prin ruta protejată /api/documente/[id]."
it.each(["material", "document"])("keeps a new private %s readable only by its owner on POSIX", async (kind) => {
  root = await mkdtemp(path.join(tmpdir(), "seminar-private-"));
  const directory = path.join(root, kind);
  vi.stubEnv("COURSE_MATERIALS_DIR", directory);
  vi.stubEnv("GENERATED_DOCS_DIR", directory);
  vi.resetModules();
  const content = new Uint8Array([37, 80, 68, 70]);
  const name = kind === "material"
    ? await (await import("./course-materials/storage")).saveCourseMaterialFile(new File([content], "private.pdf"))
    : await (await import("./documents/storage")).saveGeneratedDocument(content);
  expect(await readFile(path.join(directory, name))).toEqual(Buffer.from(content));
  if (process.platform !== "win32") {
    expect((await stat(directory)).mode & 0o777).toBe(0o700);
    expect((await stat(path.join(directory, name))).mode & 0o777).toBe(0o600);
  }
});
