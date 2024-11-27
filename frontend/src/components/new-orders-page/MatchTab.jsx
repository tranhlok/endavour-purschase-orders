import { EditableCell } from "./EditableCell";
import { MatchSelectCell } from "./MatchSelectCell";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const MatchTab = ({ state, dispatch, handleSaveOrder }) => {
  const handleDownloadCSV = () => {
    // Convert the data to CSV format
    const headers = [
      "Item Number",
      "Request Item",
      "Quantity",
      "UOM",
      "Price/Unit",
      "Amount",
      "Selected Match"
    ];

    const csvData = state.extractedData.map((item, index) => [
      index + 1,
      item["REQUEST ITEM"],
      item["QUANTITY COL"],
      item["UNIT COL"],
      item["PRICE"] || item["UNIT COST"],
      item["TOTAL"] || item["AMOUNT"],
      item.selectedMatch || ""
    ]);

    // Add headers to the beginning
    csvData.unshift(headers);

    // Convert to CSV string
    const csvString = csvData
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Create blob and download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'purchase_order_data.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={handleSaveOrder}
          disabled={
            state.loadingStatus.extracting || 
            state.extractedData.length === 0 || 
            state.loadingStatus.matching ||
            state.loadingStatus.saving
          }
        >
          {state.loadingStatus.saving ? "Saving..." : "Save Purchase Order"}
        </Button>
        <Button
          variant="outline"
          onClick={handleDownloadCSV}
          disabled={state.extractedData.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>
      {state.loadingStatus.matching ? (
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          <p className="ml-2">Generating matches, please wait...</p>
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
              <th className="border border-gray-300">Matches</th>
            </tr>
          </thead>
          <tbody>
            {state.extractedData.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300">{index + 1}</td>
                <td className="border border-gray-300">{item["REQUEST ITEM"]}</td>
                <td className="border border-gray-300">{item["QUANTITY COL"]}</td>
                <td className="border border-gray-300">{item["UNIT COL"]}</td>
                <td className="border border-gray-300">{item["PRICE"] || item["UNIT COST"]}</td>
                <td className="border border-gray-300">{item["TOTAL"] || item["AMOUNT"]}</td>
                <MatchSelectCell
                  matches={item.matches}
                  selectedMatch={item.selectedMatch}
                  onChange={dispatch}
                  index={index}
                />
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No matching data available yet.</p>
      )}
    </div>
  );
};