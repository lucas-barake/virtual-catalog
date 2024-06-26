import { Layer, ManagedRuntime } from "effect";
import { StepperServiceLive } from "../services/stepper-service";
import { NetworkServiceLive } from "../services/network-service";
import { CustomLoggerLive } from "../services/logger-service";

export const AppLayer = Layer.mergeAll(
  StepperServiceLive,
  NetworkServiceLive,
  CustomLoggerLive,
);

export const AppRuntime = ManagedRuntime.make(AppLayer);
