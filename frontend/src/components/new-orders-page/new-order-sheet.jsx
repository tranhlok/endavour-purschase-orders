import { useState, useCallback, useRef, useReducer } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UploadTab } from "./UploadTab";
import { ExtractTab } from "./ExtractTab";
import { MatchTab } from "./MatchTab";

export function NewOrderSheet() {
  const fileInputRef = useRef(null);  // Add this line at the top of the component

  const initialState = {
    open: false,
    activeTab: "upload",
    requestFile: null,
    pdfUrl: null,
    extractedData: [],
    orderId: null,
    loadingStatus: {
      uploading: false,
      extracting: false,
      matching: false,
    },
  };

  function reducer(state, action) {
    switch (action.type) {
      case "SET_OPEN":
        return { ...state, open: action.payload };
      case "SET_ACTIVE_TAB":
        return { ...state, activeTab: action.payload };
      case "SET_FILE":
        return {
          ...state,
          requestFile: action.payload.file,
          pdfUrl: action.payload.pdfUrl,
        };
      case "SET_LOADING_STATUS":
        return {
          ...state,
          loadingStatus: {
            ...state.loadingStatus,
            [action.payload.key]: action.payload.value,
          },
        };
      case "SET_EXTRACTED_DATA":
        return { ...state, extractedData: action.payload };
      case "SET_ORDER_ID":
        return { ...state, orderId: action.payload };
      case "RESET":
        return initialState;
      case "UPDATE_EXTRACTED_DATA":
        return {
          ...state,
          extractedData: state.extractedData.map((item, index) =>
            index === action.payload.index
              ? { ...item, [action.payload.field]: action.payload.value }
              : item
          ),
        };
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  
  // const handleFileSelect = useCallback(async (file) => {
  //   if (file && file.type === "application/pdf") {
  //     const tempUrl = URL.createObjectURL(file);
  //     dispatch({ type: "SET_FILE", payload: { file, pdfUrl: tempUrl } });
      
  //     // Create form data and upload immediately
  //     const formData = new FormData();
  //     formData.append("request_file", file);

  //     try {
  //       dispatch({
  //         type: "SET_LOADING_STATUS",
  //         payload: { key: "uploading", value: true },
  //       });

  //       const response = await fetch("http://localhost:8000/api/orders", {
  //         method: "POST",
  //         body: formData,
  //       });

  //       if (!response.ok) {
  //         throw new Error(`Upload failed: ${response.statusText}`);
  //       }

  //       const result = await response.json();
  //       console.log("Upload successful:", result);
        
  //       // Store the order ID for later use
  //       dispatch({ type: "SET_ORDER_ID", payload: result.id });
        
  //     } catch (error) {
  //       console.error("Upload error:", error);
  //     } finally {
  //       dispatch({
  //         type: "SET_LOADING_STATUS",
  //         payload: { key: "uploading", value: false },
  //       });
  //     }
  //   }
  // }, [dispatch]);

  const handleFileSelect = useCallback((file) => {
    if (file && file.type === "application/pdf") {
      const tempUrl = URL.createObjectURL(file);
      // Set the file in state but do not upload yet
      dispatch({ type: "SET_FILE", payload: { file, pdfUrl: tempUrl } });
    }
  }, [dispatch]);
  

  const handleExtractData = useCallback(async () => {
    if (!state.requestFile) return;
    dispatch({
      type: "SET_LOADING_STATUS",
      payload: { key: "extracting", value: true },
    });

    const formData = new FormData();
    formData.append("file", state.requestFile);

    try {
      const response = await fetch(
        "https://plankton-app-qajlk.ondigitalocean.app/extraction_api",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Extraction failed: ${response.statusText}`);
      }

      const result = await response.json();
      dispatch({ type: "SET_EXTRACTED_DATA", payload: result.result_data });
    } catch (error) {
      console.error("Extraction error:", error);
    } finally {
      dispatch({
        type: "SET_LOADING_STATUS",
        payload: { key: "extracting", value: false },
      });
    }
  }, [state.requestFile]);

  const handleConfirm = useCallback(async () => {
    if (!state.requestFile) return;

    dispatch({
      type: "SET_LOADING_STATUS",
      payload: { key: "uploading", value: true },
    });
    const formData = new FormData();
    formData.append("request_file", state.requestFile);

    try {
      const response = await fetch("http://localhost:8000/api/orders", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Upload successful:", result);
      dispatch({ type: "SET_ORDER_ID", payload: result.id });
      dispatch({ type: "SET_ACTIVE_TAB", payload: "extract" });
      await handleExtractData();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      dispatch({
        type: "SET_LOADING_STATUS",
        payload: { key: "uploading", value: false },
      });
    }
  }, [state.requestFile, handleExtractData]);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  const handleGenerateMapping = useCallback(async () => {
    if (state.extractedData.length === 0) return;

    dispatch({
      type: "SET_LOADING_STATUS",
      payload: { key: "matching", value: true },
    });

    const queries = state.extractedData.map((item) => item["REQUEST ITEM"] || "").filter(Boolean);

    try {
      const response = await fetch(
        "https://endeavor-interview-api-gzwki.ondigitalocean.app/match/batch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ queries }),
        }
      );

      if (!response.ok) {
        throw new Error(`Matching failed: ${response.statusText}`);
      }

      const matchResults = await response.json();
      console.log("Matching successful:", matchResults);

      // Update the extractedData to include matches
      const updatedData = state.extractedData.map((item) => {
        const requestItemName = item["REQUEST ITEM"] || "";
        const matches = matchResults.results[requestItemName] || [];
        return {
          ...item,
          matches, // Add matches to each item
        };
      });

      dispatch({ type: "SET_EXTRACTED_DATA", payload: updatedData });
      dispatch({ type: "SET_ACTIVE_TAB", payload: "match" }); // Move to the match tab
    } catch (error) {
      console.error("Matching error:", error);
    } finally {
      dispatch({
        type: "SET_LOADING_STATUS",
        payload: { key: "matching", value: false },
      });
    }
  }, [state.extractedData]);

  const handleSaveItems = useCallback(async () => {
    if (!state.orderId || state.extractedData.length === 0) return false;

    try {
      const items = state.extractedData.map(item => ({
        request_item: item["REQUEST ITEM"] || "",
        quantity: parseFloat(item["QUANTITY COL"]) || 0,
        uom: item["UNIT COL"] || "",
        price_per_unit: parseFloat(item["PRICE"] || item["UNIT COST"]) || 0,
        amount: parseFloat(item["TOTAL"] || item["AMOUNT"]) || 0
      }));

      const response = await fetch(
        `http://localhost:8000/api/orders/${state.orderId}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(items),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save items: ${response.statusText}`);
      }

      const savedItems = await response.json();
      console.log("Items saved successfully:", savedItems);
      return true;
      
    } catch (error) {
      console.error("Error saving items:", error);
      return false;
    }
  }, [state.orderId, state.extractedData]);

  const handleSaveAndGenerateMapping = useCallback(async () => {
    dispatch({
      type: "SET_LOADING_STATUS",
      payload: { key: "matching", value: true },
    });

    try {
      const saveSuccess = await handleSaveItems();
      if (!saveSuccess) {
        throw new Error("Failed to save items");
      }
      await handleGenerateMapping();
    } catch (error) {
      console.error("Error in save and generate process:", error);
    } finally {
      dispatch({
        type: "SET_LOADING_STATUS",
        payload: { key: "matching", value: false },
      });
    }
  }, [handleSaveItems, handleGenerateMapping, dispatch]);

  return (
    <Sheet 
      open={state.open}
      onOpenChange={(val) => dispatch({ type: "SET_OPEN", payload: val })}
    >
      <SheetTrigger asChild>
        <Button>New Purchase Order</Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[2100px] sm:border-l"
      >
        <div className="flex gap-6 h-[calc(100vh-100px)]">
          {/* Left side - PDF Preview */}
          <div className="w-[800px] border rounded">
            {state.pdfUrl ? (
              <iframe
                src={state.pdfUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                PDF preview will appear here
              </div>
            )}
          </div>

          {/* Right side - Form and Tabs */}
          <div className="flex-1 space-y-8 py-4 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Process Order</SheetTitle>
            </SheetHeader>

            <Tabs value={state.activeTab} onValueChange={(val) => dispatch({ type: "SET_ACTIVE_TAB", payload: val })}>
              <TabsList>
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="extract">Extract</TabsTrigger>
                <TabsTrigger value="match">Match</TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <UploadTab
                  handleDrop={handleDrop}
                  openFileDialog={openFileDialog}
                  fileInputRef={fileInputRef}
                  handleFileSelect={handleFileSelect}
                  state={state}
                  handleConfirm={handleConfirm}
                  resetForm={resetForm}
                />
              </TabsContent>

              <TabsContent value="extract">
                <ExtractTab
                  state={state}
                  dispatch={dispatch}
                  handleSaveAndGenerateMapping={handleSaveAndGenerateMapping}
                />
              </TabsContent>

              <TabsContent value="match">
                <MatchTab
                  state={state}
                  dispatch={dispatch}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}