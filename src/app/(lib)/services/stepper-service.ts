import { Effect, Layer, Queue, Ref, Stream } from "effect";

export class StepperService extends Effect.Tag("StepperService")<
  StepperService,
  {
    currentStep: Ref.Ref<number>;
    stepQueue: Queue.Queue<number>;
    stepStream: Stream.Stream<number, never, never>;
    setStep: (step: number) => Effect.Effect<void, never, never>;
    getStep: Effect.Effect<number, never, never>;
  }
>() {}

export const StepperServiceLive = Layer.effect(
  StepperService,
  Effect.gen(function* (_) {
    const currentStep = yield* _(Ref.make(0));
    const stepQueue = yield* _(Queue.unbounded<number>());
    const stepStream = Stream.fromQueue(stepQueue);

    const setStep = (step: number) =>
      Effect.gen(function* (_) {
        yield* _(Ref.set(currentStep, step));
        yield* _(Queue.offer(stepQueue, step));
        yield* _(
          Effect.log(`Step changed to ${step}`).pipe(
            Effect.annotateLogs({ flow: "checkout" }),
          ),
        );
      });

    const getStep = Ref.get(currentStep);

    return {
      currentStep,
      stepQueue,
      stepStream,
      setStep,
      getStep,
    };
  }),
);
