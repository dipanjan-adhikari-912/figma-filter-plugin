import { useEffect, useMemo, useRef, useState } from "react";
import type {
  MainToUiMessage,
  SelectionInfo,
  UiToMainMessage
} from "../shared/messages";
import type { FilterCategory, FilterDescriptor, FilterId } from "../shared/filterTypes";
import { processImageOnCanvas } from "./processing/canvasProcessor";

function sendToMain(message: UiToMainMessage): void {
  parent.postMessage({ pluginMessage: message }, "*");
}

export default function App() {
  const [categories, setCategories] = useState<FilterCategory[]>([]);
  const [filters, setFilters] = useState<FilterDescriptor[]>([]);
  const [activeTab, setActiveTab] = useState<"Apply Filters" | "Settings" | "About">("Apply Filters");
  const [chosenEffects, setChosenEffects] = useState<FilterId[]>([]);
  const [showEffectsList, setShowEffectsList] = useState(false);
  const [selection, setSelection] = useState<SelectionInfo>({ state: "none" });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [basePreviewBytes, setBasePreviewBytes] = useState<Uint8Array | null>(null);
  const [saveAsNewImage, setSaveAsNewImage] = useState(false);
  const [statusText, setStatusText] = useState("Waiting for plugin runtime...");
  const [isProcessing, setIsProcessing] = useState(false);
  const previewRequestRef = useRef(0);

  useEffect(() => {
    const onMessage = (event: MessageEvent<{ pluginMessage?: MainToUiMessage }>) => {
      const message = event.data?.pluginMessage;
      if (!message) {
        return;
      }

      switch (message.type) {
        case "FILTER_CATALOG": {
          setCategories(message.payload.categories);
          setFilters(message.payload.filters);
          setChosenEffects((prev) =>
            prev.length === 0 && message.payload.filters[0] ? [message.payload.filters[0].id] : prev
          );
          setStatusText("Filter catalog loaded.");
          break;
        }
        case "SELECTION_STATUS": {
          setSelection(message.payload);
          break;
        }
        case "SELECTION_PREVIEW": {
          const bytes = message.payload.imageBytes;
          const uint8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
          setBasePreviewBytes(uint8);
          break;
        }
        case "PROCESSING_ACK": {
          setStatusText(message.payload.message);
          break;
        }
        case "PROCESS_IMAGE": {
          setIsProcessing(true);
          setStatusText(`Processing "${message.payload.filterId}"...`);
          processImageOnCanvas(message.payload.filterId, message.payload.imageBytes)
            .then((processedBytes) => {
              sendToMain({
                type: "PROCESSING_RESULT",
                payload: {
                  requestId: message.payload.requestId,
                  filterId: message.payload.filterId,
                  success: true,
                  imageBytes: processedBytes,
                  mimeType: "image/png"
                }
              });
            })
            .catch((error) => {
              sendToMain({
                type: "PROCESSING_RESULT",
                payload: {
                  requestId: message.payload.requestId,
                  filterId: message.payload.filterId,
                  success: false,
                  error: error instanceof Error ? error.message : "UI canvas processing failed."
                }
              });
            })
            .finally(() => {
              setIsProcessing(false);
            });
          break;
        }
        case "ERROR": {
          setStatusText(message.payload.message);
          break;
        }
        default: {
          const unknownMessage = message as never;
          void unknownMessage;
        }
      }
    };

    window.addEventListener("message", onMessage);
    sendToMain({ type: "LIST_FILTERS" });
    sendToMain({ type: "GET_SELECTION" });

    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!basePreviewBytes) {
      setPreviewUrl((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous);
        }
        return null;
      });
      return;
    }

    const requestId = previewRequestRef.current + 1;
    previewRequestRef.current = requestId;

    const renderPreview = async () => {
      let currentBytes: Uint8Array = basePreviewBytes;
      for (const filterId of chosenEffects) {
        currentBytes = await processImageOnCanvas(filterId, currentBytes);
      }

      if (previewRequestRef.current !== requestId) {
        return;
      }

      const blobUrl = URL.createObjectURL(new Blob([currentBytes], { type: "image/png" }));
      setPreviewUrl((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous);
        }
        return blobUrl;
      });
    };

    renderPreview().catch((error) => {
      if (previewRequestRef.current !== requestId) {
        return;
      }
      setStatusText(error instanceof Error ? error.message : "Failed to render preview.");
    });
  }, [basePreviewBytes, chosenEffects]);

  const groupedFilters = useMemo(
    () =>
      categories.map((category) => ({
        category,
        effects: filters.filter((filter) => filter.category === category)
      })),
    [categories, filters]
  );

  function addEffect(filterId: FilterId) {
    setChosenEffects((previous) => {
      if (previous.includes(filterId)) {
        return previous;
      }
      if (previous.length >= 3) {
        setStatusText("You can stack up to 3 effects.");
        return previous;
      }
      return [...previous, filterId];
    });
    setShowEffectsList(false);
  }

  function removeEffect(filterId: FilterId) {
    setChosenEffects((previous) => previous.filter((id) => id !== filterId));
  }

  function applyStackedEffects() {
    if (chosenEffects.length === 0) {
      setStatusText("Add at least one effect.");
      return;
    }
    sendToMain({
      type: "APPLY_FILTER_STACK",
      payload: {
        filterIds: chosenEffects,
        saveAsNewImage
      }
    });
  }

  return (
    <main className="relative flex h-screen bg-neutral-950 text-neutral-100">
      <section className="flex flex-1 items-center justify-center border-r border-neutral-800 bg-neutral-900 p-4">
        {previewUrl ? (
          <img src={previewUrl} alt="Selection preview" className="max-h-full max-w-full rounded-md object-contain" />
        ) : (
          <div className="text-sm text-neutral-400">Select an image-filled layer to preview.</div>
        )}
      </section>

      <section className="flex w-[360px] flex-col p-4">
        <header className="mb-3">
          <h1 className="text-lg font-semibold">Control Panel</h1>
          <div className="mt-2 flex gap-2 text-xs">
            {(["Apply Filters", "Settings", "About"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`rounded-md px-3 py-1.5 ${
                  activeTab === tab
                    ? "bg-neutral-200 text-neutral-900"
                    : "border border-neutral-700 text-neutral-300"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {activeTab === "Apply Filters" ? (
          <>
            <div className="mb-3 rounded-md border border-neutral-800 bg-neutral-900 p-3 text-sm">
              <p className="font-medium">Selection status: {selection.state}</p>
              <p className="mt-1 text-xs text-neutral-400">
                {selection.nodeName
                  ? `${selection.nodeName} (${Math.round(selection.width ?? 0)} x ${Math.round(
                      selection.height ?? 0
                    )})`
                  : selection.reason ?? "No image selected."}
              </p>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Applied Effects ({chosenEffects.length}/3)</p>
              <button
                type="button"
                className="rounded-md border border-neutral-700 px-2 py-1 text-sm"
                onClick={() => setShowEffectsList(true)}
                disabled={chosenEffects.length >= 3}
              >
                +
              </button>
            </div>
            <div className="mb-4 grid gap-2">
              {chosenEffects.length === 0 ? (
                <p className="text-xs text-neutral-400">No effects selected.</p>
              ) : (
                chosenEffects.map((effectId) => {
                  const effect = filters.find((item) => item.id === effectId);
                  return (
                    <div
                      key={effectId}
                      className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
                    >
                      <span>
                        {effect?.name ?? effectId}
                        {effect?.premium ? " (Premium)" : ""}
                      </span>
                      <button type="button" className="text-neutral-400" onClick={() => removeEffect(effectId)}>
                        Remove
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-auto flex items-center gap-2">
              <button
                type="button"
                className="rounded-md bg-neutral-200 px-3 py-2 text-sm font-medium text-neutral-900"
                onClick={applyStackedEffects}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Apply stack"}
              </button>
              <button
                type="button"
                className="rounded-md border border-neutral-700 px-3 py-2 text-sm text-neutral-200"
                onClick={() => sendToMain({ type: "GET_SELECTION" })}
                disabled={isProcessing}
              >
                Refresh
              </button>
            </div>
          </>
        ) : null}

        {activeTab === "Settings" ? (
          <div className="grid gap-3 text-sm">
            <label className="flex items-start gap-2 rounded-md border border-neutral-800 bg-neutral-900 p-3">
              <input
                type="checkbox"
                checked={saveAsNewImage}
                onChange={(event) => setSaveAsNewImage(event.target.checked)}
                className="mt-0.5"
              />
              <span>
                If enabled, save result as a new image. If disabled, result is added to fills.
              </span>
            </label>
            <button
              type="button"
              className="rounded-md border border-neutral-700 px-3 py-2 text-left text-sm"
              onClick={() => sendToMain({ type: "SET_RELUNCH_ON_SELECTION" })}
            >
              Add quick launch button to selected layer
            </button>
          </div>
        ) : null}

        {activeTab === "About" ? (
          <div className="rounded-md border border-neutral-800 bg-neutral-900 p-3 text-sm text-neutral-300">
            Modular effect stacker for modern image looks. Add up to 3 effects and apply in order.
          </div>
        ) : null}

        <p className="mt-3 text-xs text-neutral-400">{statusText}</p>
      </section>

      {showEffectsList ? (
        <div className="absolute inset-0 z-20 flex justify-end bg-black/50">
          <div className="h-full w-[360px] border-l border-neutral-800 bg-neutral-950 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Add Effect</h2>
              <button type="button" className="text-neutral-300" onClick={() => setShowEffectsList(false)}>
                x
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto pr-1 text-sm">
              {groupedFilters.map((group) => (
                <div key={group.category}>
                  <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">
                    {group.category}
                  </p>
                  <div className="grid gap-1">
                    {group.effects.map((effect) => (
                      <button
                        key={effect.id}
                        type="button"
                        className="rounded-md border border-neutral-800 px-3 py-2 text-left hover:border-neutral-600"
                        onClick={() => addEffect(effect.id)}
                      >
                        {effect.name}
                        {effect.premium ? " (Premium)" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {isProcessing ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="rounded-md border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm">
            Applying filter...
          </div>
        </div>
      ) : null}
    </main>
  );
}
