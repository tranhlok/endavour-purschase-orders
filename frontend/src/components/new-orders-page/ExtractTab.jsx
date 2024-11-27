import { EditableCell } from "./EditableCell";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ExtractTab = ({ state, dispatch, handleSaveAndGenerateMapping }) => (
  <div className="space-y-4">
    <Button
      className="w-full"
      onClick={handleSaveAndGenerateMapping}
      disabled={state.loadingStatus.extracting || state.extractedData.length === 0 || state.loadingStatus.matching}
    >
      {state.loadingStatus.matching ? "Processing..." : "Generate Mapping"}
    </Button>
    {state.loadingStatus.extracting ? (
      <div className="flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        <p className="ml-2">Extracting data, please wait...</p>
      </div>
    ) : state.extractedData.length > 0 ? (
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300">ITM</th>
            <th className="border border-gray-300">Request Item</th>
            <th className="border border-gray-300">Quantity</th>
            <th className="border border-gray-300">UOM</th>
            <th className="border border-gray-300">Price/Unit</th>
            <th className="border border-gray-300">Amount</th>
          </tr>
        </thead>
        <tbody>
          {state.extractedData.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300">{index + 1}</td>
              <EditableCell
                value={item["REQUEST ITEM"]}
                onChange={dispatch}
                field="REQUEST ITEM"
                index={index}
              />
              <EditableCell
                value={item["QUANTITY COL"]}
                onChange={dispatch}
                field="QUANTITY COL"
                index={index}
              />
              <EditableCell
                value={item["UNIT COL"]}
                onChange={dispatch}
                field="UNIT COL"
                index={index}
              />
              <EditableCell
                value={item["PRICE"] || item["UNIT COST"]}
                onChange={dispatch}
                field="PRICE"
                index={index}
              />
              <EditableCell
                value={item["TOTAL"] || item["AMOUNT"]}
                onChange={dispatch}
                field="TOTAL"
                index={index}
              />
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No data extracted yet.</p>
    )}
  </div>
);