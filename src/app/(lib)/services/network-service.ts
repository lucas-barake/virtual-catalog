import { Context, Effect, Layer, Random, Duration } from "effect";

export class NetworkService extends Context.Tag("NetworkService")<
  NetworkService,
  {
    simulateNetworkDelay: Effect.Effect<void, never, never>;
  }
>() {}

export const NetworkServiceLive = Layer.succeed(
  NetworkService,
  NetworkService.of({
    simulateNetworkDelay: Effect.gen(function* (_) {
      const delay = yield* _(Random.nextIntBetween(500, 1_000));
      yield* _(Effect.sleep(Duration.millis(delay)));
      yield* _(
        Effect.log(`Network delay: ${delay}ms`).pipe(
          Effect.annotateLogs({ network: "delay" }),
        ),
      );
    }),
  }),
);
