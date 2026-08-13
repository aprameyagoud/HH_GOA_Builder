// src/components/UploadView.jsx
import { useRef, useState } from "react";

function UploadView({
  photoDataUrl,
  onPhotoSelected,
  crop,
  onCropChange,
  format,
}) {
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const dragRef = useRef(null);
  const pinchRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        onPhotoSelected(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    onCropChange({ scale: 1, x: 0, y: 0 });
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const handleWheel = (e) => {
    e.preventDefault();

    const currentScale = crop?.scale || 1;

    const zoomStep = e.deltaY > 0 ? -0.05 : 0.05;
    const newScale = clamp(currentScale + zoomStep, 0.5, 3);

    onCropChange({
      ...crop,
      scale: Number(newScale.toFixed(2)),
    });
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === "touch") return;

    e.currentTarget.setPointerCapture(e.pointerId);

    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startCropX: crop?.x || 0,
      startCropY: crop?.y || 0,
    };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    onCropChange({
      ...crop,
      x: dragRef.current.startCropX + dx,
      y: dragRef.current.startCropY + dy,
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;

    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];

      dragRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startCropX: crop?.x || 0,
        startCropY: crop?.y || 0,
      };
    }

    if (e.touches.length === 2) {
      dragRef.current = null;

      pinchRef.current = {
        startDistance: getTouchDistance(e.touches),
        startScale: crop?.scale || 1,
      };
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();

    if (e.touches.length === 1 && dragRef.current) {
      const touch = e.touches[0];

      const dx = touch.clientX - dragRef.current.startX;
      const dy = touch.clientY - dragRef.current.startY;

      onCropChange({
        ...crop,
        x: dragRef.current.startCropX + dx,
        y: dragRef.current.startCropY + dy,
      });
    }

    if (e.touches.length === 2 && pinchRef.current) {
      const distance = getTouchDistance(e.touches);

      const ratio = distance / pinchRef.current.startDistance;

      const newScale = clamp(pinchRef.current.startScale * ratio, 0.5, 3);

      onCropChange({
        ...crop,
        scale: Number(newScale.toFixed(2)),
      });
    }
  };

  const handleTouchEnd = () => {
    dragRef.current = null;
    pinchRef.current = null;
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.8rem",
        }}
      >
        <h3
          style={{
            fontFamily: "Victor Mono",
            fontSize: "1rem",
            color: "var(--hh-yellow)",
            margin: 0,
          }}
        >
          {format === "pfp"
            ? "1. YOUR PFP PHOTO"
            : format === "team_frame"
              ? "1. YOUR CREW PHOTO"
              : "1. YOUR PHOTO"}
        </h3>
        {photoDataUrl && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "0.3rem 0.8rem",
              fontSize: "0.75rem",
              backgroundColor: "var(--hh-yellow)",
            }}
          >
            CHANGE PHOTO
          </button>
        )}
      </div>

      {!photoDataUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: "3px dashed var(--hh-yellow)",
            padding: "2.5rem 1.5rem",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: "rgba(0, 0, 0, 0.25)",
            transition: "border-color 0.2s",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🌴</div>
          <span
            style={{
              fontFamily: "Imbue",
              fontSize: "2.4rem",
              color: "var(--hh-yellow)",
              display: "block",
              lineHeight: 1,
            }}
          >
            UPLOAD PHOTO
          </span>
          <p
            style={{
              fontFamily: "Victor Mono",
              fontSize: "0.85rem",
              margin: "0.5rem 0",
              color: "var(--hh-white)",
            }}
          >
            JPG, PNG, WebP, HEIC supported
          </p>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "var(--hh-magenta)",
              color: "var(--hh-white)",
              padding: "0.2rem 0.6rem",
              fontSize: "0.7rem",
              fontFamily: "Victor Mono",
              fontWeight: 700,
              marginTop: "0.5rem",
            }}
          >
            YOUR PHOTO STAYS ON YOUR DEVICE
          </div>
        </div>
      ) : (
        <div
          style={{
            border: "2px solid var(--hh-yellow)",
            padding: "1rem",
            backgroundColor: "rgba(0, 0, 0, 0.35)",
          }}
        >
          {/* Adjust controls */}
          {/* Photo preview and controls */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div
              style={{
  width: "min(100%, 240px)",
  aspectRatio: "322 / 464",
  margin: "0 auto 1rem",
  overflow: "hidden",
  position: "relative",
  backgroundColor: "var(--hh-black)",
  border: "2px solid var(--hh-yellow)",
  cursor: "grab",
  touchAction: "none",
  userSelect: "none",
}}
            >
              <img
                src={photoDataUrl}
                alt="Crop preview"
                draggable={false}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `
        translate(${crop?.x || 0}px, ${crop?.y || 0}px)
        scale(${crop?.scale || 1})
      `,
                  transformOrigin: "center center",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            </div>
            <button
              type="button"
              onClick={() =>
                onCropChange({
                  ...crop,
                  scale: 1,
                  x: 0,
                  y: 0,
                })
              }
              style={{
                padding: "0.7rem 1.4rem",
                backgroundColor: "var(--hh-cream)",
                color: "var(--hh-black)",
                border: "2px solid var(--hh-black)",
                fontFamily: "Victor Mono",
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: "4px 4px 0 var(--hh-black)",
              }}
            >
              RESET
            </button>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp, image/heic, image/heif"
        style={{ display: "none" }}
      />
    </div>
  );
}

export default UploadView;
