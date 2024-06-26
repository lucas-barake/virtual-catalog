"use client";

import { cn } from "@/lib/utils";
import { Effect, Stream, Schedule, Fiber } from "effect";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, ShoppingCart } from "lucide-react";
import React from "react";
import { StepperService } from "./(lib)/services/stepper-service";
import { AppRuntime } from "./(lib)/runtimes/app-runtime";
import { NetworkService } from "./(lib)/services/network-service";

const steps = ["Cart", "Shipping", "Payment", "Confirmation"];

const mockCartItems = [
  { id: 1, name: "Wireless Earbuds", price: 79.99, quantity: 1 },
  { id: 2, name: "Smartphone Case", price: 19.99, quantity: 2 },
  { id: 3, name: "USB-C Cable", price: 9.99, quantity: 3 },
];

const mockShippingForm = [
  { label: "Full Name", type: "text", placeholder: "John Doe" },
  { label: "Address", type: "text", placeholder: "123 Main St" },
  { label: "City", type: "text", placeholder: "New York" },
  { label: "Zip Code", type: "text", placeholder: "10001" },
];

const mockPaymentForm = [
  { label: "Card Number", type: "text", placeholder: "1234 5678 9012 3456" },
  { label: "Expiration Date", type: "text", placeholder: "MM/YY" },
  { label: "CVV", type: "text", placeholder: "123" },
];

export default function HomePage() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  // updates the active step when the stepper service changes
  React.useEffect(() => {
    const fiber = AppRuntime.runFork(
      Effect.gen(function* (_) {
        const stepperService = yield* _(StepperService);
        yield* _(
          stepperService.stepStream.pipe(
            Stream.tap((step) => Effect.sync(() => setActiveStep(step))),
            Stream.tap((step) => Effect.log("Received step:", step)),
            Stream.runDrain,
          ),
        );
      }).pipe(Effect.annotateLogs({ background: "task" })),
    );

    return () => {
      void AppRuntime.runPromise(Fiber.interrupt(fiber));
    };
  }, []);

  const handleNext = Effect.gen(function* (_) {
    const stepperService = yield* _(StepperService);
    const networkService = yield* _(NetworkService);
    const currentStep = yield* _(stepperService.getStep);

    setIsLoading(true);
    yield* _(
      networkService.simulateNetworkDelay,
      Effect.tapBoth({
        onSuccess: () => Effect.sync(() => setIsLoading(false)),
        onFailure: () =>
          Effect.flatMap(
            Effect.log("Network delay failed").pipe(
              Effect.annotateLogs({ network: "error" }),
            ),
            () => Effect.sync(() => setIsLoading(false)),
          ),
      }),
    );

    if (currentStep < steps.length - 1) {
      yield* _(stepperService.setStep(currentStep + 1));
    }
  });

  const handlePrev = Effect.gen(function* (_) {
    const stepperService = yield* _(StepperService);
    const networkService = yield* _(NetworkService);
    const currentStep = yield* _(stepperService.getStep);

    setIsLoading(true);
    yield* _(networkService.simulateNetworkDelay);
    setIsLoading(false);

    if (currentStep > 0) {
      yield* _(stepperService.setStep(currentStep - 1));
    }
  });

  // periodically logs the current step
  React.useEffect(() => {
    const fiber = AppRuntime.runFork(
      Effect.gen(function* (_) {
        const stepperService = yield* _(StepperService);

        yield* _(
          Effect.repeat(
            Effect.gen(function* (_) {
              const currentStep = yield* _(stepperService.getStep);
              yield* _(
                Effect.log(`Current step: ${currentStep}`).pipe(
                  Effect.annotateLogs({ background: "task" }),
                ),
              );
            }),
            Schedule.spaced("5 seconds"),
          ),
        );
      }),
    );

    return () => {
      void AppRuntime.runPromise(Fiber.interrupt(fiber));
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <span className="text-2xl font-bold text-indigo-600">
                  Catalog
                </span>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="#"
                  className="inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Home
                </a>
                <a
                  href="#"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Products
                </a>
                <a
                  href="#"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  About
                </a>
                <a
                  href="#"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            Checkout Process
          </h1>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        index <= activeStep
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {index < activeStep ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CheckCircle className="h-6 w-6" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key={`step-${index}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {index + 1}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="mt-2 text-sm">{step}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="h-1 flex-1 bg-gray-200">
                      <motion.div
                        className="h-full bg-indigo-600"
                        initial={{ width: "0%" }}
                        animate={{ width: index < activeStep ? "100%" : "0%" }}
                        transition={{ duration: 0.5 }}
                      ></motion.div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white shadow sm:rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">
                  {steps[activeStep]}
                </h3>
                {activeStep === 0 && (
                  <motion.div className="space-y-4">
                    {mockCartItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <div className="flex items-center">
                          <ShoppingCart className="mr-2 h-5 w-5 text-indigo-600" />
                          <span>{item.name}</span>
                        </div>
                        <div>
                          <span className="font-medium">${item.price}</span>
                          <span className="ml-2 text-sm text-gray-500">
                            x{item.quantity}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    <motion.div
                      variants={itemVariants}
                      className="mt-4 text-right text-xl font-bold"
                    >
                      Total: $
                      {mockCartItems
                        .reduce(
                          (total, item) => total + item.price * item.quantity,
                          0,
                        )
                        .toFixed(2)}
                    </motion.div>
                  </motion.div>
                )}
                {activeStep === 1 && (
                  <motion.div className="space-y-4">
                    {mockShippingForm.map((field, index) => (
                      <motion.div
                        key={field.label}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 }}
                      >
                        <label className="block text-sm font-medium text-gray-700">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                {activeStep === 2 && (
                  <motion.div className="space-y-4">
                    {mockPaymentForm.map((field, index) => (
                      <motion.div
                        key={field.label}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 }}
                      >
                        <label className="block text-sm font-medium text-gray-700">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                {activeStep === 3 && (
                  <motion.div
                    className="flex flex-col items-center justify-center space-y-4"
                    variants={containerVariants}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                    >
                      <CheckCircle className="h-16 w-16 text-green-500" />
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl font-medium"
                    >
                      Order confirmed!
                    </motion.span>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-center text-gray-600"
                    >
                      Thank you for your purchase. Your order will be shipped
                      soon.
                    </motion.p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => {
                void handlePrev.pipe(AppRuntime.runPromise);
              }}
              disabled={activeStep === 0 || isLoading}
              className={cn(
                "rounded-md border border-transparent px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500",
                activeStep !== 0 &&
                  "bg-indigo-600 text-white hover:bg-indigo-700",
              )}
            >
              Previous
            </button>

            <button
              onClick={() => {
                void handleNext.pipe(AppRuntime.runPromise);
              }}
              disabled={activeStep === steps.length - 1 || isLoading}
              className={cn(
                "rounded-md border border-transparent px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500",
                activeStep === steps.length - 1
                  ? "cursor-not-allowed bg-gray-300 text-gray-500"
                  : "bg-indigo-600 text-white hover:bg-indigo-700",
              )}
            >
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
