import React, { useContext, useRef, useState } from "react";
import { AppContext } from "../appContext";
import { readImageFileAsDataUrl } from "../../utils/readImageFile";

export default function DecalsPanel() {
  const { state, addDecal, updateDecal, removeDecal } = useContext(AppContext);
  const inputRef = useRef(null);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async (file) => {
    if (!file) return;
    try {
      addDecal(await readImageFileAsDataUrl(file));
      setUploadError("");
    } catch (err) {
      setUploadError(err.message);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="decals-panel">
      <p className="decals-hint">
        Add an image, then drag it anywhere on the page (in Edit Mode) to place it. It stays put at that spot.
      </p>

      <label className="editor-add-btn decals-add-btn">
        + Add decal
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e.target.files[0])}
          hidden
        />
      </label>
      {uploadError && <p className="decals-error">{uploadError}</p>}

      {state.decals.length > 0 && (
        <ul className="decals-list">
          {state.decals.map((decal) => (
            <li key={decal.id} className="decals-list-item">
              <img src={decal.image} alt="" className="decals-list-thumb" />
              <div className="decals-list-controls">
                <label className="decals-size-label">
                  Size
                  <input
                    type="range"
                    min="40"
                    max="320"
                    value={decal.width}
                    onChange={(e) => updateDecal(decal.id, { width: Number(e.target.value) })}
                  />
                </label>
                <label className="decals-size-label">
                  Rotate
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={decal.rotation}
                    onChange={(e) => updateDecal(decal.id, { rotation: Number(e.target.value) })}
                  />
                </label>
              </div>
              <button
                type="button"
                className="decals-remove-btn"
                onClick={() => removeDecal(decal.id)}
                title="Remove decal"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
