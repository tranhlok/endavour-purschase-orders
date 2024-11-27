import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export const UploadTab = ({ 
  handleDrop, 
  openFileDialog, 
  fileInputRef, 
  handleFileSelect, 
  state, 
  handleConfirm, 
  resetForm 
}) => (
  <>
    <div
      className="border-2 border-dashed rounded-lg p-12 cursor-pointer"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={openFileDialog}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p>Drag PDF file here or click to upload.</p>
        <input
          type="file"
          className="hidden"
          accept=".pdf"
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />
      </div>
    </div>

    <div className="flex gap-4 mt-4">
      <Button
        className="flex-1"
        variant="secondary"
        disabled={state.loadingStatus.uploading || !state.requestFile}
        onClick={handleConfirm}
      >
        {state.loadingStatus.uploading ? "Uploading..." : "Confirm Details"}
      </Button>
      <Button variant="outline" className="flex-1" onClick={resetForm}>
        Clear
      </Button>
    </div>
  </>
);