import { type Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getPostHogServer } = await import("@/lib/posthog-server");
  const posthog = getPostHogServer();
  if (!posthog) return;

  await posthog.captureException(err, undefined, {
    path: request.path,
    method: request.method,
    routeType: context.routeType,
  });
};
