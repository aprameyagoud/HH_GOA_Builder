// src/components/PreviewShare.jsx
import { useEffect, useRef, useState } from "react";

function PreviewShare({
  blob,
  previewSvg,
  format,
  isGenerating,
  onRenderCurrentGraphic,
  crop,
  onCropChange,
}) {
  const [shareStep, setShareStep] = useState(""); // '', 'generating', 'preparing', 'opening'
  const [errorMessage, setErrorMessage] = useState("");
  const previewRef = useRef(null);
  const dragRef = useRef(null);
  const pinchRef = useRef(null);
  const interactionCropRef = useRef(crop);
  const frameRef = useRef(null);

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const getPhotoDimensions = () => {
    switch (format) {
      case "pfp":
        return {
          width: 1080,
          height: 1080,
          centerX: 540,
          centerY: 540,
        };

      case "team_frame":
        return {
          width: 461,
          height: 317,
          centerX: 230.5,
          centerY: 158.5,
        };

      case "builder_id":
      default:
        return {
          width: 322,
          height: 464,
          centerX: 161,
          centerY: 232,
        };
    }
  };

  const getPatternId = () => {
    if (format === "pfp") return "pattern0_61_6017";
    if (format === "team_frame") return "pattern10_99_2142";
    return "pattern5_92_760";
  };

  const updatePhotoPreview = (nextCrop) => {
    interactionCropRef.current = nextCrop;

    const svg = previewRef.current?.querySelector("svg");
    if (!svg) return;

    const photo = svg.querySelector(`#${getPatternId()} image`);
    if (!photo) return;

    const { centerX, centerY } = getPhotoDimensions();

    const scale = nextCrop.scale || 1;
    const x = nextCrop.x || 0;
    const y = nextCrop.y || 0;

    /*
     * Keep the original image dimensions.
     * Only transform the existing image.
     *
     * This prevents the image from flashing/filling
     * the entire frame while dragging.
     */
    photo.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);

    /*
     * The image is originally centered around 0
     * by the SVG template, so we don't change
     * width/height during interaction.
     */
  };

  const handleWheel = (e) => {
    e.preventDefault();

    const currentScale = interactionCropRef.current?.scale || 1;
    const zoomStep = e.deltaY > 0 ? -0.05 : 0.05;

    const nextScale = clamp(currentScale + zoomStep, 0.5, 3);

    updatePhotoInPreview({
      ...interactionCropRef.current,
      scale: Number(newScale.toFixed(2)),
    });
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === "touch") return;

    const currentCrop = interactionCropRef.current || crop;

    e.currentTarget.setPointerCapture(e.pointerId);

    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startCropX: currentCrop?.x || 0,
      startCropY: currentCrop?.y || 0,
    };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;

    const container = previewRef.current;
    const svg = container?.querySelector("svg");

    if (!container || !svg) return;

    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox?.baseVal;

    if (!viewBox || !rect.width || !rect.height) return;

    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;

    const dx = (e.clientX - dragRef.current.startX) * scaleX;

    const dy = (e.clientY - dragRef.current.startY) * scaleY;

    const nextCrop = {
      ...interactionCropRef.current,
      x: dragRef.current.startCropX + dx,
      y: dragRef.current.startCropY + dy,
    };

    updatePhotoPreview(nextCrop);
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current) return;

    const finalCrop = interactionCropRef.current;

    onCropChange(finalCrop);

    dragRef.current = null;

    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;

    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    const currentCrop = interactionCropRef.current || crop;

    if (e.touches.length === 1) {
      const touch = e.touches[0];

      dragRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startCropX: currentCrop?.x || 0,
        startCropY: currentCrop?.y || 0,
      };

      pinchRef.current = null;
    }

    if (e.touches.length === 2) {
      dragRef.current = null;

      pinchRef.current = {
        startDistance: getTouchDistance(e.touches),
        startScale: currentCrop?.scale || 1,
      };
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();

    const container = previewRef.current;
    const svg = container?.querySelector("svg");

    if (!container || !svg) return;

    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox?.baseVal;

    if (!viewBox || !rect.width || !rect.height) return;

    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;

    // ONE FINGER = DRAG
    if (e.touches.length === 1 && dragRef.current) {
      const touch = e.touches[0];

      const dx = (touch.clientX - dragRef.current.startX) * scaleX;

      const dy = (touch.clientY - dragRef.current.startY) * scaleY;

      const nextCrop = {
        ...interactionCropRef.current,
        x: dragRef.current.startCropX + dx,
        y: dragRef.current.startCropY + dy,
      };

      updatePhotoPreview(nextCrop);
    }

    // TWO FINGERS = PINCH ZOOM
    if (e.touches.length === 2 && pinchRef.current) {
      const distance = getTouchDistance(e);

      const ratio = distance / pinchRef.current.startDistance;

      const nextScale = clamp(pinchRef.current.startScale * ratio, 0.5, 3);

      updatePhotoPreview({
        ...interactionCropRef.current,
        scale: Number(nextScale.toFixed(2)),
      });
    }
  };

  const handleTouchEnd = () => {
    dragRef.current = null;
    pinchRef.current = null;
  };

  useEffect(() => {
    interactionCropRef.current = crop;

    const svg = previewRef.current?.querySelector("svg");
    if (!svg) return;

    const photo = svg.querySelector(`#${getPatternId()} image`);
    if (!photo) return;

    const scale = crop?.scale || 1;
    const x = crop?.x || 0;
    const y = crop?.y || 0;

    photo.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
  }, [previewSvg, format]);

  const getCaption = () => {
    switch (format) {
      case "pfp":
        return "Framed for HH Goa 2026. 🌴 #FrameInGoa";
      case "builder_id":
        return "Got my HH Goa 2026 Builder ID. 🌴 #FrameInGoa";
      case "team_frame":
        return "Our crew is framed for HH Goa 2026. 🌴 #FrameInGoa";
      default:
        return "Framed for HH Goa 2026. 🌴 #FrameInGoa";
    }
  };

  // Convert Blob to base64 Data URL
  const blobToBase64 = (b) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(b);
    });
  };

  // Ensure we have the latest rendered Blob
  const getActiveBlob = async () => {
    if (blob && !isGenerating) return blob;
    if (typeof onRenderCurrentGraphic === "function") {
      return await onRenderCurrentGraphic();
    }
    return blob;
  };

  const handleDownload = async () => {
    setErrorMessage("");
    const targetBlob = await getActiveBlob();
    if (!targetBlob) {
      setErrorMessage("Couldn't generate your frame. Please try again.");
      return;
    }

    const filename = getFilename();
    const url = URL.createObjectURL(targetBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    setErrorMessage("");

    // Step 1: GENERATING...
    setShareStep("generating");
    let targetBlob = null;
    try {
      targetBlob = await getActiveBlob();
      if (!targetBlob) {
        throw new Error("No blob rendered");
      }
    } catch (err) {
      console.error("Render error during share:", err);
      setErrorMessage("Couldn't generate your frame. Please try again.");
      setShareStep("");
      return;
    }

    const caption = getCaption();
    const filename = getFilename();

    // ALWAYS generate a Shareable Link with actual OG image and open X intent
    setShareStep("preparing");

    let shareUrl = "";
    try {
      const base64Data = await blobToBase64(targetBlob);

      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format,
          caption,
          imageBase64: base64Data,
        }),
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      shareUrl = data.shareUrl || `${window.location.origin}/share/${data.id}`;
    } catch (err) {
      console.error("Share link creation failed:", err);
      setErrorMessage("Couldn't create the share link. Please try again.");
      setShareStep("");
      return;
    }

    // Step 3: OPENING X...
    setShareStep("opening");

    try {
      const xPostText = `${caption}\n\n${shareUrl}`;
      const xIntentUrl = `https://x.com/intent/post?text=${encodeURIComponent(xPostText)}`;

      const newWindow = window.open(
        xIntentUrl,
        "_blank",
        "noopener,noreferrer",
      );
      if (!newWindow) {
        // Pop-up blocker fallback: navigate or inform user
        window.location.href = xIntentUrl;
      }
    } catch (e) {
      console.error("Failed to open X compose:", e);
    }

    // Reset button text after small delay
    setTimeout(() => {
      setShareStep("");
    }, 1500);
  };

  const getShareButtonText = () => {
    switch (shareStep) {
      case "generating":
        return "GENERATING...";
      case "preparing":
        return "PREPARING SHARE...";
      case "opening":
        return "OPENING X...";
      default:
        return "SHARE TO X 🌴";
    }
  };

  const isBusy = isGenerating || !!shareStep;

  return (
    <div
      style={{
        marginTop: "2.8rem",
        padding: "1.5rem",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        border: "3px solid var(--hh-yellow)",
        boxShadow: "6px 6px 0px var(--hh-black)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3
          style={{
            fontFamily: "Victor Mono",
            fontSize: "1.1rem",
            color: "var(--hh-yellow)",
            margin: 0,
          }}
        >
          3. GENERATED OUTPUT
        </h3>
        <span
          style={{
            fontSize: "0.75rem",
            fontFamily: "Victor Mono",
            color: "var(--hh-magenta)",
            fontWeight: 700,
          }}
        >
          LIVE CLIENT-SIDE RENDER
        </span>
      </div>

      {/* SVG / Canvas Preview */}
      <div
        ref={previewRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: "100%",
          aspectRatio: format === "pfp" ? "1 / 1" : "16 / 9",
          backgroundColor: "var(--hh-dark-green)",
          border: "3px solid var(--hh-black)",
          marginBottom: "1.5rem",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "4px 4px 0px var(--hh-black)",
          cursor: "grab",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {previewSvg ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            dangerouslySetInnerHTML={{ __html: previewSvg }}
          />
        ) : (
          <div
            style={{
              color: "var(--hh-yellow)",
              fontFamily: "Victor Mono",
              fontSize: "0.9rem",
            }}
          >
            {isGenerating
              ? "Rendering graphic..."
              : "Click Generate to preview"}
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: "var(--hh-magenta)",
            color: "var(--hh-white)",
            padding: "0.8rem 1rem",
            fontFamily: "Victor Mono",
            fontSize: "0.9rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "1.2rem",
            border: "2px solid var(--hh-black)",
            boxShadow: "3px 3px 0px var(--hh-black)",
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Action Buttons */}
      <div
        className="preview-actions"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <button
          type="button"
          onClick={handleDownload}
          disabled={isBusy || !blob}
          style={{
            padding: "1rem",
            fontSize: "1.1rem",
            backgroundColor: "var(--hh-yellow)",
            color: "var(--hh-black)",
            opacity: isBusy || !blob ? 0.6 : 1,
            cursor: isBusy || !blob ? "not-allowed" : "pointer",
          }}
        >
          DOWNLOAD PNG
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="primary"
          disabled={isBusy}
          style={{
            padding: "1rem",
            fontSize: "1.1rem",
            opacity: isBusy ? 0.8 : 1,
            cursor: isBusy ? "wait" : "pointer",
            transition: "background-color 0.2s, transform 0.1s",
          }}
        >
          {getShareButtonText()}
        </button>
      </div>
    </div>
  );
}

export default PreviewShare;
